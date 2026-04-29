import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BtcChart from "../components/BtcChart";
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, DollarSign, Clock } from 'lucide-react'

// ── Infinite scrolling price chart ──────────────────────────────────────────
function LiveChart() {
  const canvasRef = useRef(null)
  const dataRef = useRef([])
  const frameRef = useRef(null)
  const offsetRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // seed initial data
    let last = 50
    for (let i = 0; i < 300; i++) {
      last += (Math.random() - 0.48) * 3
      last = Math.max(10, Math.min(90, last))
      dataRef.current.push(last)
    }

    const STEP = 4      // px between points
    const SPEED = 0.8   // px per frame

    const draw = () => {
      const w = canvas.width = canvas.offsetWidth
      const h = canvas.height = canvas.offsetHeight

      // add new point every STEP px of scroll
      if (offsetRef.current % STEP < SPEED) {
        last += (Math.random() - 0.48) * 2.5
        last = Math.max(10, Math.min(90, last))
        dataRef.current.push(last)
        if (dataRef.current.length > 600) dataRef.current.shift()
      }

      offsetRef.current += SPEED

      ctx.clearRect(0, 0, w, h)

      // grid lines
      ctx.strokeStyle = 'rgba(15,42,74,0.6)'
      ctx.lineWidth = 1
      for (let row = 0; row < 5; row++) {
        const y = (h / 4) * row
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      // visible points
      const visibleCount = Math.ceil(w / STEP) + 2
      const startIdx = Math.max(0, dataRef.current.length - visibleCount)
      const visible = dataRef.current.slice(startIdx)
      const pixelShift = offsetRef.current % STEP

      // build path
      const toY = v => h - (v / 100) * h * 0.8 - h * 0.1

      ctx.beginPath()
      visible.forEach((v, i) => {
        const x = i * STEP - pixelShift
        if (i === 0) ctx.moveTo(x, toY(v))
        else ctx.lineTo(x, toY(v))
      })

      // gradient fill
      const grad = ctx.createLinearGradient(0, 0, 0, h)
      grad.addColorStop(0, 'rgba(0,212,255,0.22)')
      grad.addColorStop(1, 'rgba(0,212,255,0)')
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.lineTo((visible.length - 1) * STEP - pixelShift, h)
      ctx.lineTo(0, h)
      ctx.fillStyle = grad
      ctx.fill()

      // glowing dot at tip
      const tipX = (visible.length - 1) * STEP - pixelShift
      const tipY = toY(visible[visible.length - 1])
      ctx.beginPath()
      ctx.arc(tipX, tipY, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#00d4ff'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(tipX, tipY, 8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,212,255,0.2)'
      ctx.fill()

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
  )
}

// ── Portfolio donut chart ────────────────────────────────────────────────────
function DonutChart({ balance, invested, earnings }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = 160
    canvas.width = size; canvas.height = size
    const cx = size / 2, cy = size / 2, r = 62, inner = 42

    const total = (balance || 0) + (invested || 0) + (earnings || 0)
    const segments = total === 0
      ? [{ value: 1, color: '#0f2040' }]
      : [
          { value: balance || 0, color: '#00d4ff' },
          { value: invested || 0, color: '#3b82f6' },
          { value: earnings || 0, color: '#00ff88' },
        ].filter(s => s.value > 0)

    let angle = -Math.PI / 2
    segments.forEach(seg => {
      const slice = (seg.value / (total || 1)) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(cx, cy, r, angle, angle + slice)
      ctx.arc(cx, cy, inner, angle + slice, angle, true)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      angle += slice
    })

    // center text
    ctx.fillStyle = '#f1f5f9'
    ctx.font = 'bold 13px DM Sans'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`$${(total).toFixed(0)}`, cx, cy)
  }, [balance, invested, earnings])

  return <canvas ref={canvasRef} style={{ width: '160px', height: '160px' }} />
}

