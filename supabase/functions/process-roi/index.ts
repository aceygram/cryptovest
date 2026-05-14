import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'no-reply@sentienttrade.online'

console.log('=== PROCESS ROI STARTED ===')
console.log('ENV CHECK:', { 
  hasUrl: !!SUPABASE_URL, 
  hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
  hasBrevoKey: !!BREVO_API_KEY,
  sender: SENDER_EMAIL
})

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars')
  Deno.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function sendEmail(to_email: string, to_name: string, amount: number, planName: string) {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set — skipping email')
    return { success: false, error: 'BREVO_API_KEY not configured' }
  }

  try {
    console.log(`Sending email to ${to_email}...`)
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'SentientTrade', email: SENDER_EMAIL },
        to: [{ email: to_email, name: to_name || 'Investor' }],
        subject: '🎉 Your Investment Has Matured — SentientTrade',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; background: #0a0f1e; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
            <h1 style="color: #00ff88; text-align: center;">💰 SentientTrade</h1>
            <div style="background: #111827; padding: 30px; border-radius: 12px;">
              <h2 style="color: #f59e0b;">🎉 Your investment matured!</h2>
              <p style="color: #9ca3af;">Hi ${to_name || 'Investor'},</p>
              <p style="color: #9ca3af;">Your <strong style="color:#fff">${planName}</strong> plan has completed and your earnings have been credited.</p>
              <div style="background: #1f2937; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">Earnings Credited</p>
                <p style="color: #f59e0b; font-size: 32px; font-weight: bold; margin: 8px 0;">+$${amount}</p>
              </div>
              <p style="color: #9ca3af;">Your balance has been updated. You can withdraw or reinvest.</p>
            </div>
            <p style="color: #374151; text-align: center; font-size: 12px; margin-top: 20px;">© 2026 SentientTrade.</p>
          </div>
        `
      })
    })

    if (!response.ok) {
      let errText = `HTTP ${response.status}`
      try { errText = JSON.stringify(await response.json()) } catch { /* ignore */ }
      console.error('Brevo error:', errText)
      return { success: false, error: errText }
    }

    console.log(`✅ Email sent successfully to ${to_email}`)
    return { success: true }
  } catch (err: any) {
    console.error('sendEmail exception:', err.message)
    return { success: false, error: err.message }
  }
}

Deno.serve(async () => {
  const now = new Date().toISOString()
  console.log(`Checking for matured investments at ${now}`)

  // Find all active investments that have passed their end_date
  const { data: maturedInvestments, error } = await supabase
    .from('investments')
    .select('*, plans(name), profiles(email, full_name, balance, total_earnings)')
    .eq('status', 'active')
    .lte('end_date', now)

  if (error) {
    console.error('Failed to fetch investments:', error)
    return new Response(JSON.stringify({ error: 'DB query failed', details: error }), { status: 500 })
  }

  console.log(`Found ${maturedInvestments?.length || 0} matured investments`)

  if (!maturedInvestments || maturedInvestments.length === 0) {
    return new Response(JSON.stringify({ message: 'No matured investments', checkedAt: now }), { status: 200 })
  }

  let processed = 0
  let emailed = 0
  let failed = 0
  const results: any[] = []

  for (const inv of maturedInvestments) {
    const roi = inv.roi_amount || 0
    const planName = inv.plans?.name || 'Investment'
    
    // FIX: Supabase sometimes returns related data as an array
    let profile = inv.profiles
    if (Array.isArray(profile)) {
      console.log(`Profile is array for investment ${inv.id}, taking first element`)
      profile = profile[0]
    }
    
    console.log(`Processing investment ${inv.id}: user=${inv.user_id}, roi=${roi}, plan=${planName}`)
    console.log(`Profile data:`, JSON.stringify(profile))

    if (!profile) {
      console.error(`No profile found for investment ${inv.id} — skipping credit and email`)
      failed++
      results.push({ id: inv.id, status: 'skipped', reason: 'no profile' })
      continue
    }

    // Credit ROI to balance and update total_earnings
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        balance: (profile.balance || 0) + roi,
        total_earnings: (profile.total_earnings || 0) + roi
      })
      .eq('id', inv.user_id)

    if (updateError) {
      console.error(`Failed to credit ROI for investment ${inv.id}:`, updateError)
      failed++
      results.push({ id: inv.id, status: 'failed', reason: 'credit failed', error: updateError })
      continue
    }

    // Mark investment as completed
    const { error: statusError } = await supabase
      .from('investments')
      .update({ status: 'completed' })
      .eq('id', inv.id)

    if (statusError) {
      console.error(`Failed to mark investment ${inv.id} as completed:`, statusError)
    }

    // Log earning transaction
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: inv.user_id,
      type: 'earning',
      amount: roi,
      status: 'confirmed'
    })

    if (txError) {
      console.error(`Failed to log transaction for investment ${inv.id}:`, txError)
    }

    // Send email notification
    if (profile?.email) {
      const emailResult = await sendEmail(profile.email, profile.full_name, roi, planName)
      if (emailResult.success) {
        emailed++
      }
      results.push({ id: inv.id, status: 'processed', email: emailResult })
    } else {
      console.error(`No email for user ${inv.user_id} — investment processed but no email sent`)
      results.push({ id: inv.id, status: 'processed', email: { success: false, reason: 'no email' } })
    }

    console.log(`✅ Credited $${roi} to user ${inv.user_id} for ${planName} plan`)
    processed++
  }

  const summary = { processed, emailed, failed, total: maturedInvestments.length, results }
  console.log('=== SUMMARY ===', summary)

  return new Response(JSON.stringify(summary), { status: 200 })
})