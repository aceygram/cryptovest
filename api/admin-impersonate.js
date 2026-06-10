import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed')

  // Verify the requester is actually an admin
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).send('Unauthorized')

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).send('Unauthorized')

  // Check is_admin in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return res.status(403).send('Forbidden')

  // Get target user id from body
  const { target_user_id } = req.body
  if (!target_user_id) return res.status(400).send('Missing target_user_id')

  // Log the impersonation attempt
  await supabase.from('admin_audit_log').insert({
    admin_id: user.id,
    admin_email: user.email,
    action: 'impersonate',
    target_user_id,
    created_at: new Date().toISOString()
  })

  // Generate a session link for the target user
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: (await supabase.from('profiles').select('email').eq('id', target_user_id).single()).data.email
  })

  if (error) return res.status(500).json({ error: error.message })

  return res.status(200).json({ link: data.properties.action_link })
}
