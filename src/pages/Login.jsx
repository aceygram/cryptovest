import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleLogin = async () => {
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) toast.error(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!form.email) return toast.error('Enter your email address')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) toast.error(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  const inp = { width:'100%',padding:'.85rem 1rem',background:'#020c1b',border:'1px solid #0f2a4a',borderRadius:'8px',color:'#f1f5f9',fontFamily:'DM Sans',fontSize:'.9rem',boxSizing:'border-box',outline:'none' }

  return (
    <div style={{ minHeight:'100vh',background:'#020817',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        .li:focus{border-color:#00d4ff66!important;outline:none}
        .li::placeholder{color:#334155}
      `}</style>
      <Toaster position="top-center" />
      <div style={{ width:'100%',maxWidth:'420px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'.6rem',justifyContent:'center',marginBottom:'2rem' }}>
          <div style={{ width:'34px',height:'34px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'1rem',color:'#020817' }}>₿</div>
          <span style={{ color:'#fff',fontWeight:'700',fontSize:'1.15rem',letterSpacing:'-.02em' }}>CryptoVest</span>
        </div>
        <div style={{ background:'#030e1f',border:'1px solid #0f2a4a',borderRadius:'18px',padding:'2rem',boxShadow:'0 24px 60px rgba(0,0,0,.5)' }}>

          {mode === 'login' && (
            <>
              <h2 style={{ color:'#f1f5f9',fontWeight:'800',fontSize:'1.5rem',letterSpacing:'-.02em',margin:'0 0 .3rem' }}>Welcome Back</h2>
              <p style={{ color:'#475569',fontFamily:'DM Sans',fontSize:'.85rem',margin:'0 0 1.6rem' }}>Login to your investment account</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
                <input className="li" style={inp} type="email" placeholder="Email Address" value={form.email} onChange={e=>set('email',e.target.value)} />
                <input className="li" style={inp} type="password" placeholder="Password" value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} />
                <div style={{ textAlign:'right',marginTop:'-.4rem' }}>
                  <span onClick={() => setMode('forgot')} style={{ color:'#00d4ff',fontFamily:'DM Sans',fontSize:'.8rem',cursor:'pointer' }}>Forgot password?</span>
                </div>
                <button onClick={handleLogin} disabled={loading}
                  style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading ? 'Logging in...' : 'Login to Dashboard'}
                </button>
              </div>
              <p style={{ textAlign:'center',color:'#334155',fontFamily:'DM Sans',fontSize:'.83rem',marginTop:'1.4rem',marginBottom:0 }}>
                No account? <Link to="/register" style={{ color:'#00d4ff',textDecoration:'none' }}>Create one free</Link>
              </p>
            </>
          )}

          {mode === 'forgot' && !resetSent && (
            <>
              <button onClick={() => setMode('login')} style={{ background:'none',border:'none',color:'#475569',cursor:'pointer',fontFamily:'DM Sans',fontSize:'.82rem',padding:'0',marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:'.4rem' }}>← Back to login</button>
              <h2 style={{ color:'#f1f5f9',fontWeight:'800',fontSize:'1.4rem',letterSpacing:'-.02em',margin:'0 0 .3rem' }}>Reset Password</h2>
              <p style={{ color:'#475569',fontFamily:'DM Sans',fontSize:'.85rem',margin:'0 0 1.6rem' }}>Enter your email and we'll send a reset link.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
                <input className="li" style={inp} type="email" placeholder="Your email address" value={form.email} onChange={e=>set('email',e.target.value)} />
                <button onClick={handleForgot} disabled={loading}
                  style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </>
          )}

          {mode === 'forgot' && resetSent && (
            <div style={{ textAlign:'center',padding:'1rem 0' }}>
              <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>📬</div>
              <h3 style={{ color:'#f1f5f9',fontWeight:'800',fontSize:'1.2rem',margin:'0 0 .6rem' }}>Check your inbox</h3>
              <p style={{ color:'#475569',fontFamily:'DM Sans',fontSize:'.88rem',lineHeight:1.7,margin:'0 0 1.5rem' }}>
                We sent a reset link to <strong style={{ color:'#00d4ff' }}>{form.email}</strong>. Click it to set a new password.
              </p>
              <button onClick={() => { setMode('login'); setResetSent(false) }}
                style={{ background:'#0f2040',border:'1px solid #1e3a5f',color:'#94a3b8',padding:'.7rem 1.5rem',borderRadius:'8px',fontFamily:'DM Sans',cursor:'pointer',fontSize:'.88rem' }}>
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}