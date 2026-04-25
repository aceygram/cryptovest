import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } }
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Please check your email to confirm.')
      setTimeout(() => navigate('/login'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={styles.wrapper}>
      <Toaster />
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Start growing your crypto today</p>

        <input style={styles.input} name="full_name" placeholder="Full Name"
          onChange={handleChange} value={form.full_name} />
        <input style={styles.input} name="email" type="email" placeholder="Email"
          onChange={handleChange} value={form.email} />
        <input style={styles.input} name="password" type="password" placeholder="Password (min 6 chars)"
          onChange={handleChange} value={form.password} />

        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>

        <p style={styles.link}>Already have an account? <Link to="/login" style={{ color: '#00ff88' }}>Login</Link></p>
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