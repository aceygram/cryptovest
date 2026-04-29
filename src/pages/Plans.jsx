import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import BtcChart from "../components/BtcChart";
import { TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react'

// ROI projection chart for each plan
function ROIChart({ plan, amount }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth
    const h = canvas.height = canvas.offsetHeight

    ctx.clearRect(0, 0, w, h)

    const days = plan.duration_days
    const startVal = parseFloat(amount) || plan.min_amount
    const endVal = startVal + (startVal * plan.roi_percent) / 100

    const points = Array.from({ length: days + 1 }, (_, i) => ({
      x: (i / days) * (w - 20) + 10,
      y: h - 10 - ((startVal + ((endVal - startVal) * (i / days))) / endVal) * (h - 20)
    }))

    // grid
    ctx.strokeStyle = 'rgba(15,42,74,0.5)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 3; i++) {
      const y = 10 + (i / 3) * (h - 20)
      ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(w - 10, y); ctx.stroke()
    }

    // area
    const color = plan.color
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, color + '44')
    grad.addColorStop(1, color + '00')

    ctx.beginPath()
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.lineTo(points[points.length - 1].x, h - 10)
    ctx.lineTo(points[0].x, h - 10)
    ctx.fillStyle = grad
    ctx.fill()

    // end dot
    const last = points[points.length - 1]
    ctx.beginPath(); ctx.arc(last.x, last.y, 4, 0, Math.PI * 2)
    ctx.fillStyle = color; ctx.fill()
    ctx.beginPath(); ctx.arc(last.x, last.y, 8, 0, Math.PI * 2)
    ctx.fillStyle = color + '33'; ctx.fill()
  }, [plan, amount])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

