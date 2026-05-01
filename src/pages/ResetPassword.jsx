import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

export default function ResetPassword() {
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
    if (!password) return { score:0, label:'', color:'#0f2040' }
    let s = 0
    if (password.length>=8) s++; if (password.length>=12) s++
    if (/[A-Z]/.test(password)) s++; if (/[0-9]/.test(password)) s++; if (/[^A-Za-z0-9]/.test(password)) s++
    if (s<=1) return { score:s, label:'Weak', color:'#ef4444' }
    if (s<=3) return { score:s, label:'Fair', color:'#f59e0b' }
    return { score:s, label:'Strong', color:'#00ff88' }
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

  const inp = { width:'100%',padding:'.85rem 1rem',background:'#020c1b',border:'1px solid #0f2a4a',borderRadius:'8px',color:'#f1f5f9',fontFamily:'DM Sans',fontSize:'.9rem',boxSizing:'border-box',outline:'none' }

  return (
    <div style={{ minHeight:'100vh',background:'#020817',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        .rp:focus{border-color:#00d4ff66!important;outline:none}
        .rp::placeholder{color:#334155}
      `}</style>
      <Toaster position="top-center" />
      <div style={{ width:'100%',maxWidth:'420px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'.6rem',justifyContent:'center',marginBottom:'2rem' }}>
          <div style={{ width:'34px',height:'34px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'1rem',color:'#020817' }}>₿</div>
          <span style={{ color:'#fff',fontWeight:'700',fontSize:'1.15rem',letterSpacing:'-.02em' }}>CryptoVest</span>
        </div>
        <div style={{ background:'#030e1f',border:'1px solid #0f2a4a',borderRadius:'18px',padding:'2rem',boxShadow:'0 24px 60px rgba(0,0,0,.5)' }}>
          {!ready ? (
            <p style={{ color:'#475569',fontFamily:'DM Sans',textAlign:'center',padding:'2rem 0' }}>Verifying reset link...</p>
          ) : (
            <>
              <h2 style={{ color:'#f1f5f9',fontWeight:'800',fontSize:'1.4rem',letterSpacing:'-.02em',margin:'0 0 .3rem' }}>Set New Password</h2>
              <p style={{ color:'#475569',fontFamily:'DM Sans',fontSize:'.85rem',margin:'0 0 1.6rem' }}>Choose a strong password for your account.</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'.9rem' }}>
                <div>
                  <input className="rp" style={inp} type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} />
                  {password && (
                    <div style={{ marginTop:'.5rem' }}>
                      <div style={{ display:'flex',gap:'.3rem',marginBottom:'.22rem' }}>
                        {[1,2,3,4,5].map(i=><div key={i} style={{ flex:1,height:'3px',borderRadius:'99px',background:i<=strength.score?strength.color:'#0f2040',transition:'background .3s' }}/>)}
                      </div>
                      <span style={{ color:strength.color,fontFamily:'DM Sans',fontSize:'.72rem' }}>{strength.label}</span>
                    </div>
                  )}
                </div>
                <input className="rp" style={{ ...inp,borderColor:confirm&&confirm!==password?'#ef444466':'#0f2a4a' }}
                  type="password" placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)} />
                {confirm && confirm !== password && <p style={{ color:'#ef4444',fontFamily:'DM Sans',fontSize:'.75rem',marginTop:'-.5rem' }}>Passwords do not match</p>}
                <button onClick={handleReset} disabled={loading}
                  style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}