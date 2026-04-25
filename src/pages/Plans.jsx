import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react'

export default function Plans() {
  const { user, profile, fetchProfile } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(null)
  const [amount, setAmount] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    const { data } = await supabase.from('plans').select('*').eq('is_active', true).order('min_amount')
    setPlans(data || [])
    setLoading(false)
  }

  const handleActivate = async (plan) => {
    const investAmount = parseFloat(amount[plan.id])

    if (!investAmount) return toast.error('Enter an amount first')
    if (investAmount < plan.min_amount) return toast.error(`Minimum is $${plan.min_amount}`)
    if (investAmount > plan.max_amount) return toast.error(`Maximum is $${plan.max_amount}`)
    if (investAmount > profile?.balance) return toast.error('Insufficient balance. Please deposit first.')

    setActivating(plan.id)

    const roi_amount = (investAmount * plan.roi_percent) / 100
    const end_date = new Date()
    end_date.setDate(end_date.getDate() + plan.duration_days)

    // Create investment record
    const { error: invError } = await supabase.from('investments').insert({
      user_id: user.id,
      plan_id: plan.id,
      amount: investAmount,
      roi_amount,
      status: 'active',
      end_date: end_date.toISOString()
    })

    if (invError) {
      toast.error('Failed to activate plan')
      setActivating(null)
      return
    }

    // Deduct from balance, update total_invested
    const { error: profileError } = await supabase.from('profiles').update({
      balance: profile.balance - investAmount,
      total_invested: (profile.total_invested || 0) + investAmount
    }).eq('id', user.id)

    if (profileError) {
      toast.error('Balance update failed')
      setActivating(null)
      return
    }

    // Log transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'investment',
      amount: investAmount,
      status: 'confirmed'
    })

    await fetchProfile(user.id)
    toast.success(`${plan.name} plan activated!`)
    setActivating(null)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  if (loading) return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '20%' }}>Loading plans...</div>
    </div>
  )

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Toaster />
      <Navbar />
      <div style={styles.container}>

        <div style={styles.header}>
          <h2 style={{ color: '#fff', margin: 0 }}>Investment Plans</h2>
          <p style={{ color: '#6b7280', margin: '0.3rem 0 0' }}>
            Available Balance: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>${profile?.balance?.toFixed(2) ?? '0.00'}</span>
          </p>
        </div>

        <div style={styles.grid}>
          {plans.map((plan, i) => {
            const colors = ['#00ff88', '#3b82f6', '#f59e0b', '#8b5cf6']
            const color = colors[i % colors.length]
            const exampleRoi = ((plan.min_amount * plan.roi_percent) / 100).toFixed(2)

            return (
              <div key={plan.id} style={{ ...styles.card, borderColor: color + '44' }}>
                {/* Plan Header */}
                <div style={{ ...styles.planHeader, background: color + '11' }}>
                  <TrendingUp size={24} color={color} />
                  <h3 style={{ color, margin: 0, fontSize: '1.3rem' }}>{plan.name}</h3>
                </div>

                {/* ROI Badge */}
                <div style={{ ...styles.roiBadge, background: color + '22', color }}>
                  {plan.roi_percent}% ROI
                </div>

                {/* Details */}
                <div style={styles.details}>
                  <div style={styles.detailRow}>
                    <DollarSign size={16} color="#6b7280" />
                    <span style={styles.detailLabel}>Min Deposit</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>${plan.min_amount}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <DollarSign size={16} color="#6b7280" />
                    <span style={styles.detailLabel}>Max Deposit</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>${plan.max_amount}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <Clock size={16} color="#6b7280" />
                    <span style={styles.detailLabel}>Duration</span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{plan.duration_days} days</span>
                  </div>
                  <div style={styles.detailRow}>
                    <CheckCircle size={16} color="#6b7280" />
                    <span style={styles.detailLabel}>Example ROI</span>
                    <span style={{ color, fontWeight: '600' }}>+${exampleRoi} on min</span>
                  </div>
                </div>

                {/* Amount Input */}
                <input
                  type="number"
                  placeholder={`Enter amount ($${plan.min_amount} - $${plan.max_amount})`}
                  style={styles.input}
                  value={amount[plan.id] || ''}
                  onChange={(e) => setAmount({ ...amount, [plan.id]: e.target.value })}
                />

                {/* ROI Preview */}
                {amount[plan.id] && (
                  <div style={styles.preview}>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>You will earn:</span>
                    <span style={{ color, fontWeight: 'bold' }}>
                      +${((parseFloat(amount[plan.id] || 0) * plan.roi_percent) / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Activate Button */}
                <button
                  style={{ ...styles.btn, background: color, opacity: activating === plan.id ? 0.7 : 1 }}
                  onClick={() => handleActivate(plan)}
                  disabled={activating === plan.id}
                >
                  {activating === plan.id ? 'Activating...' : 'Activate Plan'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' },
  card: { background: '#111827', borderRadius: '16px', padding: '1.5rem', border: '1px solid', display: 'flex', flexDirection: 'column', gap: '1rem' },
  planHeader: { display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', borderRadius: '10px' },
  roiBadge: { display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '99px', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center' },
  details: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  detailLabel: { color: '#6b7280', fontSize: '0.9rem', flex: 1 },
  input: { width: '100%', padding: '0.8rem 1rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' },
  preview: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: '#1f2937', borderRadius: '8px' },
  btn: { width: '100%', padding: '0.9rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', color: '#0a0f1e', marginTop: 'auto' }
}