import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { Users, DollarSign, ArrowUpCircle, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    activeInvestments: 0,
    totalWithdrawn: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const [
      { count: totalUsers },
      { data: deposits },
      { data: pendingW },
      { count: activeInv },
      { data: confirmedW },
      { data: users }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'confirmed'),
      supabase.from('transactions').select('*').eq('type', 'withdrawal').eq('status', 'pending'),
      supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'confirmed'),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)
    ])

    const totalDeposits = deposits?.reduce((sum, d) => sum + d.amount, 0) || 0
    const totalWithdrawn = confirmedW?.reduce((sum, w) => sum + w.amount, 0) || 0

    setStats({
      totalUsers: totalUsers || 0,
      totalDeposits,
      pendingWithdrawals: pendingW?.length || 0,
      activeInvestments: activeInv || 0,
      totalWithdrawn
    })
    setRecentUsers(users || [])
    setLoading(false)
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={22} />, color: '#3b82f6' },
    { label: 'Total Deposits', value: `$${stats.totalDeposits.toFixed(2)}`, icon: <DollarSign size={22} />, color: '#00ff88' },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: <ArrowUpCircle size={22} />, color: '#ef4444', link: '/admin/withdrawals' },
    { label: 'Active Investments', value: stats.activeInvestments, icon: <TrendingUp size={22} />, color: '#f59e0b' },
    { label: 'Total Withdrawn', value: `$${stats.totalWithdrawn.toFixed(2)}`, icon: <ArrowUpCircle size={22} />, color: '#8b5cf6' },
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
        <div style={styles.header}>
          <h2 style={{ color: '#fff', margin: 0 }}>Admin Dashboard</h2>
          <p style={{ color: '#6b7280', margin: '0.3rem 0 0' }}>Platform overview</p>
        </div>

        {/* Stat Cards */}
        <div style={styles.grid}>
          {statCards.map((card, i) => (
            <div key={i} style={{ ...styles.card, ...(card.link ? { cursor: 'pointer' } : {}) }}
              onClick={() => card.link && (window.location.href = card.link)}>
              <div style={{ ...styles.iconBox, background: card.color + '22', color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p style={styles.cardLabel}>{card.label}</p>
                <p style={{ ...styles.cardValue, color: card.color }}>{card.value}</p>
              </div>
              {card.link && card.value > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef444422', color: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem' }}>
                  Action needed
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={styles.quickLinks}>
          <Link to="/admin/withdrawals" style={{ ...styles.quickBtn, background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444' }}>
            Manage Withdrawals
          </Link>
          <Link to="/admin/users" style={{ ...styles.quickBtn, background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f644' }}>
            Manage Users
          </Link>
        </div>

        {/* Recent Users */}
        <div style={styles.section}>
          <h3 style={{ color: '#fff', margin: '0 0 1rem' }}>Recent Registrations</h3>
          {recentUsers.map(u => (
            <div key={u.id} style={styles.userRow}>
              <div style={styles.avatar}>{u.full_name?.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', margin: 0, fontWeight: '600' }}>{u.full_name}</p>
                <p style={{ color: '#6b7280', margin: '0.1rem 0 0', fontSize: '0.82rem' }}>{u.email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#00ff88', margin: 0, fontWeight: 'bold' }}>${u.balance?.toFixed(2)}</p>
                <p style={{ color: '#6b7280', margin: '0.1rem 0 0', fontSize: '0.78rem' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { background: '#111827', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #1f2937' },
  iconBox: { padding: '0.7rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardLabel: { color: '#6b7280', margin: 0, fontSize: '0.82rem' },
  cardValue: { margin: '0.2rem 0 0', fontWeight: 'bold', fontSize: '1.3rem' },
  quickLinks: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  quickBtn: { padding: '0.7rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' },
  section: { background: '#111827', borderRadius: '12px', padding: '1.5rem', border: '1px solid #1f2937' },
  userRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem', background: '#1f2937', borderRadius: '8px', marginBottom: '0.6rem' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#3b82f622', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }
}