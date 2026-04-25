import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, DollarSign, Clock } from 'lucide-react'

export default function Dashboard() {
  const { profile, fetchProfile, user } = useAuth()
  const [investments, setInvestments] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    const { data: inv } = await supabase
      .from('investments')
      .select('*, plans(name, roi_percent, duration_days)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    const { data: tx } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    setInvestments(inv || [])
    setRecentTx(tx || [])
    setLoading(false)
  }

  const statCards = [
    { label: 'Available Balance', value: `$${profile?.balance?.toFixed(2) ?? '0.00'}`, icon: <DollarSign size={22} />, color: '#00ff88' },
    { label: 'Total Invested', value: `$${profile?.total_invested?.toFixed(2) ?? '0.00'}`, icon: <TrendingUp size={22} />, color: '#3b82f6' },
    { label: 'Total Earnings', value: `$${profile?.total_earnings?.toFixed(2) ?? '0.00'}`, icon: <ArrowDownCircle size={22} />, color: '#f59e0b' },
    { label: 'Active Plans', value: investments.length, icon: <Clock size={22} />, color: '#8b5cf6' },
  ]

  if (loading) return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ color: '#fff', textAlign: 'center', marginTop: '20%' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.container}>

        {/* Welcome */}
        <div style={styles.welcome}>
          <h2 style={{ color: '#fff', margin: 0 }}>Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h2>
          <p style={{ color: '#6b7280', margin: '0.3rem 0 0' }}>Here's your portfolio overview</p>
        </div>

        {/* Stat Cards */}
        <div style={styles.grid}>
          {statCards.map((card, i) => (
            <div key={i} style={styles.card}>
              <div style={{ ...styles.iconBox, background: card.color + '22', color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p style={styles.cardLabel}>{card.label}</p>
                <p style={{ ...styles.cardValue, color: card.color }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={styles.actions}>
          <Link to="/deposit" style={{ ...styles.actionBtn, background: '#00ff8822', color: '#00ff88', border: '1px solid #00ff8844' }}>
            <ArrowDownCircle size={18} /> Deposit
          </Link>
          <Link to="/withdraw" style={{ ...styles.actionBtn, background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444' }}>
            <ArrowUpCircle size={18} /> Withdraw
          </Link>
          <Link to="/plans" style={{ ...styles.actionBtn, background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f644' }}>
            <TrendingUp size={18} /> Invest Now
          </Link>
        </div>

        <div style={styles.row}>
          {/* Active Investments */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Active Investments</h3>
            {investments.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ color: '#6b7280' }}>No active investments yet.</p>
                <Link to="/plans" style={{ color: '#00ff88', fontSize: '0.9rem' }}>Browse Plans →</Link>
              </div>
            ) : (
              investments.map(inv => (
                <div key={inv.id} style={styles.invCard}>
                  <div>
                    <p style={{ color: '#fff', margin: 0, fontWeight: 'bold' }}>{inv.plans?.name} Plan</p>
                    <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                      {inv.plans?.duration_days} days · {inv.plans?.roi_percent}% ROI
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#00ff88', margin: 0, fontWeight: 'bold' }}>${inv.amount}</p>
                    <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                      +${inv.roi_amount?.toFixed(2)} expected
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Transactions */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent Transactions</h3>
            {recentTx.length === 0 ? (
              <div style={styles.empty}>
                <p style={{ color: '#6b7280' }}>No transactions yet.</p>
              </div>
            ) : (
              recentTx.map(tx => (
                <div key={tx.id} style={styles.txCard}>
                  <div>
                    <p style={{ color: '#fff', margin: 0, textTransform: 'capitalize', fontWeight: '500' }}>{tx.type}</p>
                    <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: tx.type === 'withdrawal' ? '#ef4444' : '#00ff88', margin: 0, fontWeight: 'bold' }}>
                      {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount}
                    </p>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px',
                      background: tx.status === 'confirmed' ? '#00ff8822' : tx.status === 'rejected' ? '#ef444422' : '#f59e0b22',
                      color: tx.status === 'confirmed' ? '#00ff88' : tx.status === 'rejected' ? '#ef4444' : '#f59e0b'
                    }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  welcome: { marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#111827', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #1f2937' },
  iconBox: { padding: '0.7rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardLabel: { color: '#6b7280', margin: 0, fontSize: '0.85rem' },
  cardValue: { margin: '0.2rem 0 0', fontWeight: 'bold', fontSize: '1.3rem' },
  actions: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  section: { background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1f2937' },
  sectionTitle: { color: '#fff', margin: '0 0 1rem', fontSize: '1rem' },
  empty: { textAlign: 'center', padding: '2rem 0' },
  invCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', background: '#1f2937', borderRadius: '8px', marginBottom: '0.7rem' },
  txCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', background: '#1f2937', borderRadius: '8px', marginBottom: '0.7rem' },
}