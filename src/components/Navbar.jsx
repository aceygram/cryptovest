import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, TrendingUp, ArrowDownCircle, ArrowUpCircle, History, LogOut, Shield } from 'lucide-react'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>💰 CryptoVest</div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}><LayoutDashboard size={16} /> Dashboard</Link>
        <Link to="/plans" style={styles.link}><TrendingUp size={16} /> Plans</Link>
        <Link to="/deposit" style={styles.link}><ArrowDownCircle size={16} /> Deposit</Link>
        <Link to="/withdraw" style={styles.link}><ArrowUpCircle size={16} /> Withdraw</Link>
        <Link to="/history" style={styles.link}><History size={16} /> History</Link>
        <Link to="/kyc" style={styles.link}><Shield size={16} /> KYC</Link>
        {profile?.is_admin && <Link to="/admin" style={{ ...styles.link, color: '#f59e0b' }}>Admin</Link>}
        {profile?.is_admin && <Link to="/admin/kyc" style={{ ...styles.link, color: '#f59e0b' }}>KYC Review</Link>}
      </div>
      <div style={styles.right}>
        <span style={styles.name}>{profile?.full_name}</span>
        <button onClick={handleSignOut} style={styles.logout}><LogOut size={16} /></button>
      </div>
    </nav>
  )
}

const styles = {
  nav: { background: '#111827', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', position: 'sticky', top: 0, zIndex: 100 },
  logo: { color: '#00ff88', fontWeight: 'bold', fontSize: '1.2rem' },
  links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  link: { color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  right: { display: 'flex', alignItems: 'center', gap: '1rem' },
  name: { color: '#fff', fontSize: '0.9rem' },
  logout: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }
}