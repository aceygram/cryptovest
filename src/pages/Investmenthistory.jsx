import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import { TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function InvestmentHistory() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { if (user) fetchInvestments() }, [user])

  const fetchInvestments = async () => {
    const { data } = await supabase
      .from('investments')
      .select('*, plans(name, roi_percent, duration_days)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setInvestments(data || [])
    setLoading(false)
  }

  const statusIcon = s => s === 'completed' ? <CheckCircle size={14} color={t.green}/> : s === 'cancelled' ? <XCircle size={14} color={t.red}/> : <Clock size={14} color={t.yellow}/>
  const statusColor = s => s === 'completed' ? t.green : s === 'cancelled' ? t.red : t.yellow

  const filtered = filter === 'all' ? investments : investments.filter(i => i.status === filter)

  const summary = {
    total: investments.length,
    completed: investments.filter(i => i.status === 'completed').length,
    active: investments.filter(i => i.status === 'active').length,
    totalInvested: investments.reduce((s, i) => s + i.amount, 0),
    totalEarned: investments.filter(i => i.status === 'completed').reduce((s, i) => s + (i.roi_amount || 0), 0),
  }

  return (
    <div style={{ background: t.bg, minHeight: '100vh', fontFamily: "'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}@media(max-width:700px){
  .ih-grid{grid-template-columns:1fr 1fr!important}
  .ih-row{flex-direction:column!important;align-items:flex-start!important;gap:.6rem!important}
  .ih-amounts{flex-direction:row!important;width:100%!important;justify-content:space-between!important}
  .ih-status{width:100%!important;flex-direction:row!important;justify-content:space-between!important;align-items:center!important}
}
@media(max-width:380px){
  .ih-grid{grid-template-columns:1fr!important}
}`}</style>
      <Navbar/>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h2 style={{ color: t.text, margin: '0 0 .3rem', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-.02em' }}>Investment History</h2>
        <p style={{ color: t.textSub, margin: '0 0 2rem', fontFamily: 'DM Sans', fontSize: '.88rem' }}>All your investment plans — active and completed</p>

        {/* Summary cards */}
        <div className="ih-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Plans', value: summary.total, color: t.cyan },
            { label: 'Completed', value: summary.completed, color: t.green },
            { label: 'Active', value: summary.active, color: t.yellow },
            { label: 'Total Earned', value: `$${summary.totalEarned.toFixed(2)}`, color: t.green },
          ].map((card, i) => (
            <div key={i} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '12px', padding: '1rem' }}>
              <p style={{ color: t.textSub, margin: '0 0 .3rem', fontFamily: 'DM Sans', fontSize: '.75rem' }}>{card.label}</p>
              <p style={{ color: card.color, margin: 0, fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-.02em' }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {['all', 'active', 'completed', 'cancelled'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              style={{ padding: '.48rem 1.1rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontSize: '.8rem', fontFamily: 'DM Sans', fontWeight: '600', transition: 'all .2s', background: filter === tab ? 'linear-gradient(135deg,#00d4ff,#00ff88)' : t.card, color: filter === tab ? '#020817' : t.textSub, border: filter === tab ? 'none' : `1px solid ${t.cardBorder}` }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Investment list */}
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '1rem' }}>
          {loading ? (
            <p style={{ color: t.textSub, textAlign: 'center', padding: '3rem', fontFamily: 'DM Sans' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: t.textMuted, textAlign: 'center', padding: '3rem', fontFamily: 'DM Sans' }}>No investments found.</p>
          ) : (
            filtered.map(inv => {
              const isCompleted = inv.status === 'completed'
              const daysLeft = inv.status === 'active' ? Math.max(0, Math.ceil((new Date(inv.end_date) - Date.now()) / (24*60*60*1000))) : 0
              return (
                <div key={inv.id} className="ih-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.9rem', background: t.input, borderRadius: '10px', marginBottom: '.5rem', border: `1px solid ${t.cardBorder}`, minWidth:0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: isCompleted ? t.green + '18' : t.yellow + '18', border: `1px solid ${isCompleted ? t.green : t.yellow}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <TrendingUp size={16} color={isCompleted ? t.green : t.yellow}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: t.text, margin: 0, fontWeight: '700', fontFamily: 'DM Sans', fontSize: '.9rem' }}>{inv.plans?.name} Plan</p>
                    <p style={{ color: t.textSub, margin: '.15rem 0 0', fontFamily: 'DM Sans', fontSize: '.75rem' }}>
                      {inv.plans?.duration_days} days · {inv.plans?.roi_percent}% ROI · Started {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ih-amounts" style={{ display:'flex', gap:'1rem' }}>
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <p style={{ color: t.cyan, margin: 0, fontWeight: '700', fontFamily: 'DM Sans', fontSize: '.9rem' }}>${inv.amount}</p>
                      <p style={{ color: t.textMuted, margin: '.1rem 0 0', fontFamily: 'DM Sans', fontSize: '.72rem' }}>invested</p>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <p style={{ color: t.green, margin: 0, fontWeight: '700', fontFamily: 'DM Sans', fontSize: '.9rem' }}>+${inv.roi_amount?.toFixed(2)}</p>
                      <p style={{ color: t.textMuted, margin: '.1rem 0 0', fontFamily: 'DM Sans', fontSize: '.72rem' }}>ROI</p>
                    </div>
                  </div>
                  <div className="ih-status" style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', justifyContent: 'flex-end', marginBottom: '.2rem' }}>
                      {statusIcon(inv.status)}
                      <span style={{ color: statusColor(inv.status), fontFamily: 'DM Sans', fontSize: '.78rem', fontWeight: '600' }}>{inv.status}</span>
                    </div>
                    {inv.status === 'active' && (
                      <p style={{ color: t.textMuted, margin: 0, fontFamily: 'DM Sans', fontSize: '.72rem' }}>{daysLeft}d left</p>
                    )}
                    {inv.status === 'completed' && (
                      <p style={{ color: t.textMuted, margin: 0, fontFamily: 'DM Sans', fontSize: '.72rem' }}>{new Date(inv.end_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}