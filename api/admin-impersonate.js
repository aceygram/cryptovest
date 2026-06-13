import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Always return JSON
  res.setHeader('Content-Type', 'application/json')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) return res.status(403).json({ error: 'Forbidden' })

    const { target_user_id } = req.body
    if (!target_user_id) return res.status(400).json({ error: 'Missing target_user_id' })

    // Get target user email
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', target_user_id)
      .single()

    if (profileError || !targetProfile?.email) {
      return res.status(404).json({ error: 'Target user not found' })
    }

    // Log the action
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      admin_email: user.email,
      action: 'impersonate',
      target_user_id,
      notes: `Impersonated ${targetProfile.full_name} (${targetProfile.email})`
    })

    // Generate magic link
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: targetProfile.email
    })

    if (linkError) {
      console.error('generateLink error:', linkError)
      return res.status(500).json({ error: linkError.message })
    }

    return res.status(200).json({ link: data.properties.action_link })

  } catch (err) {
    console.error('Impersonate handler error:', err)
    return res.status(500).json({ error: err.message || 'Internal server error' })
  }
}
