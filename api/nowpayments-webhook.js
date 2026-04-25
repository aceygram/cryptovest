import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // we'll add this next
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  // Verify the webhook signature
  const signature = req.headers['x-nowpayments-sig']
  const secret = process.env.NOWPAYMENTS_IPN_SECRET

  const sortedBody = JSON.stringify(sortObject(req.body))
  const hmac = crypto.createHmac('sha512', secret).update(sortedBody).digest('hex')

  if (hmac !== signature) {
    console.error('Invalid webhook signature')
    return res.status(401).send('Unauthorized')
  }

  const { payment_status, order_id, actually_paid, pay_currency } = req.body

  // Only process finished payments
  if (payment_status !== 'finished') return res.status(200).send('OK')

  // Find the pending transaction by order_id (which we set as the transaction ID)
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*, profiles(balance)')
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

  return res.status(200).send('OK')
}

// NOWPayments requires keys sorted alphabetically before hashing
function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key] && typeof obj[key] === 'object' ? sortObject(obj[key]) : obj[key]
    return result
  }, {})
}