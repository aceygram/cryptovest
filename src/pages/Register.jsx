import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'

const REFERRERS = {
  'ty75ghb':  { name:'Elon Musk',          avatar:'👨‍💼' },
  'k9x4mzt':  { name:'Nicholas Galitzine', avatar:'👨‍💻' },
  'q2v8rpl':  { name:'Timothée Chalamet',  avatar:'👨‍🎨' },
  'grace77q': { name:'Grace Okafor',        avatar:'👩‍💻' },
  'james4rt': { name:'James Oluwole',       avatar:'👨‍🦱' },
  'lucy55wx': { name:'Lucy Chen',           avatar:'👩‍🦰' },
  'dan001zz': { name:'Daniel Musa',         avatar:'👨‍🦳' },
  'emma88kk': { name:'Emma Williams',       avatar:'👩‍🦳' },
  'tony12pp': { name:'Tony Adeyemi',        avatar:'🧑‍💼' },
  'rose99vv': { name:'Rose Obi',            avatar:'👩‍🌾' },
}
const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }

export default function Register() {
  const { theme, toggleTheme, isDark } = useTheme()
  const t = tokens(theme)
  const [step, setStep] = useState(1)
  const [countries, setCountries] = useState([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [form, setForm] = useState({ full_name:'',email:'',dob:'',sex:'',country:'',phone_code:'+1',phone_cca2:'US',phone:'',password:'',confirm_password:'',ref_code:'' })
  const [loading, setLoading] = useState(false)
  const [showCodePicker, setShowCodePicker] = useState(false)
  const [codeSearch, setCodeSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(location.hash.replace('#',''))
    setForm(f=>({...f,full_name:params.get('name')||f.full_name,email:params.get('email')||f.email,ref_code:params.get('ref')||hashParams.get('ref')||f.ref_code}))
  }, [location])

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2')
      .then(r=>r.json())
      .then(data => {
        const list = data.filter(c=>c.idd?.root).map(c=>({
          code:c.idd.root+(c.idd.suffixes?.length===1?c.idd.suffixes[0]:''),
          name:c.name.common,flag:c.flag,cca2:c.cca2
        })).filter(c=>c.code&&c.code!=='+').sort((a,b)=>a.name.localeCompare(b.name))
        setCountries(list)
        setLoadingCountries(false)
        fetch('https://ipapi.co/json/').then(r=>r.json()).then(loc=>{
          const detected=list.find(c=>c.cca2===loc.country_code)
          const fallback=list.find(c=>c.cca2==='NG')
          const match=detected||fallback
          if(match) setForm(f=>({...f,phone_code:match.code,phone_cca2:match.cca2}))
        }).catch(()=>{ const ng=list.find(c=>c.cca2==='NG'); if(ng) setForm(f=>({...f,phone_code:ng.code,phone_cca2:ng.cca2})) })
      })
      .catch(()=>{ setLoadingCountries(false); toast.error('Could not load countries') })
  }, [])

  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const filteredCodes=countries.filter(c=>c.name.toLowerCase().includes(codeSearch.toLowerCase())||c.code.includes(codeSearch)).slice(0,80)
  const selectedCountry=countries.find(c=>c.cca2===form.phone_cca2)||countries.find(c=>c.code===form.phone_code)

  const validateStep1=()=>{
    if(!form.full_name.trim()) return 'Full name is required'
    if(!form.email.trim()) return 'Email is required'
    if(!form.dob) return 'Date of birth is required'
    const age=Math.floor((Date.now()-new Date(form.dob))/(365.25*24*60*60*1000))
    if(age<18) return 'You must be at least 18 years old'
    if(!form.sex) return 'Please select your sex'
    if(!form.country) return 'Select your country'
    if(!form.phone.trim()) return 'Phone number is required'
    return null
  }
  const validateStep2=()=>{
    if(!form.password) return 'Password is required'
    if(form.password.length<8) return 'Password must be at least 8 characters'
    if(!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter'
    if(!/[0-9]/.test(form.password)) return 'Password must contain a number'
    if(form.password!==form.confirm_password) return 'Passwords do not match'
    return null
  }
  const handleNext=()=>{ const e=validateStep1(); if(e){toast.error(e);return}; setStep(2) }
  const handleSubmit=async()=>{
    const e=validateStep2(); if(e){toast.error(e);return}
    setLoading(true)
    const { error }=await supabase.auth.signUp({ email:form.email,password:form.password,
      options:{ data:{ full_name:form.full_name,dob:form.dob,sex:form.sex,nationality:form.country,phone:`${form.phone_code}${form.phone}`,ref_code:form.ref_code||null } }
    })
    if(error) toast.error(error.message)
    else { toast.success('Account created! Check your email to confirm.'); setTimeout(()=>navigate('/login'),3000) }
    setLoading(false)
  }

  const pwStrength=()=>{
    const p=form.password; if(!p) return {score:0,label:'',color:t.cardBorder}
    let s=0; if(p.length>=8)s++; if(p.length>=12)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++
    if(s<=1) return {score:s,label:'Weak',color:t.red}; if(s<=3) return {score:s,label:'Fair',color:t.yellow}; return {score:s,label:'Strong',color:t.green}
  }
  const strength=pwStrength()
  const referrer=REFERRERS[form.ref_code?.toLowerCase()]
  const avatarEmoji=SEX_AVATARS[form.sex]||'🧑'
  const inp={ width:'100%',padding:'.82rem 1rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.text,fontFamily:'DM Sans',fontSize:'.9rem',outline:'none',boxSizing:'border-box' }
  const lbl={ color:t.textSub,fontFamily:'DM Sans',fontSize:'.72rem',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:'.4rem' }

  return (
    <div style={{ minHeight:'100vh',background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}.ri:focus{border-color:#00d4ff66!important;outline:none}.ri::placeholder{color:${t.textMuted}}select.ri{appearance:none;cursor:pointer}.code-opt:hover{background:${t.hover}!important;cursor:pointer}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${t.input}}::-webkit-scrollbar-thumb{background:${t.cardBorder};border-radius:2px}`}</style>
      <Toaster position="top-center"/>
      <button onClick={toggleTheme} style={{ position:'fixed',top:'1rem',right:'1rem',background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'8px',cursor:'pointer',padding:'.5rem .7rem',color:t.textSub,display:'flex',alignItems:'center',gap:'.3rem',fontFamily:'DM Sans',fontSize:'.8rem' }}>
        {isDark?<Sun size={15}/>:<Moon size={15}/>}
      </button>
      <div style={{ width:'100%',maxWidth:'500px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'.6rem',justifyContent:'center',marginBottom:'2rem' }}>
          <div style={{ width:'36px',height:'36px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.85rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
          <span style={{ color:t.text,fontWeight:'800',fontSize:'1.15rem',letterSpacing:'-.03em' }}>SentientTrade</span>
        </div>
        <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'18px',padding:'2rem',boxShadow:t.shadow }}>
          <div style={{ display:'flex',alignItems:'center',gap:'.8rem',marginBottom:'1.4rem' }}>
            <span style={{ fontSize:'1.8rem' }}>{avatarEmoji}</span>
            <div>
              <h2 style={{ color:t.text,fontWeight:'800',fontSize:'1.4rem',letterSpacing:'-.02em',margin:0 }}>{step===1?'Create Account':'Set Password'}</h2>
              <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.82rem',margin:'.15rem 0 0' }}>Step {step} of 2 — {step===1?'Personal Information':'Account Security'}</p>
            </div>
          </div>
          <div style={{ display:'flex',gap:'.4rem',marginBottom:'1.8rem' }}>
            {[1,2].map(s=><div key={s} style={{ flex:1,height:'3px',borderRadius:'99px',background:s<=step?'linear-gradient(90deg,#00d4ff,#00ff88)':t.cardBorder,transition:'background .4s' }}/>)}
          </div>

          {step===1 && (
            <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
              <div><label style={lbl}>Full Name</label><input className="ri" style={inp} placeholder="e.g. John Smith" value={form.full_name} onChange={e=>set('full_name',e.target.value)}/></div>
              <div><label style={lbl}>Email Address</label><input className="ri" style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.7rem' }}>
                <div><label style={lbl}>Date of Birth</label><input className="ri" style={{...inp,colorScheme:isDark?'dark':'light'}} type="date" max={new Date(Date.now()-18*365.25*24*60*60*1000).toISOString().split('T')[0]} value={form.dob} onChange={e=>set('dob',e.target.value)}/></div>
                <div><label style={lbl}>Sex</label><select className="ri" style={{...inp,background:t.input}} value={form.sex} onChange={e=>set('sex',e.target.value)}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="neutral">Prefer not to say</option></select></div>
              </div>
              <div><label style={lbl}>Country</label><select className="ri" style={{...inp,background:t.input}} value={form.country} onChange={e=>set('country',e.target.value)} disabled={loadingCountries}><option value="">{loadingCountries?'Loading countries...':'Select your country'}</option>{countries.map(c=><option key={c.cca2} value={c.name}>{c.flag} {c.name}</option>)}</select></div>
              <div>
                <label style={lbl}>Phone Number</label>
                <div style={{ display:'flex',gap:'.5rem' }}>
                  <div style={{ position:'relative',flexShrink:0 }}>
                    <button type="button" onClick={()=>setShowCodePicker(o=>!o)} style={{ display:'flex',alignItems:'center',gap:'.4rem',padding:'.82rem .9rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.text,fontFamily:'DM Sans',fontSize:'.86rem',cursor:'pointer',whiteSpace:'nowrap' }}>
                      <span>{selectedCountry?.flag||'🌍'}</span><span>{form.phone_code}</span>
                      <span style={{ color:t.textMuted,fontSize:'.68rem',display:'inline-block',transition:'transform .2s',transform:showCodePicker?'rotate(180deg)':'rotate(0)' }}>▼</span>
                    </button>
                    {showCodePicker && (
                      <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'10px',padding:'.4rem',zIndex:50,maxHeight:'240px',overflowY:'auto',minWidth:'230px',boxShadow:t.shadow }}>
                        <input style={{ width:'100%',padding:'.5rem .7rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'6px',color:t.text,fontFamily:'DM Sans',fontSize:'.8rem',outline:'none',marginBottom:'.4rem',boxSizing:'border-box' }} placeholder="Search country..." value={codeSearch} onChange={e=>setCodeSearch(e.target.value)}/>
                        {filteredCodes.map((c,i)=>(
                          <div key={i} className="code-opt" onClick={()=>{ setForm(f=>({...f,phone_code:c.code,phone_cca2:c.cca2})); setShowCodePicker(false); setCodeSearch('') }} style={{ display:'flex',alignItems:'center',gap:'.6rem',padding:'.5rem .7rem',borderRadius:'6px',transition:'background .15s' }}>
                            <span>{c.flag}</span><span style={{ color:t.text,fontFamily:'DM Sans',fontSize:'.8rem',flex:1 }}>{c.name}</span><span style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.76rem' }}>{c.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input className="ri" style={{...inp,flex:1}} type="tel" placeholder="555-123-4567" value={form.phone} onChange={e=>set('phone',e.target.value.replace(/\D/g,''))}/>
                </div>
              </div>
              <div>
                <label style={lbl}>Referral Code <span style={{ color:t.textMuted,textTransform:'none',letterSpacing:0 }}>(optional)</span></label>
                <input className="ri" style={{...inp,borderColor:referrer?t.green+'44':t.inputBorder}} placeholder="e.g. ty75ghb" value={form.ref_code} onChange={e=>set('ref_code',e.target.value)}/>
                {referrer && <div style={{ display:'flex',alignItems:'center',gap:'.6rem',marginTop:'.5rem',background:t.green+'08',border:`1px solid ${t.green}22`,borderRadius:'8px',padding:'.5rem .8rem' }}><span style={{ fontSize:'1.2rem' }}>{referrer.avatar}</span><span style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.8rem' }}>Invited by <strong>{referrer.name}</strong></span></div>}
                {form.ref_code&&!referrer&&form.ref_code.length>=4&&<p style={{ color:t.red,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>Invalid referral code</p>}
              </div>
              <button onClick={handleNext} style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',marginTop:'.2rem' }}>Continue →</button>
            </div>
          )}

          {step===2 && (
            <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
              <div>
                <label style={lbl}>Password</label>
                <input className="ri" style={inp} type="password" placeholder="Min. 8 characters" value={form.password} onChange={e=>set('password',e.target.value)}/>
                {form.password && (
                  <div style={{ marginTop:'.5rem' }}>
                    <div style={{ display:'flex',gap:'.3rem',marginBottom:'.22rem' }}>{[1,2,3,4,5].map(i=><div key={i} style={{ flex:1,height:'3px',borderRadius:'99px',background:i<=strength.score?strength.color:t.cardBorder,transition:'background .3s' }}/>)}</div>
                    <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.7rem' }}>Strength</span><span style={{ color:strength.color,fontFamily:'DM Sans',fontSize:'.7rem',fontWeight:'600' }}>{strength.label}</span></div>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Confirm Password</label>
                <input className="ri" style={{...inp,borderColor:form.confirm_password&&form.confirm_password!==form.password?t.red+'66':t.inputBorder}} type="password" placeholder="Re-enter password" value={form.confirm_password} onChange={e=>set('confirm_password',e.target.value)}/>
                {form.confirm_password&&form.confirm_password!==form.password&&<p style={{ color:t.red,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>Passwords do not match</p>}
                {form.confirm_password&&form.confirm_password===form.password&&<p style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>✓ Passwords match</p>}
              </div>
              <div style={{ background:t.input,borderRadius:'8px',padding:'.85rem 1rem',border:`1px solid ${t.cardBorder}` }}>
                <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.7rem',marginBottom:'.4rem',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.05em' }}>Requirements</p>
                {[[form.password.length>=8,'At least 8 characters'],[/[A-Z]/.test(form.password),'One uppercase letter'],[/[0-9]/.test(form.password),'One number'],[form.password===form.confirm_password&&!!form.confirm_password,'Passwords match']].map(([met,label],i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.25rem' }}>
                    <span style={{ color:met?t.green:t.textMuted,fontSize:'.75rem' }}>{met?'✓':'○'}</span>
                    <span style={{ color:met?t.text:t.textMuted,fontFamily:'DM Sans',fontSize:'.75rem' }}>{label}</span>
                  </div>
                ))}
              </div>
              {referrer && <div style={{ display:'flex',alignItems:'center',gap:'.6rem',background:t.green+'08',border:`1px solid ${t.green}22`,borderRadius:'8px',padding:'.5rem .8rem' }}><span style={{ fontSize:'1.2rem' }}>{referrer.avatar}</span><span style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.8rem' }}>Invited by <strong>{referrer.name}</strong></span></div>}
              <div style={{ display:'flex',gap:'.7rem' }}>
                <button onClick={()=>setStep(1)} style={{ flex:1,padding:'.9rem',background:'transparent',border:`1px solid ${t.cardBorder}`,color:t.textSub,borderRadius:'10px',fontFamily:'Syne',fontWeight:'600',fontSize:'.9rem',cursor:'pointer' }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex:2,padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading?'Creating...':'Create Account'}
                </button>
              </div>
            </div>
          )}
          <p style={{ textAlign:'center',color:t.textMuted,fontFamily:'DM Sans',fontSize:'.82rem',marginTop:'1.3rem',marginBottom:0 }}>
            Already have an account? <Link to="/login" style={{ color:t.cyan,textDecoration:'none' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}