// ── Bar chart for monthly activity ──────────────────────────────────────────
function BarChart({ transactions }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = canvas.offsetWidth
    const h = canvas.height = canvas.offsetHeight

    // build last 7 days deposit totals
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      return { label: d.toLocaleDateString('en', { weekday: 'short' }), value: 0 }
    })

    transactions?.forEach(tx => {
      if (tx.type === 'deposit' && tx.status === 'confirmed') {
        const txDate = new Date(tx.created_at)
        const daysAgo = Math.floor((Date.now() - txDate) / (24 * 60 * 60 * 1000))
        if (daysAgo < 7) days[6 - daysAgo].value += tx.amount
      }
    })

    const max = Math.max(...days.map(d => d.value), 1)
    const barW = Math.floor((w - 40) / 7) - 8
    const baseY = h - 28

    ctx.clearRect(0, 0, w, h)

    days.forEach((day, i) => {
      const barH = Math.max(3, (day.value / max) * (h - 48))
      const x = 20 + i * ((w - 40) / 7)
      const y = baseY - barH

      // bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, baseY)
      grad.addColorStop(0, '#00d4ff')
      grad.addColorStop(1, 'rgba(0,212,255,0.2)')
      ctx.fillStyle = day.value > 0 ? grad : '#0f2040'
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0])
      ctx.fill()

      // label
      ctx.fillStyle = '#334155'
      ctx.font = '10px DM Sans'
      ctx.textAlign = 'center'
      ctx.fillText(day.label, x + barW / 2, h - 8)
    })
  }, [transactions])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { profile, fetchProfile, user } = useAuth()
  const [investments, setInvestments] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [allTx, setAllTx] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) { fetchProfile(user.id); fetchData() }
  }, [user])

  const fetchData = async () => {
    const [{ data: inv }, { data: tx }] = await Promise.all([
      supabase.from('investments').select('*, plans(name, roi_percent, duration_days)')
        .eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false })
    ])
    setInvestments(inv || [])
    setRecentTx((tx || []).slice(0, 5))
    setAllTx(tx || [])
    setLoading(false)
  }

  const statCards = [
    { label: 'Available Balance', value: `$${profile?.balance?.toFixed(2) ?? '0.00'}`, icon: <DollarSign size={20} />, color: '#00d4ff' },
    { label: 'Total Invested', value: `$${profile?.total_invested?.toFixed(2) ?? '0.00'}`, icon: <TrendingUp size={20} />, color: '#3b82f6' },
    { label: 'Total Earnings', value: `$${profile?.total_earnings?.toFixed(2) ?? '0.00'}`, icon: <ArrowDownCircle size={20} />, color: '#00ff88' },
    { label: 'Active Plans', value: investments.length, icon: <Clock size={20} />, color: '#f59e0b' },
  ]

  if (loading) return (
    <div style={{ background: '#020817', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ color: '#475569', textAlign: 'center', marginTop: '20%', fontFamily: 'DM Sans' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ background: '#020817', minHeight: '100vh', fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @media(max-width:700px){
          .db-row{grid-template-columns:1fr!important}
          .db-charts{grid-template-columns:1fr!important}
          .db-actions{flex-wrap:wrap!important}
          .db-stats{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:500px){
          .db-stats{grid-template-columns:1fr!important}
          .db-actions a{width:100%!important;justify-content:center!important}
        }
      `}</style>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-.02em' }}>
            Welcome back, {profile?.full_name?.split(' ')[0]} 👋
          </h2>
          <p style={{ color: '#475569', margin: '.3rem 0 0', fontFamily: 'DM Sans', fontSize: '.88rem' }}>
            Here's your portfolio overview
          </p>
        </div>

        {/* Stat Cards */}
        <div className="db-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {statCards.map((card, i) => (
            <div key={i} style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '.9rem' }}>
              <div style={{ padding: '.65rem', borderRadius: '10px', background: card.color + '18', color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.icon}
              </div>
              <div>
                <p style={{ color: '#475569', margin: 0, fontSize: '.78rem', fontFamily: 'DM Sans' }}>{card.label}</p>
                <p style={{ color: card.color, margin: '.15rem 0 0', fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-.02em' }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live chart + Donut */}
        <div className="db-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* Infinite scroll chart */}
          <div style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: '#f1f5f9', margin: 0, fontWeight: '700', fontSize: '.92rem' }}>AI Market Feed</p>
                <p style={{ color: '#475569', margin: '.2rem 0 0', fontFamily: 'DM Sans', fontSize: '.75rem' }}>Live signal stream — updating in real time</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: '#00d4ff11', border: '1px solid #00d4ff33', padding: '.28rem .7rem', borderRadius: '99px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d4ff', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ color: '#00d4ff', fontFamily: 'DM Sans', fontSize: '.72rem' }}>LIVE</span>
              </div>
            </div>
            <div style={{ height: '160px' }}>
              <LiveChart />
            </div>
          </div>

          {/* Portfolio donut */}
          <div style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '14px', padding: '1.2rem' }}>
            <p style={{ color: '#f1f5f9', margin: '0 0 1rem', fontWeight: '700', fontSize: '.92rem' }}>Portfolio Split</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', justifyContent: 'center' }}>
              <DonutChart balance={profile?.balance} invested={profile?.total_invested} earnings={profile?.total_earnings} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {[
                  { label: 'Balance', value: `$${profile?.balance?.toFixed(0) ?? '0'}`, color: '#00d4ff' },
                  { label: 'Invested', value: `$${profile?.total_invested?.toFixed(0) ?? '0'}`, color: '#3b82f6' },
                  { label: 'Earnings', value: `$${profile?.total_earnings?.toFixed(0) ?? '0'}`, color: '#00ff88' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ color: '#475569', margin: 0, fontFamily: 'DM Sans', fontSize: '.7rem' }}>{item.label}</p>
                      <p style={{ color: item.color, margin: 0, fontFamily: 'DM Sans', fontWeight: '600', fontSize: '.85rem' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="db-actions" style={{ display: 'flex', gap: '.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { to: '/deposit', label: 'Deposit', icon: <ArrowDownCircle size={16} />, color: '#00d4ff' },
            { to: '/withdraw', label: 'Withdraw', icon: <ArrowUpCircle size={16} />, color: '#ef4444' },
            { to: '/plans', label: 'Invest Now', icon: <TrendingUp size={16} />, color: '#00ff88' },
          ].map(btn => (
            <Link key={btn.to} to={btn.to} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.75rem 1.4rem', background: btn.color + '14', color: btn.color, border: `1px solid ${btn.color}33`, borderRadius: '8px', textDecoration: 'none', fontFamily: 'DM Sans', fontWeight: '600', fontSize: '.88rem', transition: 'background .2s' }}>
              {btn.icon} {btn.label}
            </Link>
          ))}
        </div>

        {/* BTC Live Chart */}
        <div style={{ marginBottom: '1.5rem' }}>
          <BtcChart />
        </div>

        {/* Bar chart + investments + transactions */}
        <div className="db-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

          {/* 7-day bar chart */}
          <div style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '14px', padding: '1.2rem' }}>
            <p style={{ color: '#f1f5f9', margin: '0 0 .3rem', fontWeight: '700', fontSize: '.9rem' }}>7-Day Deposit Activity</p>
            <p style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.75rem', margin: '0 0 1rem' }}>Confirmed deposits per day</p>
            <div style={{ height: '130px' }}>
              <BarChart transactions={allTx} />
            </div>
          </div>

          {/* Active investments */}
          <div style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '14px', padding: '1.2rem' }}>
            <p style={{ color: '#f1f5f9', margin: '0 0 1rem', fontWeight: '700', fontSize: '.9rem' }}>Active Investments</p>
            {investments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.85rem', marginBottom: '.5rem' }}>No active investments yet.</p>
                <Link to="/plans" style={{ color: '#00d4ff', fontFamily: 'DM Sans', fontSize: '.82rem' }}>Browse Plans →</Link>
              </div>
            ) : (
              investments.map(inv => (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.8rem', background: '#020c1b', borderRadius: '8px', marginBottom: '.5rem', border: '1px solid #0f2040' }}>
                  <div>
                    <p style={{ color: '#f1f5f9', margin: 0, fontWeight: '600', fontSize: '.85rem' }}>{inv.plans?.name} Plan</p>
                    <p style={{ color: '#475569', margin: '.15rem 0 0', fontFamily: 'DM Sans', fontSize: '.75rem' }}>
                      {inv.plans?.duration_days}d · {inv.plans?.roi_percent}% ROI
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#00d4ff', margin: 0, fontWeight: '700', fontSize: '.88rem' }}>${inv.amount}</p>
                    <p style={{ color: '#00ff88', margin: '.15rem 0 0', fontFamily: 'DM Sans', fontSize: '.72rem' }}>+${inv.roi_amount?.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '14px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: '#f1f5f9', margin: 0, fontWeight: '700', fontSize: '.9rem' }}>Recent Transactions</p>
            <Link to="/history" style={{ color: '#00d4ff', fontFamily: 'DM Sans', fontSize: '.78rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          {recentTx.length === 0 ? (
            <p style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.85rem', textAlign: 'center', padding: '1.5rem 0' }}>No transactions yet.</p>
          ) : (
            recentTx.map(tx => {
              const isDebit = tx.type === 'withdrawal' || tx.type === 'investment'
              const statusColor = tx.status === 'confirmed' ? '#00ff88' : tx.status === 'rejected' ? '#ef4444' : '#f59e0b'
              return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.8rem', background: '#020c1b', borderRadius: '8px', marginBottom: '.4rem', border: '1px solid #0f2040' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isDebit ? '#ef444418' : '#00d4ff18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isDebit ? <ArrowUpCircle size={15} color="#ef4444" /> : <ArrowDownCircle size={15} color="#00d4ff" />}
                    </div>
                    <div>
                      <p style={{ color: '#cbd5e1', margin: 0, fontFamily: 'DM Sans', fontSize: '.82rem', fontWeight: '500', textTransform: 'capitalize' }}>{tx.type}</p>
                      <p style={{ color: '#334155', margin: '.1rem 0 0', fontFamily: 'DM Sans', fontSize: '.72rem' }}>{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: isDebit ? '#ef4444' : '#00d4ff', margin: 0, fontFamily: 'DM Sans', fontWeight: '700', fontSize: '.88rem' }}>
                      {isDebit ? '-' : '+'}${tx.amount}
                    </p>
                    <span style={{ fontFamily: 'DM Sans', fontSize: '.7rem', color: statusColor }}>{tx.status}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}