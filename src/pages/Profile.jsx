import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { User, Mail, Phone, Globe, Calendar, Shield, Eye, EyeOff } from 'lucide-react'

const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }
const REFERRERS = {
  'ty75ghb':  { name:'Elon Musk',          avatar:'👨‍💼' },
  'k9x4mzt':  { name:'Nicholas Galitzine', avatar:'👨‍💻' },
  'q2v8rpl':  { name:'Timothée Chalamet',  avatar:'👨‍🎨' },
  'grace77q': { name:'Grace Okafor',        avatar:'👩‍💻' },
  'james4rt': { name:'James Oluwole',       avatar:'👨‍🦱' },
  'lucy55wx': { name:'Lucy Chen',           avatar:'👩‍🦰' },
  'soph55wx': { name:'Sophie Cunningham',   avatar:'👩‍🦰' },
  'dan001zz': { name:'Daniel Musa',         avatar:'👨‍🦳' },
  'emma88kk': { name:'Emma Williams',       avatar:'👩‍🦳' },
  'tony12pp': { name:'Tony Adeyemi',        avatar:'🧑‍💼' },
  'rose99vv': { name:'Rose Obi',            avatar:'👩‍🌾' },
}

export default function Profile() {
  const { profile, user } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [mode, setMode] = useState('view')
  const [showPw, setShowPw] = useState({ current:false,new:false,confirm:false })
  const [pw, setPw] = useState({ current:'',new:'',confirm:'' })
  const [loading, setLoading] = useState(false)

  const setPwF=(k,v)=>setPw(f=>({...f,[k]:v}))
  const toggleShow=(k)=>setShowPw(f=>({...f,[k]:!f[k]}))
  const pwStrength=()=>{
    const p=pw.new; if(!p) return {score:0,label:'',color:t.cardBorder}
    let s=0; if(p.length>=8)s++; if(p.length>=12)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++
    if(s<=1) return {score:s,label:'Weak',color:t.red}; if(s<=3) return {score:s,label:'Fair',color:t.yellow}; return {score:s,label:'Strong',color:t.green}
  }
  const strength=pwStrength()

  const handlePasswordChange=async()=>{
    if(!pw.current) return toast.error('Enter your current password')
    if(!pw.new||pw.new.length<8) return toast.error('New password must be at least 8 characters')
    if(pw.new!==pw.confirm) return toast.error('Passwords do not match')
    setLoading(true)
    const { error:authErr }=await supabase.auth.signInWithPassword({ email:user.email,password:pw.current })
    if(authErr){ toast.error('Current password is incorrect'); setLoading(false); return }
    const { error }=await supabase.auth.updateUser({ password:pw.new })
    if(error) toast.error(error.message)
    else { toast.success('Password updated!'); setPw({ current:'',new:'',confirm:'' }); setMode('view') }
    setLoading(false)
  }

  const avatarEmoji=SEX_AVATARS[profile?.sex]||'🧑'
  const kycColor=profile?.kyc_status==='verified'?t.green:profile?.kyc_status==='pending'?t.yellow:t.red
  const referrer=REFERRERS[profile?.ref_code?.toLowerCase()]

  const infoRows=[
    { icon:<User size={15}/>,     label:'Full Name',    value:profile?.full_name },
    { icon:<Mail size={15}/>,     label:'Email',         value:profile?.email },
    { icon:<Phone size={15}/>,    label:'Phone',         value:profile?.phone||'—' },
    { icon:<Globe size={15}/>,    label:'Country',       value:profile?.nationality||'—' },
    { icon:<Calendar size={15}/>, label:'Date of Birth', value:profile?.dob?new Date(profile.dob).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'—' },
    { icon:<User size={15}/>,     label:'Sex',           value:profile?.sex?profile.sex.charAt(0).toUpperCase()+profile.sex.slice(1):'—' },
    { icon:<Shield size={15}/>,   label:'KYC Status',    value:profile?.kyc_status==='verified'?'✓ Verified':profile?.kyc_status==='pending'?'⏳ Under Review':'⚠ Not Submitted',color:kycColor },
    { icon:<Calendar size={15}/>, label:'Member Since',  value:profile?.created_at?new Date(profile.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'—' },
  ]
  const lbl={ color:t.textSub,fontFamily:'DM Sans',fontSize:'.72rem',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:'.4rem' }

  return (
    <div style={{ background:t.bg,minHeight:'100vh',fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}.pf:focus{border-color:#00d4ff66!important;outline:none}.pf::placeholder{color:${t.textMuted}}.pf-tab{transition:all .2s;cursor:pointer;border:none}.pf-tab:hover{background:${t.hover}!important}`}</style>
      <Toaster position="top-center"/>
      <Navbar/>
      <div style={{ maxWidth:'700px',margin:'0 auto',padding:'2rem 1.5rem' }}>
        <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'16px',padding:'1.8rem',marginBottom:'1.2rem',display:'flex',alignItems:'center',gap:'1.4rem',flexWrap:'wrap' }}>
          <div style={{ width:'72px',height:'72px',borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff22,#00ff8822)',border:'2px solid #00d4ff44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.4rem',flexShrink:0 }}>{avatarEmoji}</div>
          <div style={{ flex:1 }}>
            <h2 style={{ color:t.text,margin:0,fontSize:'1.3rem',fontWeight:'800',letterSpacing:'-.02em' }}>{profile?.full_name}</h2>
            <p style={{ color:t.textSub,margin:'.2rem 0 0',fontFamily:'DM Sans',fontSize:'.85rem' }}>{profile?.email}</p>
            <div style={{ display:'flex',gap:'.6rem',marginTop:'.7rem',flexWrap:'wrap' }}>
              <span style={{ background:'#00d4ff11',border:'1px solid #00d4ff33',color:t.cyan,fontFamily:'DM Sans',fontSize:'.72rem',padding:'.22rem .7rem',borderRadius:'99px' }}>${profile?.balance?.toFixed(2)??'0.00'} balance</span>
              <span style={{ background:kycColor+'11',border:`1px solid ${kycColor}33`,color:kycColor,fontFamily:'DM Sans',fontSize:'.72rem',padding:'.22rem .7rem',borderRadius:'99px' }}>
                {profile?.kyc_status==='verified'?'✓ KYC Verified':profile?.kyc_status==='pending'?'⏳ KYC Pending':'⚠ KYC Required'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display:'flex',gap:'.5rem',marginBottom:'1.2rem' }}>
          {[['view','👤 My Information'],['password','🔒 Change Password']].map(([tab,label])=>(
            <button key={tab} className="pf-tab" onClick={()=>setMode(tab)}
              style={{ padding:'.55rem 1.2rem',borderRadius:'8px',fontFamily:'DM Sans',fontWeight:'600',fontSize:'.82rem',background:mode===tab?'linear-gradient(135deg,#00d4ff22,#00ff8822)':t.card,color:mode===tab?t.cyan:t.textSub,borderTop:mode===tab?`1px solid #00d4ff44`:`1px solid ${t.cardBorder}` }}>
              {label}
            </button>
          ))}
        </div>

        {mode==='view' && (
          <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'16px',padding:'1.4rem' }}>
            <h3 style={{ color:t.text,margin:'0 0 1.2rem',fontSize:'.92rem',fontWeight:'700' }}>Account Information</h3>
            {infoRows.map((row,i)=>(
              <div key={i} style={{ display:'flex',alignItems:'center',gap:'1rem',padding:'.8rem',background:t.bgSub||t.input,borderRadius:'8px',marginBottom:'.5rem',border:`1px solid ${t.cardBorder}` }}>
                <div style={{ width:'32px',height:'32px',borderRadius:'7px',background:t.hover,display:'flex',alignItems:'center',justifyContent:'center',color:t.textSub,flexShrink:0 }}>{row.icon}</div>
                <div style={{ flex:1 }}>
                  <p style={{ color:t.textMuted,margin:0,fontFamily:'DM Sans',fontSize:'.7rem',textTransform:'uppercase',letterSpacing:'.05em' }}>{row.label}</p>
                  <p style={{ color:row.color||t.text,margin:'.15rem 0 0',fontFamily:'DM Sans',fontSize:'.88rem',fontWeight:'500' }}>{row.value||'—'}</p>
                </div>
              </div>
            ))}
            {referrer && (
              <div style={{ display:'flex',alignItems:'center',gap:'.8rem',marginTop:'.8rem',background:t.green+'08',border:`1px solid ${t.green}22`,borderRadius:'10px',padding:'1rem 1.1rem' }}>
                <span style={{ fontSize:'1.6rem' }}>{referrer.avatar}</span>
                <div>
                  <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.7rem',textTransform:'uppercase',letterSpacing:'.05em',margin:0 }}>Invited By</p>
                  <p style={{ color:t.green,fontFamily:'DM Sans',fontWeight:'600',fontSize:'.9rem',margin:'.15rem 0 0' }}>{referrer.name}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {mode==='password' && (
          <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'16px',padding:'1.4rem' }}>
            <h3 style={{ color:t.text,margin:'0 0 .4rem',fontSize:'.92rem',fontWeight:'700' }}>Change Password</h3>
            <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.82rem',margin:'0 0 1.4rem' }}>Confirm your identity with your current password first.</p>
            <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
              {[{key:'current',label:'Current Password',placeholder:'Your current password'},{key:'new',label:'New Password',placeholder:'Min. 8 characters'},{key:'confirm',label:'Confirm New Password',placeholder:'Re-enter new password'}].map(({ key,label,placeholder })=>(
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  <div style={{ display:'flex',gap:'.5rem' }}>
                    <input className="pf" style={{ flex:1,padding:'.82rem 1rem',background:t.input,border:`1px solid ${key==='confirm'&&pw.confirm&&pw.confirm!==pw.new?t.red+'66':t.inputBorder}`,borderRadius:'8px',color:t.text,fontFamily:'DM Sans',fontSize:'.9rem',outline:'none',boxSizing:'border-box' }}
                      type={showPw[key]?'text':'password'} placeholder={placeholder} value={pw[key]} onChange={e=>setPwF(key,e.target.value)}/>
                    <button onClick={()=>toggleShow(key)} style={{ background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.textSub,cursor:'pointer',padding:'0 .9rem',flexShrink:0 }}>
                      {showPw[key]?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                  {key==='new'&&pw.new&&(<div style={{ marginTop:'.5rem' }}><div style={{ display:'flex',gap:'.3rem',marginBottom:'.22rem' }}>{[1,2,3,4,5].map(i=><div key={i} style={{ flex:1,height:'3px',borderRadius:'99px',background:i<=strength.score?strength.color:t.cardBorder,transition:'background .3s' }}/>)}</div><div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.7rem' }}>Strength</span><span style={{ color:strength.color,fontFamily:'DM Sans',fontSize:'.7rem',fontWeight:'600' }}>{strength.label}</span></div></div>)}
                  {key==='confirm'&&pw.confirm&&pw.confirm!==pw.new&&<p style={{ color:t.red,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>Passwords do not match</p>}
                  {key==='confirm'&&pw.confirm&&pw.confirm===pw.new&&pw.new&&<p style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>✓ Passwords match</p>}
                </div>
              ))}
              <button onClick={handlePasswordChange} disabled={loading}
                style={{ width:'100%',padding:'.88rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.92rem',cursor:'pointer',opacity:loading?.7:1,marginTop:'.3rem' }}>
                {loading?'Updating...':'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
