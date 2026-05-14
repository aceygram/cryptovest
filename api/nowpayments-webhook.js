// api/nowpayments-webhook.js — Vercel Serverless Function
//
// Required env vars in Vercel dashboard:
//   SUPABASE_URL              (same as VITE_SUPABASE_URL — no VITE prefix needed server-side)
//   SUPABASE_SERVICE_ROLE_KEY
//   NOWPAYMENTS_IPN_SECRET
//   BREVO_API_KEY             (no VITE prefix — server-only)
//   SENDER_EMAIL              (your verified Brevo sender email)
//
// ⚠️  IMPORTANT — Raw Body for HMAC Verification:
//   NowPayments signs the raw request body. You must disable Vercel's automatic
//   JSON body parsing for this route so you get the raw bytes for HMAC verification.
//   Add this export to opt out of body parsing:

export const config = {
  api: {
    bodyParser: false  // We parse manually below to get the raw body for HMAC
  }
}

import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Read raw body from the request stream
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  const signature = req.headers['x-nowpayments-sig']
  const secret = process.env.NOWPAYMENTS_IPN_SECRET

  if (!secret) {
    console.error('NOWPAYMENTS_IPN_SECRET not set')
    return res.status(500).send('Server misconfigured')
  }

  // Read and parse raw body
  const rawBody = await getRawBody(req)
  let parsedBody
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    return res.status(400).send('Invalid JSON')
  }

  // NowPayments HMAC: sort the parsed object, re-stringify, then sign
  const sortedBody = JSON.stringify(sortObject(parsedBody))
  const hmac = crypto.createHmac('sha512', secret).update(sortedBody).digest('hex')

  if (hmac !== signature) {
    console.error('Invalid webhook signature')
    return res.status(401).send('Unauthorized')
  }

  const { payment_status, order_id, pay_currency, price_amount } = parsedBody

  // Only process fully completed payments
  if (payment_status !== 'finished') return res.status(200).send('OK')

  // Fetch the transaction and join the user's profile
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*, profiles(id, balance, full_name, email)')
    .eq('id', order_id)
    .eq('status', 'pending')
    .single()

  if (error || !transaction) {
    console.error('Transaction not found or already processed:', order_id, error)
    // Return 200 so NowPayments doesn't keep retrying for a missing/duplicate event
    return res.status(200).send('OK')
  }

  // Mark transaction as confirmed
  const { error: txError } = await supabase
    .from('transactions')
    .update({ status: 'confirmed', crypto_currency: pay_currency })
    .eq('id', order_id)

  if (txError) {
    console.error('Failed to confirm transaction:', txError)
    return res.status(500).send('DB error')
  }

  // Credit user balance
  const currentBalance = transaction.profiles?.balance || 0
  const { error: balanceError } = await supabase
    .from('profiles')
    .update({ balance: currentBalance + transaction.amount })
    .eq('id', transaction.user_id)

  if (balanceError) {
    console.error('Failed to credit balance:', balanceError)
    // Transaction is already confirmed — log this but don't return 500
    // (otherwise NowPayments retries and you'd double-credit)
  }

  // Send deposit confirmation email via Brevo (server-side — no CORS issues)
  const profile = transaction.profiles
  if (profile?.email) {
    const BREVO_API_KEY = process.env.BREVO_API_KEY
    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@sentienttrade.online'
    const APP_URL = process.env.APP_URL || ''

    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY not set — skipping deposit email')
    } else {
      try {
        const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'SentientTrade', email: SENDER_EMAIL },
            to: [{ email: profile.email, name: profile.full_name || '' }],
            subject: '✅ Deposit Confirmed — SentientTrade',
            htmlContent: `
              <div style="font-family: Arial, sans-serif; background: #0a0f1e; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #00ff88; font-size: 28px; margin: 0;">💰 SentientTrade</h1>
                </div>
                <div style="background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #1f2937;">
                  <h2 style="color: #00ff88; margin-top: 0;">Deposit Confirmed!</h2>
                  <p style="color: #9ca3af;">Hi ${profile.full_name},</p>
                  <p style="color: #9ca3af;">Your deposit has been confirmed and your balance has been credited.</p>
                  <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">Amount Credited</p>
                    <p style="color: #00ff88; font-size: 32px; font-weight: bold; margin: 8px 0;">$${transaction.amount}</p>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">via ${pay_currency?.toUpperCase()}</p>
                  </div>
                  <p style="color: #9ca3af;">You can now browse and activate investment plans to start earning.</p>
                  <div style="text-align: center; margin-top: 25px;">
                    <a href="${APP_URL}/plans"
                       style="background: #00ff88; color: #0a0f1e; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                      Browse Plans
                    </a>
                  </div>
                </div>
                <p style="color: #374151; text-align: center; font-size: 12px; margin-top: 20px;">
                  © 2026 SentientTrade. This is an automated message.
                </p>
              </div>
            `
          })
        })

        if (!emailRes.ok) {
          const errBody = await emailRes.json()
          console.error('Brevo error on deposit email:', errBody)
        }
      } catch (emailErr) {
        console.error('Failed to send deposit email:', emailErr)
      }
    }
  }

  console.log(`Deposit confirmed: $${transaction.amount} credited to user ${transaction.user_id}`)
  return res.status(200).send('OK')
}

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key] && typeof obj[key] === 'object' ? sortObject(obj[key]) : obj[key]
    return result
  }, {})
}