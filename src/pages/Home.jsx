import { Link } from 'react-router-dom'
export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰 CryptoVest</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Grow your crypto with fixed ROI plans</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/register" style={{ padding: '0.8rem 2rem', background: '#00ff88', color: '#0a0f1e', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>Get Started</Link>
        <Link to="/login" style={{ padding: '0.8rem 2rem', background: '#1f2937', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>Login</Link>
      </div>
    </div>
  )
}