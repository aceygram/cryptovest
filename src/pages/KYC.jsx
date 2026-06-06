import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Upload, CheckCircle, Clock, XCircle, Shield } from 'lucide-react'

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

const DOCUMENTS = [
  { id:'id_front', label:'ID Card (Front)', desc:'National ID, Passport, or Drivers License — front side' },
  { id:'id_back',  label:'ID Card (Back)',  desc:'Back side of your ID card' },
  { id:'selfie',   label:'Selfie with ID',  desc:'Hold your ID next to your face clearly' },
]

export default function KYC() {
  const { user, profile, fetchProfile } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})
  const [uploading, setUploading] = useState(false)
  const [existing, setExisting] = useState([])

  useEffect(() => { if (user) { fetchProfile(user.id); fetchExisting() } }, [user])

  const fetchExisting = async () => {
    const { data } = await supabase.from('kyc_documents').select('*').eq('user_id', user.id)
    setExisting(data||[])
  }

  const handleFileChange = (docType, e) => {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 5*1024*1024) return toast.error('File must be under 5MB')
    if (!['image/jpeg','image/png','image/jpg'].includes(file.type)) return toast.error('Only JPG and PNG files allowed')
    setFiles({...files,[docType]:file})
    setPreviews({...previews,[docType]:URL.createObjectURL(file)})
  }

  const handleSubmit = async () => {
    if (Object.keys(files).length < 3) return toast.error('Please upload all 3 documents')
    setUploading(true)
    try {
      for (const [docType, file] of Object.entries(files)) {
        const filePath = `${user.id}/${docType}_${Date.now()}.${file.name.split('.').pop()}`
        const { error:uploadError } = await supabase.storage.from('kyc-documents').upload(filePath, file, { upsert:true })
        if (uploadError) throw uploadError
        await supabase.from('kyc_documents').insert({ user_id:user.id, document_type:docType, file_path:filePath })
      }
      await supabase.from('profiles').update({ kyc_status:'pending', kyc_submitted_at:new Date().toISOString() }).eq('id', user.id)
      await fetchProfile(user.id); await fetchExisting()
      toast.success('KYC documents submitted! Under review.')
      setFiles({}); setPreviews({})
    } catch (err) { toast.error('Upload failed: '+err.message) }
    setUploading(false)
  }

  const statusConfig = {
    unverified:{ icon:<Shield size={20}/>,     color:t.textSub, label:'Not Submitted' },
    pending:   { icon:<Clock size={20}/>,      color:t.yellow,  label:'Under Review' },
    verified:  { icon:<CheckCircle size={20}/>,color:t.green,   label:'Verified' },
    rejected:  { icon:<XCircle size={20}/>,    color:t.red,     label:'Rejected' },
  }
  const status = statusConfig[profile?.kyc_status]||statusConfig.unverified
  const alreadySubmitted = ['pending','verified'].includes(profile?.kyc_status)
  const referrer = REFERRERS[profile?.ref_code?.toLowerCase()]

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');@media(max-width:480px){.kyc-doc-row{flex-direction:column!important;align-items:flex-start!important}}`}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'700px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:0, fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>KYC Verification</h2>
        <p style={{ color:t.textSub, margin:'.3rem 0 2rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>Verify your identity to unlock withdrawals</p>

        <div style={{ display:'flex',alignItems:'flex-start',gap:'1rem',padding:'1.2rem',borderRadius:'12px',border:`1px solid ${status.color}44`,background:status.color+'11',marginBottom:'1.5rem' }}>
          <span style={{ color:status.color,display:'flex',flexShrink:0 }}>{status.icon}</span>
          <div>
            <p style={{ color:status.color,margin:0,fontWeight:'700',fontFamily:'DM Sans' }}>Verification Status: {status.label}</p>
            {profile?.kyc_status==='rejected'&&profile?.kyc_rejection_reason&&<p style={{ color:t.red,margin:'.3rem 0 0',fontSize:'.85rem',fontFamily:'DM Sans' }}>Reason: {profile.kyc_rejection_reason}</p>}
            {profile?.kyc_status==='pending'&&<p style={{ color:t.textSub,margin:'.3rem 0 0',fontSize:'.85rem',fontFamily:'DM Sans' }}>Your documents are being reviewed. This usually takes 24 hours.</p>}
          </div>
        </div>

        {!alreadySubmitted && (
          <div style={{ background:t.card,borderRadius:'16px',padding:'1.8rem',border:`1px solid ${t.cardBorder}`,display:'flex',flexDirection:'column',gap:'1.2rem',marginBottom:'1.2rem' }}>
            <div style={{ background:t.input,padding:'1rem',borderRadius:'8px',borderLeft:`3px solid ${t.cyan}` }}>
              <p style={{ color:t.textSub,fontSize:'.85rem',margin:0,fontFamily:'DM Sans' }}>📋 Upload clear photos of your ID and a selfie holding it. Files must be JPG or PNG and under 5MB each.</p>
            </div>
            {DOCUMENTS.map(doc=>(
              <div key={doc.id} className="kyc-doc-row" style={{ display:'flex',alignItems:'center',gap:'1rem',padding:'1rem',background:t.input,borderRadius:'8px',border:`1px solid ${t.cardBorder}` }}>
                <div style={{ flex:1 }}>
                  <p style={{ color:t.text,margin:0,fontWeight:'600',fontFamily:'DM Sans',fontSize:'.9rem' }}>{doc.label}</p>
                  <p style={{ color:t.textSub,margin:'.2rem 0 0',fontSize:'.82rem',fontFamily:'DM Sans' }}>{doc.desc}</p>
                </div>
                <div style={{ flexShrink:0 }}>
                  {previews[doc.id] ? (
                    <div style={{ display:'flex',alignItems:'center',gap:'.5rem' }}>
                      <img src={previews[doc.id]} alt={doc.label} style={{ width:'80px',height:'60px',objectFit:'cover',borderRadius:'6px' }}/>
                      <CheckCircle size={16} color={t.green}/>
                    </div>
                  ) : (
                    <label style={{ display:'flex',alignItems:'center',gap:'.5rem',padding:'.6rem 1rem',background:t.hover,color:t.textSub,borderRadius:'8px',cursor:'pointer',fontSize:'.85rem',fontFamily:'DM Sans',border:`1px solid ${t.cardBorder}` }}>
                      <Upload size={16}/><span>Choose file</span>
                      <input type="file" accept="image/jpeg,image/png,image/jpg" style={{ display:'none' }} onChange={e=>handleFileChange(doc.id,e)}/>
                    </label>
                  )}
                </div>
              </div>
            ))}
            <button style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'1rem',cursor:'pointer',opacity:uploading?.7:1 }}
              onClick={handleSubmit} disabled={uploading}>
              {uploading?'Uploading...':'Submit for Verification'}
            </button>
          </div>
        )}

        {profile?.kyc_status==='verified' && (
          <div style={{ background:t.card,borderRadius:'16px',padding:'3rem',border:`1px solid ${t.cardBorder}`,textAlign:'center',marginBottom:'1.2rem' }}>
            <CheckCircle size={48} color={t.green} style={{ marginBottom:'1rem' }}/>
            <p style={{ color:t.text,fontSize:'1.2rem',fontWeight:'800',margin:'0 0 .5rem' }}>Identity Verified</p>
            <p style={{ color:t.textSub,fontFamily:'DM Sans',margin:0 }}>Your account is fully verified. You can withdraw without restrictions.</p>
          </div>
        )}

        {referrer && (
          <div style={{ background:t.card,border:`1px solid ${t.green}33`,borderRadius:'14px',padding:'1.3rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',marginTop:'.5rem' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'1rem' }}>
              <span style={{ fontSize:'2rem' }}>{referrer.avatar}</span>
              <div>
                <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.72rem',textTransform:'uppercase',letterSpacing:'.06em',margin:'0 0 .2rem' }}>You were invited by</p>
                <p style={{ color:t.text,fontFamily:'DM Sans',fontWeight:'600',fontSize:'1rem',margin:0 }}>{referrer.name}</p>
              </div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'.4rem',background:t.green+'11',border:`1px solid ${t.green}33`,padding:'.35rem .8rem',borderRadius:'99px' }}>
              <span style={{ fontSize:'.75rem' }}>🤝</span>
              <span style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.75rem',fontWeight:'600' }}>Referral Active</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
