import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { useTheme, tokens } from '../../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { sendEmail, emailTemplates } from '../../lib/email'

export default function AdminWithdrawals() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const [withdrawals, setWithdrawals] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => { fetchWithdrawals() }, [filter])

  const fetchWithdrawals = async () => {
    setLoading(true)
    const query = supabase.from('transactions').select('*, profiles(full_name,email)').eq('type','withdrawal').order('created_at',{ascending:false})
    if (filter!=='all') query.eq('status',filter)
    const { data } = await query
    setWithdrawals(data||[]); setLoading(false)
  }

  const handleApprove = async (tx) => {
    setProcessing(tx.id)
    const { error } = await supabase.from('transactions').update({ status:'confirmed' }).eq('id',tx.id)
    if (error) { toast.error('Failed to approve'); setProcessing(null); return }
    const template = emailTemplates.withdrawalApproved({ name:tx.profiles?.full_name, amount:tx.amount, currency:tx.crypto_currency, wallet:tx.crypto_address })
    const emailRes = await sendEmail({ to_email:tx.profiles?.email, to_name:tx.profiles?.full_name, ...template })
    if (!emailRes.success) toast.error('Email failed: ' + emailRes.error)
    else toast.success(`Approved $${tx.amount}`)
    fetchWithdrawals()
    setProcessing(null)
  }

  const handleReject = async (tx) => {
    setProcessing(tx.id)
    const { error } = await supabase.rpc('refund_withdrawal',{ transaction_id:tx.id })
    if (error) { toast.error('Failed to reject: ' + error.message); setProcessing(null); return }
    const template = emailTemplates.withdrawalRejected({ name:tx.profiles?.full_name, amount:tx.amount })
    const emailRes = await sendEmail({ to_email:tx.profiles?.email, to_name:tx.profiles?.full_name, ...template })
    if (!emailRes.success) toast.error('Email failed: ' + emailRes.error)
    else toast.success(`Rejected & refunded $${tx.amount}`)
    fetchWithdrawals()
    setProcessing(null)
  }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @media(max-width:700px){
          .aw-row{flex-direction:column!important;align-items:flex-start!important;gap:.8rem!important}
          .aw-wallet{word-break:break-all!important}
          .aw-actions{width:100%!important;justify-content:flex-start!important}
        }
      `}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:'0 0 .3rem', fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Withdrawal Requests</h2>
        <p style={{ color:t.textSub, margin:'0 0 1.5rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>Approve or reject user withdrawal requests</p>

        <div style={{ display:'flex',gap:'.5rem',marginBottom:'1.5rem',flexWrap:'wrap' }}>
          {['pending','confirmed','rejected','all'].map(tab=>(
            <button key={tab} onClick={()=>setFilter(tab)}
              style={{ padding:'.48rem 1.1rem',borderRadius:'99px',border:'none',cursor:'pointer',fontSize:'.82rem',fontFamily:'DM Sans',fontWeight:'600',transition:'all .2s',background:filter===tab?'linear-gradient(135deg,#00d4ff,#00ff88)':t.card,color:filter===tab?'#020817':t.textSub,border:filter===tab?'none':`1px solid ${t.cardBorder}` }}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ background:t.card, borderRadius:'16px', padding:'1.2rem', border:`1px solid ${t.cardBorder}` }}>
          {loading ? (
            <p style={{ color:t.textSub,textAlign:'center',padding:'3rem',fontFamily:'DM Sans' }}>Loading...</p>
          ) : withdrawals.length===0 ? (
            <p style={{ color:t.textMuted,textAlign:'center',padding:'3rem',fontFamily:'DM Sans' }}>No {filter} withdrawals.</p>
          ) : (
            withdrawals.map(tx=>(
              <div key={tx.id} className="aw-row" style={{ display:'flex',alignItems:'center',gap:'1.5rem',padding:'1.2rem',background:t.input,borderRadius:'10px',marginBottom:'.7rem',border:`1px solid ${t.cardBorder}`,flexWrap:'wrap' }}>

                <div style={{ minWidth:'160px' }}>
                  <p style={{ color:t.text,margin:0,fontWeight:'600',fontFamily:'DM Sans',fontSize:'.88rem' }}>{tx.profiles?.full_name}</p>
                  <p style={{ color:t.textSub,margin:'.15rem 0 0',fontSize:'.78rem',fontFamily:'DM Sans' }}>{tx.profiles?.email}</p>
                </div>

                <div style={{ minWidth:'90px' }}>
                  <p style={{ color:t.red,margin:0,fontWeight:'800',fontSize:'1.1rem',fontFamily:'DM Sans' }}>${tx.amount}</p>
                  <p style={{ color:t.textMuted,margin:'.1rem 0 0',fontSize:'.75rem',textTransform:'uppercase',fontFamily:'DM Sans' }}>{tx.crypto_currency}</p>
                </div>

                <div className="aw-wallet" style={{ flex:1,minWidth:'140px' }}>
                  <p style={{ color:t.textMuted,margin:0,fontSize:'.75rem',fontFamily:'DM Sans' }}>Wallet</p>
                  <p style={{ color:t.text,margin:'.1rem 0 0',fontSize:'.82rem',fontFamily:'DM Sans',wordBreak:'break-all' }}>{tx.crypto_address}</p>
                </div>

                <div style={{ minWidth:'85px' }}>
                  <p style={{ color:t.textMuted,margin:0,fontSize:'.78rem',fontFamily:'DM Sans' }}>{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>

                <div className="aw-actions" style={{ display:'flex',gap:'.5rem',justifyContent:'flex-end',flexShrink:0 }}>
                  {tx.status==='pending' ? (
                    <>
                      <button style={{ display:'flex',alignItems:'center',gap:'.3rem',padding:'.5rem 1rem',background:t.green+'22',color:t.green,border:`1px solid ${t.green}44`,borderRadius:'6px',cursor:'pointer',fontSize:'.82rem',fontWeight:'600',fontFamily:'DM Sans',opacity:processing===tx.id?.6:1 }}
                        onClick={()=>handleApprove(tx)} disabled={processing===tx.id}>
                        <CheckCircle size={14}/> Approve
                      </button>
                      <button style={{ display:'flex',alignItems:'center',gap:'.3rem',padding:'.5rem 1rem',background:t.red+'22',color:t.red,border:`1px solid ${t.red}44`,borderRadius:'6px',cursor:'pointer',fontSize:'.82rem',fontWeight:'600',fontFamily:'DM Sans',opacity:processing===tx.id?.6:1 }}
                        onClick={()=>handleReject(tx)} disabled={processing===tx.id}>
                        <XCircle size={14}/> Reject
                      </button>
                    </>
                  ) : (
                    <span style={{ padding:'.4rem .8rem',borderRadius:'99px',fontSize:'.78rem',fontWeight:'600',fontFamily:'DM Sans',background:tx.status==='confirmed'?t.green+'22':t.red+'22',color:tx.status==='confirmed'?t.green:t.red }}>
                      {tx.status==='confirmed'?'✓':'✕'} {tx.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}