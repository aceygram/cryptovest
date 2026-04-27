import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const signature = req.headers['x-nowpayments-sig']
  const secret = process.env.NOWPAYMENTS_IPN_SECRET

  const sortedBody = JSON.stringify(sortObject(req.body))
  const hmac = crypto.createHmac('sha512', secret).update(sortedBody).digest('hex')

  if (hmac !== signature) {
    console.error('Invalid webhook signature')
    return res.status(401).send('Unauthorized')
  }

  const { payment_status, order_id, pay_currency } = req.body

  if (payment_status !== 'finished') return res.status(200).send('OK')

  // Now also fetching full_name and email from profiles
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*, profiles(balance, full_name, email)')
    .eq('id', order_id)
    .eq('status', 'pending')
    .single()

  if (error || !transaction) {
    console.error('Transaction not found:', order_id)
    return res.status(200).send('OK')
  }

  // Update transaction to confirmed
  await supabase.from('transactions').update({
    status: 'confirmed',
    crypto_currency: pay_currency
  }).eq('id', order_id)

  // Credit user balance
  const newBalance = (transaction.profiles.balance || 0) + transaction.amount
  await supabase.from('profiles').update({
    balance: newBalance
  }).eq('id', transaction.user_id)

  // Send deposit confirmed email via Brevo
  if (transaction.profiles?.email) {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.VITE_BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'CryptoVest', email: 'ace4facebook@gmail.com' },
        to: [{ email: transaction.profiles.email, name: transaction.profiles.full_name }],
        subject: '✅ Deposit Confirmed — CryptoVest',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; background: #0a0f1e; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
            <h1 style="color: #00ff88; text-align: center;">💰 CryptoVest</h1>
            <div style="background: #111827; padding: 30px; border-radius: 12px;">
              <h2 style="color: #00ff88;">Deposit Confirmed!</h2>
              <p style="color: #9ca3af;">Hi ${transaction.profiles.full_name},</p>
              <p style="color: #9ca3af;">Your deposit has been confirmed and your balance has been credited.</p>
              <div style="background: #1f2937; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">Amount Credited</p>
                <p style="color: #00ff88; font-size: 32px; font-weight: bold; margin: 8px 0;">$${transaction.amount}</p>
                <p style="color: #6b7280; margin: 0; font-size: 14px;">via ${pay_currency.toUpperCase()}</p>
              </div>
              <p style="color: #9ca3af;">You can now browse and activate investment plans to start earning.</p>
            </div>
            <p style="color: #374151; text-align: center; font-size: 12px; margin-top: 20px;">© 2025 CryptoVest. This is an automated message.</p>
          </div>
        `
      })
    })
  }

  return res.status(200).send('OK')
}

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key] && typeof obj[key] === 'object' ? sortObject(obj[key]) : obj[key]
    return result
  }, {})
}