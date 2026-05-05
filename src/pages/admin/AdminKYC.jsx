import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { useTheme, tokens } from '../../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { sendEmail } from '../../lib/email'

const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }

export default function AdminKYC() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [docUrls, setDocUrls] = useState({})
  const [rejectReason, setRejectReason] = useState('')
  const [filter, setFilter] = useState('pending')

  useEffect(() => { fetchSubmissions() }, [filter])

  const fetchSubmissions = async () => {
    setLoading(true)
    const query = supabase.from('profiles').select('*, kyc_documents(*)').order('kyc_submitted_at',{ascending:false})
    if (filter!=='all') query.eq('kyc_status',filter)
    const { data } = await query
    setSubmissions(data?.filter(u=>u.kyc_documents?.length>0)||[])
    setLoading(false)
  }

  const loadDocuments = async (user) => {
    setViewing(user)
    const urls = {}
    for (const doc of user.kyc_documents) {
      const { data } = await supabase.storage.from('kyc-documents').createSignedUrl(doc.file_path, 3600)
      if (data) urls[doc.document_type] = data.signedUrl
    }
    setDocUrls(urls)
  }

  const handleApprove = async (user) => {
    setProcessing(user.id)
    await supabase.from('profiles').update({ kyc_status:'verified', kyc_reviewed_at:new Date().toISOString(), kyc_rejection_reason:null }).eq('id',user.id)
    await sendEmail({
      to_email:user.email, to_name:user.full_name,
      subject:'✅ KYC Verified — SentientTrade',
      html_content:`<div style="font-family:Arial,sans-serif;background:#020817;padding:40px;max-width:600px;margin:0 auto;border-radius:16px;"><h1 style="color:#00d4ff;text-align:center;">SentientTrade</h1><div style="background:#030e1f;padding:30px;border-radius:12px;"><h2 style="color:#00ff88;">Identity Verified!</h2><p style="color:#9ca3af;">Hi ${user.full_name},</p><p style="color:#9ca3af;">Your identity has been verified. Your account is now fully activated and you can make withdrawals without restrictions.</p></div></div>`
    })
    toast.success(`${user.full_name} verified`)
    setViewing(null); fetchSubmissions(); setProcessing(null)
  }

  const handleReject = async (user) => {
    if (!rejectReason) return toast.error('Enter a rejection reason')
    setProcessing(user.id)
    await supabase.from('profiles').update({ kyc_status:'rejected', kyc_reviewed_at:new Date().toISOString(), kyc_rejection_reason:rejectReason }).eq('id',user.id)
    await sendEmail({
      to_email:user.email, to_name:user.full_name,
      subject:'❌ KYC Rejected — SentientTrade',
      html_content:`<div style="font-family:Arial,sans-serif;background:#020817;padding:40px;max-width:600px;margin:0 auto;border-radius:16px;"><h1 style="color:#00d4ff;text-align:center;">SentientTrade</h1><div style="background:#030e1f;padding:30px;border-radius:12px;"><h2 style="color:#ef4444;">KYC Rejected</h2><p style="color:#9ca3af;">Hi ${user.full_name},</p><p style="color:#9ca3af;">Your KYC submission was rejected:</p><div style="background:#ef444411;border:1px solid #ef444433;padding:15px;border-radius:8px;margin:15px 0;"><p style="color:#ef4444;margin:0;">${rejectReason}</p></div><p style="color:#9ca3af;">Please resubmit with correct documents.</p></div></div>`
    })
    toast.success(`${user.full_name} rejected`)
    setViewing(null); setRejectReason(''); fetchSubmissions(); setProcessing(null)
  }

  const DOC_LABELS = { id_front:'ID Front', id_back:'ID Back', selfie:'Selfie with ID' }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @media(max-width:600px){
          .ak-row{flex-wrap:wrap!important;gap:.7rem!important}
          .ak-docs-grid{grid-template-columns:1fr!important}
          .ak-modal{padding:1.2rem!important}
          .ak-modal-actions{flex-direction:column!important}
        }
      `}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:'0 0 .3rem', fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>KYC Submissions</h2>
        <p style={{ color:t.textSub, margin:'0 0 1.5rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>Review and verify user identity documents</p>

        <div style={{ display:'flex',gap:'.5rem',marginBottom:'1.5rem',flexWrap:'wrap' }}>
          {['pending','verified','rejected','all'].map(tab=>(
            <button key={tab} onClick={()=>setFilter(tab)}
              style={{ padding:'.48rem 1.1rem',borderRadius:'99px',border:'none',cursor:'pointer',fontSize:'.82rem',fontFamily:'DM Sans',fontWeight:'600',transition:'all .2s',background:filter===tab?'linear-gradient(135deg,#00d4ff,#00ff88)':t.card,color:filter===tab?'#020817':t.textSub,border:filter===tab?'none':`1px solid ${t.cardBorder}` }}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ background:t.card, borderRadius:'16px', padding:'1.2rem', border:`1px solid ${t.cardBorder}` }}>
          {loading ? (
            <p style={{ color:t.textSub,textAlign:'center',padding:'2rem',fontFamily:'DM Sans' }}>Loading...</p>
          ) : submissions.length===0 ? (
            <p style={{ color:t.textMuted,textAlign:'center',padding:'2rem',fontFamily:'DM Sans' }}>No {filter} submissions.</p>
          ) : (
            submissions.map(user=>(
              <div key={user.id} className="ak-row" style={{ display:'flex',alignItems:'center',gap:'1rem',padding:'1rem',background:t.input,borderRadius:'10px',marginBottom:'.6rem',border:`1px solid ${t.cardBorder}` }}>
                <div style={{ width:'40px',height:'40px',borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff22,#00ff8822)',border:'1px solid #00d4ff44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',flexShrink:0 }}>
                  {SEX_AVATARS[user.sex]||user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ color:t.text,margin:0,fontWeight:'600',fontFamily:'DM Sans',fontSize:'.88rem' }}>{user.full_name}</p>
                  <p style={{ color:t.textSub,margin:'.1rem 0 0',fontSize:'.78rem',fontFamily:'DM Sans',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user.email}</p>
                  <p style={{ color:t.textMuted,margin:'.1rem 0 0',fontSize:'.72rem',fontFamily:'DM Sans' }}>
                    {user.kyc_submitted_at?new Date(user.kyc_submitted_at).toLocaleDateString():'N/A'}
                  </p>
                </div>
                <span style={{ padding:'.3rem .75rem',borderRadius:'99px',fontSize:'.76rem',fontWeight:'600',fontFamily:'DM Sans',flexShrink:0,
                  background:user.kyc_status==='verified'?t.green+'22':user.kyc_status==='rejected'?t.red+'22':t.yellow+'22',
                  color:user.kyc_status==='verified'?t.green:user.kyc_status==='rejected'?t.red:t.yellow }}>
                  {user.kyc_status}
                </span>
                <button onClick={()=>loadDocuments(user)}
                  style={{ display:'flex',alignItems:'center',gap:'.4rem',padding:'.5rem .9rem',background:t.blue+'22',color:t.blue,border:`1px solid ${t.blue}44`,borderRadius:'6px',cursor:'pointer',fontSize:'.8rem',fontFamily:'DM Sans',fontWeight:'600',flexShrink:0 }}>
                  <Eye size={14}/> View
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {viewing && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem' }}>
            <div className="ak-modal" style={{ background:t.card,borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'680px',maxHeight:'90vh',overflowY:'auto',border:`1px solid ${t.cardBorder}`,boxShadow:t.shadow }}>
              <div style={{ display:'flex',alignItems:'center',gap:'.8rem',marginBottom:'1.4rem' }}>
                <div style={{ width:'44px',height:'44px',borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff22,#00ff8822)',border:'1px solid #00d4ff44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem' }}>
                  {SEX_AVATARS[viewing.sex]||viewing.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color:t.text,margin:0,fontWeight:'700',fontFamily:'DM Sans' }}>{viewing.full_name}</p>
                  <p style={{ color:t.textSub,margin:'.1rem 0 0',fontSize:'.82rem',fontFamily:'DM Sans' }}>{viewing.email}</p>
                </div>
              </div>

              <div className="ak-docs-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.4rem' }}>
                {viewing.kyc_documents.map(doc=>(
                  <div key={doc.id} style={{ background:t.input,padding:'.8rem',borderRadius:'8px',border:`1px solid ${t.cardBorder}` }}>
                    <p style={{ color:t.textSub,margin:'0 0 .5rem',fontSize:'.75rem',textTransform:'uppercase',fontFamily:'DM Sans' }}>{DOC_LABELS[doc.document_type]}</p>
                    {docUrls[doc.document_type] ? (
                      <img src={docUrls[doc.document_type]} alt={doc.document_type} style={{ width:'100%',borderRadius:'6px',objectFit:'cover',maxHeight:'180px' }}/>
                    ) : (
                      <div style={{ background:t.hover,height:'100px',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center' }}>
                        <p style={{ color:t.textMuted,fontSize:'.78rem',fontFamily:'DM Sans' }}>Loading...</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {viewing.kyc_status==='pending' && (
                <>
                  <input placeholder="Rejection reason (required to reject)"
                    style={{ width:'100%',padding:'.82rem 1rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.text,fontSize:'.88rem',boxSizing:'border-box',marginBottom:'1rem',outline:'none',fontFamily:'DM Sans' }}
                    value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
                  <div className="ak-modal-actions" style={{ display:'flex',gap:'.8rem',marginBottom:'1rem' }}>
                    <button style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem',padding:'.75rem',background:t.green+'22',color:t.green,border:`1px solid ${t.green}44`,borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontFamily:'DM Sans',opacity:processing===viewing.id?.6:1 }}
                      onClick={()=>handleApprove(viewing)} disabled={processing===viewing.id}>
                      <CheckCircle size={15}/> Approve
                    </button>
                    <button style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem',padding:'.75rem',background:t.red+'22',color:t.red,border:`1px solid ${t.red}44`,borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontFamily:'DM Sans',opacity:processing===viewing.id?.6:1 }}
                      onClick={()=>handleReject(viewing)} disabled={processing===viewing.id}>
                      <XCircle size={15}/> Reject
                    </button>
                  </div>
                </>
              )}

              <button style={{ width:'100%',padding:'.8rem',background:t.input,color:t.textSub,border:`1px solid ${t.cardBorder}`,borderRadius:'8px',cursor:'pointer',fontFamily:'DM Sans',fontWeight:'600' }}
                onClick={()=>{ setViewing(null); setDocUrls({}); setRejectReason('') }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}