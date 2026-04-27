import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { Gift } from 'lucide-react'
import { sendEmail, emailTemplates } from '../../lib/email'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [crediting, setCrediting] = useState(null)
  const [creditForm, setCreditForm] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const handleCreditEarning = async (user) => {
    const amount = parseFloat(creditForm[user.id])
    if (!amount || amount <= 0) return toast.error('Enter a valid amount')

    setCrediting(user.id)

    const { error } = await supabase
      .from('profiles')
      .update({
        balance: user.balance + amount,
        total_earnings: (user.total_earnings || 0) + amount
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to credit earning')
      setCrediting(null)
      return
    }

    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'earning',
      amount,
      status: 'confirmed'
    })

    // Send email
    const template = emailTemplates.earningCredited({
      name: user.full_name,
      amount,
      planName: null
    })
    await sendEmail({
      to_email: user.email,
      to_name: user.full_name,
      ...template
    })

    toast.success(`$${amount} credited to ${user.full_name}`)
    setCreditForm({ ...creditForm, [user.id]: '' })
    fetchUsers()
    setCrediting(null)
  }

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Toaster />
      <Navbar />
      <div style={styles.container}>
        <h2 style={{ color: '#fff', margin: '0 0 0.3rem' }}>User Management</h2>
        <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>View users and credit earnings manually</p>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading users...</p>
        ) : (
          users.map(user => (
            <div key={user.id} style={styles.card}>
              <div style={styles.userInfo}>
                <div style={styles.avatar}>{user.full_name?.charAt(0).toUpperCase()}</div>
                <div>
                  <p style={{ color: '#fff', margin: 0, fontWeight: '600' }}>{user.full_name}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.82rem' }}>{user.email}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.78rem' }}>
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div style={styles.statsRow}>
                {[
                  { label: 'Balance', value: `$${user.balance?.toFixed(2) || '0.00'}`, color: '#00ff88' },
                  { label: 'Invested', value: `$${user.total_invested?.toFixed(2) || '0.00'}`, color: '#3b82f6' },
                  { label: 'Earnings', value: `$${user.total_earnings?.toFixed(2) || '0.00'}`, color: '#f59e0b' },
                ].map((stat, i) => (
                  <div key={i} style={styles.statBox}>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '0.78rem' }}>{stat.label}</p>
                    <p style={{ color: stat.color, margin: '0.2rem 0 0', fontWeight: 'bold' }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Credit Earning */}
              <div style={styles.creditRow}>
                <input
                  type="number"
                  placeholder="Credit amount ($)"
                  style={styles.input}
                  value={creditForm[user.id] || ''}
                  onChange={e => setCreditForm({ ...creditForm, [user.id]: e.target.value })}
                />
                <button
                  style={{ ...styles.creditBtn, opacity: crediting === user.id ? 0.6 : 1 }}
                  onClick={() => handleCreditEarning(user)}
                  disabled={crediting === user.id}
                >
                  <Gift size={15} />
                  {crediting === user.id ? 'Crediting...' : 'Credit Earning'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  card: { background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1f2937', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center' },
  userInfo: { display: 'flex', gap: '0.9rem', alignItems: 'center', minWidth: '220px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', background: '#3b82f622', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', flexShrink: 0 },
  statsRow: { display: 'flex', gap: '1rem', flex: 1 },
  statBox: { background: '#1f2937', padding: '0.6rem 1rem', borderRadius: '8px', minWidth: '90px' },
  creditRow: { display: 'flex', gap: '0.7rem', alignItems: 'center' },
  input: { padding: '0.6rem 0.9rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', width: '160px' },
  creditBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' }
}