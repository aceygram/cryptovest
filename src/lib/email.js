// lib/email.js
// Calls your own Vercel API route (/api/send-email) instead of Brevo directly.
// This fixes the CORS block and keeps BREVO_API_KEY off the client bundle.

const APP_URL = import.meta.env.APP_URL || ''
// Set APP_URL in your .env:
//    APP_URL=https://yourapp.vercel.app
// Leave empty for relative URLs (works fine on the same domain)

export const sendEmail = async ({ to_email, to_name, subject, html_content }) => {
  try {
    const response = await fetch(`${APP_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_email, to_name, subject, html_content })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('sendEmail error:', err)
    }
  } catch (err) {
    console.error('sendEmail failed:', err)
  }
}

// ─── Email Templates ────────────────────────────────────────────────────────
// Replace APP_URL in .env and all links below will be correct automatically.

export const emailTemplates = {

  depositConfirmed: ({ name, amount, currency }) => ({
    subject: '✅ Deposit Confirmed — SentientTrade',
    html_content: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00ff88; font-size: 28px; margin: 0;">💰 SentientTrade</h1>
        </div>
        <div style="background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #1f2937;">
          <h2 style="color: #00ff88; margin-top: 0;">Deposit Confirmed!</h2>
          <p style="color: #9ca3af;">Hi ${name},</p>
          <p style="color: #9ca3af;">Your deposit has been confirmed and your balance has been credited.</p>
          <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Amount Credited</p>
            <p style="color: #00ff88; font-size: 32px; font-weight: bold; margin: 8px 0;">$${amount}</p>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">via ${currency.toUpperCase()}</p>
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
  }),

  withdrawalApproved: ({ name, amount, currency, wallet }) => ({
    subject: '✅ Withdrawal Approved — SentientTrade',
    html_content: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00ff88; font-size: 28px; margin: 0;">💰 SentientTrade</h1>
        </div>
        <div style="background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #1f2937;">
          <h2 style="color: #00ff88; margin-top: 0;">Withdrawal Approved!</h2>
          <p style="color: #9ca3af;">Hi ${name},</p>
          <p style="color: #9ca3af;">Your withdrawal request has been approved and is being processed.</p>
          <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Amount</span>
              <span style="color: #fff; font-weight: bold;">$${amount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #6b7280;">Coin</span>
              <span style="color: #fff; font-weight: bold;">${currency.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Wallet</span>
              <span style="color: #00ff88; font-size: 13px;">${wallet?.slice(0, 10)}...${wallet?.slice(-6)}</span>
            </div>
          </div>
          <p style="color: #9ca3af;">Please allow up to 24 hours for the crypto to arrive in your wallet.</p>
        </div>
        <p style="color: #374151; text-align: center; font-size: 12px; margin-top: 20px;">
          © 2026 SentientTrade. This is an automated message.
        </p>
      </div>
    `
  }),

  withdrawalRejected: ({ name, amount }) => ({
    subject: '❌ Withdrawal Rejected — SentientTrade',
    html_content: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00ff88; font-size: 28px; margin: 0;">💰 SentientTrade</h1>
        </div>
        <div style="background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #1f2937;">
          <h2 style="color: #ef4444; margin-top: 0;">Withdrawal Rejected</h2>
          <p style="color: #9ca3af;">Hi ${name},</p>
          <p style="color: #9ca3af;">Your withdrawal request of <strong style="color: #fff;">$${amount}</strong> has been rejected.</p>
          <div style="background: #ef444411; border: 1px solid #ef444433; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #ef4444; margin: 0; font-size: 14px;">
              ⚠️ Your balance has been refunded automatically. The amount is back in your account.
            </p>
          </div>
          <p style="color: #9ca3af;">If you believe this was an error, please contact support.</p>
          <div style="text-align: center; margin-top: 25px;">
            <a href="${APP_URL}/dashboard"
               style="background: #1f2937; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View Dashboard
            </a>
          </div>
        </div>
        <p style="color: #374151; text-align: center; font-size: 12px; margin-top: 20px;">
          © 2026 SentientTrade. This is an automated message.
        </p>
      </div>
    `
  }),

  earningCredited: ({ name, amount, planName }) => ({
    subject: '🎉 Earnings Credited — SentientTrade',
    html_content: `
      <div style="font-family: Arial, sans-serif; background: #0a0f1e; color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00ff88; font-size: 28px; margin: 0;">💰 SentientTrade</h1>
        </div>
        <div style="background: #111827; padding: 30px; border-radius: 12px; border: 1px solid #1f2937;">
          <h2 style="color: #f59e0b; margin-top: 0;">🎉 You just earned!</h2>
          <p style="color: #9ca3af;">Hi ${name},</p>
          <p style="color: #9ca3af;">Your investment has matured and your earnings have been credited to your balance.</p>
          <div style="background: #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Earnings Credited</p>
            <p style="color: #f59e0b; font-size: 32px; font-weight: bold; margin: 8px 0;">+$${amount}</p>
            ${planName ? `<p style="color: #6b7280; margin: 0; font-size: 14px;">${planName} Plan</p>` : ''}
          </div>
          <p style="color: #9ca3af;">Your earnings are now available for withdrawal or reinvestment.</p>
          <div style="text-align: center; margin-top: 25px;">
            <a href="${APP_URL}/withdraw"
               style="background: #f59e0b; color: #0a0f1e; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-right: 10px;">
              Withdraw
            </a>
            <a href="${APP_URL}/plans"
               style="background: #1f2937; color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Reinvest
            </a>
          </div>
        </div>
        <p style="color: #374151; text-align: center; font-size: 12px; margin-top: 20px;">
          © 2026 SentientTrade. This is an automated message.
        </p>
      </div>
    `
  })
}