export default function Plans() {
  const { user, profile, fetchProfile } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(null)
  const [amount, setAmount] = useState({})
  const navigate = useNavigate()

  useEffect(() => { fetchPlans() }, [])

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

    const { error: invError } = await supabase.from('investments').insert({
      user_id: user.id, plan_id: plan.id, amount: investAmount,
      roi_amount, status: 'active', end_date: end_date.toISOString()
    })
    if (invError) { toast.error('Failed to activate plan'); setActivating(null); return }

    const { error: profileError } = await supabase.from('profiles').update({
      balance: profile.balance - investAmount,
      total_invested: (profile.total_invested || 0) + investAmount
    }).eq('id', user.id)
    if (profileError) { toast.error('Balance update failed'); setActivating(null); return }

    await supabase.from('transactions').insert({
      user_id: user.id, type: 'investment', amount: investAmount, status: 'confirmed'
    })

    await fetchProfile(user.id)
    toast.success(`${plan.name} plan activated!`)
    setActivating(null)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  const COLORS = ['#00d4ff', '#00ff88', '#f59e0b', '#8b5cf6']

  if (loading) return (
    <div style={{ background: '#020817', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ color: '#475569', textAlign: 'center', marginTop: '20%', fontFamily: 'DM Sans' }}>Loading plans...</div>
    </div>
  )

  return (
    <div style={{ background: '#020817', minHeight: '100vh', fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @media(max-width:700px){.plans-grid{grid-template-columns:1fr!important}}
        @media(max-width:480px){.plans-grid{grid-template-columns:1fr!important}}
        .plan-input:focus{border-color:#00d4ff66!important;outline:none}
        .plan-input::placeholder{color:#334155}
      `}</style>
      <Toaster />
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-.02em' }}>Investment Plans</h2>
          <p style={{ color: '#475569', margin: '.3rem 0 0', fontFamily: 'DM Sans', fontSize: '.88rem' }}>
            Available Balance: <span style={{ color: '#00d4ff', fontWeight: '700' }}>${profile?.balance?.toFixed(2) ?? '0.00'}</span>
          </p>
        </div>

        <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.2rem' }}>
          {plans.map((plan, i) => {
            const color = COLORS[i % COLORS.length]
            const planWithColor = { ...plan, color }
            const investAmount = parseFloat(amount[plan.id]) || plan.min_amount
            const roiEarned = ((investAmount * plan.roi_percent) / 100).toFixed(2)
            const totalReturn = (investAmount + parseFloat(roiEarned)).toFixed(2)

            return (
              <div key={plan.id} style={{ background: '#030e1f', border: `1px solid ${color}33`, borderRadius: '16px', padding: '1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                {/* Subtle top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${color},${color}00)` }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: color + '18', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={18} color={color} />
                    </div>
                    <div>
                      <h3 style={{ color: '#f1f5f9', margin: 0, fontSize: '1rem', fontWeight: '800' }}>{plan.name}</h3>
                      <p style={{ color: '#475569', margin: '.1rem 0 0', fontFamily: 'DM Sans', fontSize: '.75rem' }}>
                        {plan.duration_days} days duration
                      </p>
                    </div>
                  </div>
                  <div style={{ background: color + '18', border: `1px solid ${color}33`, borderRadius: '8px', padding: '.35rem .8rem', textAlign: 'center' }}>
                    <span style={{ color, fontWeight: '800', fontSize: '1.1rem' }}>{plan.roi_percent}%</span>
                    <p style={{ color: '#475569', margin: 0, fontFamily: 'DM Sans', fontSize: '.65rem' }}>ROI</p>
                  </div>
                </div>

                {/* ROI Projection Chart */}
                <div style={{ height: '100px', background: '#020c1b', borderRadius: '8px', padding: '.5rem', border: '1px solid #0f2040' }}>
                  <p style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.68rem', margin: '0 0 .3rem .3rem' }}>Projected growth</p>
                  <div style={{ height: '70px' }}>
                    <ROIChart plan={planWithColor} amount={amount[plan.id]} />
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  {[
                    { label: 'Min Deposit', value: `$${plan.min_amount}`, icon: <DollarSign size={13} /> },
                    { label: 'Max Deposit', value: `$${plan.max_amount}`, icon: <DollarSign size={13} /> },
                    { label: 'Duration', value: `${plan.duration_days} days`, icon: <Clock size={13} /> },
                    { label: 'Capital Return', value: '✓ Included', icon: <CheckCircle size={13} /> },
                  ].map(({ label, value, icon }, j) => (
                    <div key={j} style={{ background: '#020c1b', borderRadius: '7px', padding: '.55rem .7rem', border: '1px solid #0f2040' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', color: '#334155', marginBottom: '.2rem' }}>
                        {icon}
                        <span style={{ fontFamily: 'DM Sans', fontSize: '.7rem' }}>{label}</span>
                      </div>
                      <span style={{ color: j === 3 ? '#00ff88' : '#cbd5e1', fontFamily: 'DM Sans', fontWeight: '600', fontSize: '.82rem' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Amount input */}
                <div>
                  <label style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.72rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: '.4rem' }}>
                    Investment Amount
                  </label>
                  <input className="plan-input"
                    type="number"
                    placeholder={`$${plan.min_amount} – $${plan.max_amount}`}
                    style={{ width: '100%', padding: '.8rem 1rem', background: '#020c1b', border: `1px solid ${color}33`, borderRadius: '8px', color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '.9rem', boxSizing: 'border-box', transition: 'border-color .2s' }}
                    value={amount[plan.id] || ''}
                    onChange={e => setAmount({ ...amount, [plan.id]: e.target.value })}
                  />
                </div>

                {/* Preview */}
                {amount[plan.id] && parseFloat(amount[plan.id]) >= plan.min_amount && (
                  <div style={{ background: color + '0d', border: `1px solid ${color}22`, borderRadius: '8px', padding: '.8rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '.5rem', textAlign: 'center' }}>
                    {[
                      { label: 'You invest', value: `$${parseFloat(amount[plan.id]).toFixed(2)}`, color: '#cbd5e1' },
                      { label: 'ROI earned', value: `+$${roiEarned}`, color },
                      { label: 'Total return', value: `$${totalReturn}`, color: '#00ff88' },
                    ].map((item, j) => (
                      <div key={j}>
                        <p style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.65rem', margin: '0 0 .15rem' }}>{item.label}</p>
                        <p style={{ color: item.color, fontFamily: 'DM Sans', fontWeight: '700', fontSize: '.82rem', margin: 0 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Activate */}
                <button
                  style={{ width: '100%', padding: '.88rem', background: `linear-gradient(135deg,${color},${color}bb)`, color: '#020817', border: 'none', borderRadius: '10px', fontFamily: 'Syne', fontWeight: '700', fontSize: '.92rem', cursor: 'pointer', opacity: activating === plan.id ? .7 : 1, transition: 'opacity .2s' }}
                  onClick={() => handleActivate(plan)}
                  disabled={activating === plan.id}
                >
                  {activating === plan.id ? 'Activating...' : `Activate ${plan.name} Plan`}
                </button>
              </div>
              
            )
          })}
        </div>
        {/* BTC Live Chart */}
                        <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                          <BtcChart />
                        </div>
      </div>
    </div>
  )
}