import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL')!

async function sendEmail(to_email: string, to_name: string, amount: number, planName: string) {
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'SentientTrade', email: SENDER_EMAIL },
      to: [{ email: to_email, name: to_name }],
      subject: '🎉 Your Investment Has Matured — SentientTrade',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; background: #0a0f1e; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <h1 style="color: #00ff88; text-align: center;">💰 SentientTrade</h1>
          <div style="background: #111827; padding: 30px; border-radius: 12px;">
            <h2 style="color: #f59e0b;">🎉 Your investment matured!</h2>
            <p style="color: #9ca3af;">Hi ${to_name},</p>
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
}

Deno.serve(async () => {
  const now = new Date().toISOString()

  // Find all active investments that have passed their end_date
  const { data: maturedInvestments, error } = await supabase
    .from('investments')
    .select('*, plans(name), profiles(email, full_name, balance, total_earnings)')
    .eq('status', 'active')
    .lte('end_date', now)

  if (error) {
    console.error('Failed to fetch investments:', error)
    return new Response('Error', { status: 500 })
  }

  if (!maturedInvestments || maturedInvestments.length === 0) {
    console.log('No matured investments found')
    return new Response('No matured investments', { status: 200 })
  }

  console.log(`Processing ${maturedInvestments.length} matured investments`)

  for (const inv of maturedInvestments) {
    const roi = inv.roi_amount || 0
    const profile = inv.profiles
    const planName = inv.plans?.name || 'Investment'

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
      continue
    }

    // Mark investment as completed
    await supabase
      .from('investments')
      .update({ status: 'completed' })
      .eq('id', inv.id)

    // Log earning transaction
    await supabase.from('transactions').insert({
      user_id: inv.user_id,
      type: 'earning',
      amount: roi,
      status: 'confirmed'
    })

    // Send email notification
    if (profile?.email) {
      await sendEmail(profile.email, profile.full_name, roi, planName)
    }

    console.log(`Credited $${roi} to user ${inv.user_id} for ${planName} plan`)
  }

  return new Response(`Processed ${maturedInvestments.length} investments`, { status: 200 })
})