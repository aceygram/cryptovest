import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'

const DOMAIN = 'https://sentienttrade.online'

export default function Login() {
  const { theme, toggleTheme, isDark } = useTheme()
  const t = tokens(theme)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleLogin = async () => {
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email:form.email, password:form.password })
    if (error) toast.error(error.message)
    else navigate('/dashboard')
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!form.email) return toast.error('Enter your email address')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `https://www.sentienttrade.online/reset-password`
    })
    if (error) toast.error(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  const inp = { width:'100%',padding:'.85rem 1rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.text,fontFamily:'DM Sans',fontSize:'.9rem',boxSizing:'border-box',outline:'none' }

  return (
    <div style={{ minHeight:'100vh',background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        .li:focus{border-color:#00d4ff66!important;outline:none}
        .li::placeholder{color:${t.textMuted}}
      `}</style>
      <Toaster position="top-center"/>

      {/* Theme toggle top right */}
      <button onClick={toggleTheme} style={{ position:'fixed',top:'1rem',right:'1rem',background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'8px',cursor:'pointer',padding:'.5rem .7rem',color:t.textSub,display:'flex',alignItems:'center',gap:'.3rem',fontFamily:'DM Sans',fontSize:'.8rem' }}>
        {isDark?<Sun size={15}/>:<Moon size={15}/>}
      </button>

      <div style={{ width:'100%',maxWidth:'420px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'.6rem',justifyContent:'center',marginBottom:'2rem' }}>
          <div style={{ width:'36px',height:'36px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.85rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
          <span style={{ color:t.text,fontWeight:'800',fontSize:'1.15rem',letterSpacing:'-.03em' }}>SentientTrade</span>
        </div>
        <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'18px',padding:'2rem',boxShadow:t.shadow }}>

          {mode==='login' && (
            <>
              <h2 style={{ color:t.text,fontWeight:'800',fontSize:'1.5rem',letterSpacing:'-.02em',margin:'0 0 .3rem' }}>Welcome Back</h2>
              <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.85rem',margin:'0 0 1.6rem' }}>Login to your investment account</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
                <input className="li" style={inp} type="email" placeholder="Email Address" value={form.email} onChange={e=>set('email',e.target.value)}/>
                <input className="li" style={inp} type="password" placeholder="Password" value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()}/>
                <div style={{ textAlign:'right',marginTop:'-.4rem' }}>
                  <span onClick={() => setMode('forgot')} style={{ color:t.cyan,fontFamily:'DM Sans',fontSize:'.8rem',cursor:'pointer' }}>Forgot password?</span>
                </div>
                <button onClick={handleLogin} disabled={loading}
                  style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading?'Logging in...':'Login to Dashboard'}
                </button>
              </div>
              <p style={{ textAlign:'center',color:t.textMuted,fontFamily:'DM Sans',fontSize:'.83rem',marginTop:'1.4rem',marginBottom:0 }}>
                No account? <Link to="/register" style={{ color:t.cyan,textDecoration:'none' }}>Create one free</Link>
              </p>
            </>
          )}

          {mode==='forgot' && !resetSent && (
            <>
              <button onClick={() => setMode('login')} style={{ background:'none',border:'none',color:t.textSub,cursor:'pointer',fontFamily:'DM Sans',fontSize:'.82rem',padding:'0',marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:'.4rem' }}>← Back to login</button>
              <h2 style={{ color:t.text,fontWeight:'800',fontSize:'1.4rem',letterSpacing:'-.02em',margin:'0 0 .3rem' }}>Reset Password</h2>
              <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.85rem',margin:'0 0 1.6rem' }}>Enter your email and we'll send a reset link.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
                <input className="li" style={inp} type="email" placeholder="Your email address" value={form.email} onChange={e=>set('email',e.target.value)}/>
                <button onClick={handleForgot} disabled={loading}
                  style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading?'Sending...':'Send Reset Link'}
                </button>
              </div>
            </>
          )}

          {mode==='forgot' && resetSent && (
            <div style={{ textAlign:'center',padding:'1rem 0' }}>
              <div style={{ fontSize:'3rem',marginBottom:'1rem' }}>📬</div>
              <h3 style={{ color:t.text,fontWeight:'800',fontSize:'1.2rem',margin:'0 0 .6rem' }}>Check your inbox</h3>
              <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.88rem',lineHeight:1.7,margin:'0 0 1.5rem' }}>
                We sent a reset link to <strong style={{ color:t.cyan }}>{form.email}</strong>. Click it to set a new password.
              </p>
              <button onClick={() => { setMode('login'); setResetSent(false) }}
                style={{ background:t.hover,border:`1px solid ${t.cardBorder}`,color:t.textSub,padding:'.7rem 1.5rem',borderRadius:'8px',fontFamily:'DM Sans',cursor:'pointer',fontSize:'.88rem' }}>
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}