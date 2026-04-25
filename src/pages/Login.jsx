import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })
    if (error) {
      toast.error(error.message)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={styles.wrapper}>
      <Toaster />
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.sub}>Login to your investment account</p>

        <input style={styles.input} name="email" type="email" placeholder="Email"
          onChange={handleChange} value={form.email} />
        <input style={styles.input} name="password" type="password" placeholder="Password"
          onChange={handleChange} value={form.password} />

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p style={styles.link}>No account? <Link to="/register" style={{ color: '#00ff88' }}>Register</Link></p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: { minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#111827', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 0 40px rgba(0,255,136,0.08)' },
  title: { color: '#fff', fontSize: '1.8rem', marginBottom: '0.3rem' },
  sub: { color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.85rem 1rem', marginBottom: '1rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '0.9rem', background: '#00ff88', color: '#0a0f1e', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' },
  link: { color: '#6b7280', textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem' }
}