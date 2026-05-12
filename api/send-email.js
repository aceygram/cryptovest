// /api/send-email.js  — Vercel Serverless Function
// Place this file at: /api/send-email.js in your project root
//
// Required env var in Vercel dashboard:
//   BREVO_API_KEY  (no VITE_ prefix — this is server-only, never exposed to the browser)
//   SENDER_EMAIL   (your verified Brevo sender, e.g. no-reply@sentienttrade.com)

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to_email, to_name, subject, html_content } = req.body

  // Basic validation
  if (!to_email || !subject || !html_content) {
    return res.status(400).json({ error: 'Missing required fields: to_email, subject, html_content' })
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY
  const SENDER_EMAIL = process.env.SENDER_EMAIL || 'no-reply@sentienttrade.com'

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY env var is not set')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'SentientTrade',
          email: SENDER_EMAIL
        },
        to: [{ email: to_email, name: to_name || '' }],
        subject,
        htmlContent: html_content
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Brevo API error:', err)
      return res.status(502).json({ error: 'Email provider error', details: err })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('send-email handler error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}