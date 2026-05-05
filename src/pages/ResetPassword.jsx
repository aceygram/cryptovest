import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'

export default function ResetPassword() {
  const { theme, toggleTheme, isDark } = useTheme()
  const t = tokens(theme)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
      else { toast.error('Invalid or expired reset link'); setTimeout(() => navigate('/login'), 2000) }
    })
  }, [])

  const pwStrength = () => {
    if (!password) return { score:0, label:'', color:t.cardBorder }
    let s=0
    if (password.length>=8) s++; if (password.length>=12) s++
    if (/[A-Z]/.test(password)) s++; if (/[0-9]/.test(password)) s++; if (/[^A-Za-z0-9]/.test(password)) s++
    if (s<=1) return {score:s,label:'Weak',color:t.red}
    if (s<=3) return {score:s,label:'Fair',color:t.yellow}
    return {score:s,label:'Strong',color:t.green}
  }
  const strength = pwStrength()

  const handleReset = async () => {
    if (!password) return toast.error('Enter a new password')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) toast.error(error.message)
    else { toast.success('Password updated! Redirecting...'); setTimeout(() => navigate('/dashboard'), 2000) }
    setLoading(false)
  }

  const inp = { width:'100%',padding:'.85rem 1rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.text,fontFamily:'DM Sans',fontSize:'.9rem',boxSizing:'border-box',outline:'none' }

  return (
    <div style={{ minHeight:'100vh',background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}.rp:focus{border-color:#00d4ff66!important;outline:none}.rp::placeholder{color:${t.textMuted}}`}</style>
      <Toaster position="top-center"/>
      <button onClick={toggleTheme} style={{ position:'fixed',top:'1rem',right:'1rem',background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'8px',cursor:'pointer',padding:'.5rem .7rem',color:t.textSub,display:'flex',alignItems:'center',gap:'.3rem',fontFamily:'DM Sans',fontSize:'.8rem' }}>
        {isDark?<Sun size={15}/>:<Moon size={15}/>}
      </button>
      <div style={{ width:'100%',maxWidth:'420px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'.6rem',justifyContent:'center',marginBottom:'2rem' }}>
          <div style={{ width:'36px',height:'36px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.85rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
          <span style={{ color:t.text,fontWeight:'800',fontSize:'1.15rem',letterSpacing:'-.03em' }}>SentientTrade</span>
        </div>
        <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'18px',padding:'2rem',boxShadow:t.shadow }}>
          {!ready ? (
            <p style={{ color:t.textSub,fontFamily:'DM Sans',textAlign:'center',padding:'2rem 0' }}>Verifying reset link...</p>
          ) : (
            <>
              <h2 style={{ color:t.text,fontWeight:'800',fontSize:'1.4rem',letterSpacing:'-.02em',margin:'0 0 .3rem' }}>Set New Password</h2>
              <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.85rem',margin:'0 0 1.6rem' }}>Choose a strong password for your account.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
                <div>
                  <input className="rp" style={inp} type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)}/>
                  {password && (
                    <div style={{ marginTop:'.5rem' }}>
                      <div style={{ display:'flex',gap:'.3rem',marginBottom:'.22rem' }}>
                        {[1,2,3,4,5].map(i=><div key={i} style={{ flex:1,height:'3px',borderRadius:'99px',background:i<=strength.score?strength.color:t.cardBorder,transition:'background .3s' }}/>)}
                      </div>
                      <span style={{ color:strength.color,fontFamily:'DM Sans',fontSize:'.72rem' }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <input className="rp" style={{...inp,borderColor:confirm&&confirm!==password?t.red+'66':t.inputBorder}}
                  type="password" placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)}/>
                {confirm&&confirm!==password&&<p style={{ color:t.red,fontFamily:'DM Sans',fontSize:'.75rem',marginTop:'-.5rem' }}>Passwords do not match</p>}
                <button onClick={handleReset} disabled={loading}
                  style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading?'Updating...':'Update Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}