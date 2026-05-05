import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { useTheme, tokens } from '../../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Gift, Search } from 'lucide-react'
import { sendEmail, emailTemplates } from '../../lib/email'

const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }

export default function AdminUsers() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [crediting, setCrediting] = useState(null)
  const [creditForm, setCreditForm] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(users.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)))
  }, [search, users])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at',{ascending:false})
    setUsers(data||[]); setFiltered(data||[]); setLoading(false)
  }

  const handleCreditEarning = async (user) => {
    const amount = parseFloat(creditForm[user.id])
    if (!amount||amount<=0) return toast.error('Enter a valid amount')
    setCrediting(user.id)
    const { error } = await supabase.from('profiles').update({ balance:user.balance+amount, total_earnings:(user.total_earnings||0)+amount }).eq('id',user.id)
    if (error) { toast.error('Failed to credit earning'); setCrediting(null); return }
    await supabase.from('transactions').insert({ user_id:user.id, type:'earning', amount, status:'confirmed' })
    const template = emailTemplates.earningCredited({ name:user.full_name, amount, planName:null })
    await sendEmail({ to_email:user.email, to_name:user.full_name, ...template })
    toast.success(`$${amount} credited to ${user.full_name}`)
    setCreditForm({...creditForm,[user.id]:''})
    fetchUsers(); setCrediting(null)
  }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @media(max-width:700px){
          .au-card{flex-direction:column!important;align-items:flex-start!important}
          .au-stats{width:100%!important;justify-content:flex-start!important;flex-wrap:wrap!important}
          .au-credit{width:100%!important}
          .au-credit input{flex:1!important}
        }
      `}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:'0 0 .3rem', fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>User Management</h2>
        <p style={{ color:t.textSub, margin:'0 0 1.5rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>View users and credit earnings manually</p>

        {/* Search */}
        <div style={{ position:'relative', marginBottom:'1.5rem' }}>
          <Search size={15} style={{ position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:t.textMuted }}/>
          <input style={{ width:'100%',padding:'.82rem 1rem .82rem 2.6rem',background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'10px',color:t.text,fontFamily:'DM Sans',fontSize:'.88rem',outline:'none',boxSizing:'border-box' }}
            placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading ? <p style={{ color:t.textSub,fontFamily:'DM Sans' }}>Loading users...</p> : (
          filtered.map(user=>(
            <div key={user.id} className="au-card" style={{ background:t.card,borderRadius:'12px',padding:'1.4rem',border:`1px solid ${t.cardBorder}`,marginBottom:'.9rem',display:'flex',alignItems:'center',gap:'1.2rem',flexWrap:'wrap' }}>

              {/* User info */}
              <div style={{ display:'flex',gap:'.9rem',alignItems:'center',minWidth:'200px' }}>
                <div style={{ width:'44px',height:'44px',borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff22,#00ff8822)',border:'1px solid #00d4ff44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0 }}>
                  {SEX_AVATARS[user.sex]||user.full_name?.charAt(0).toUpperCase()||'?'}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ color:t.text,margin:0,fontWeight:'700',fontFamily:'DM Sans',fontSize:'.9rem' }}>{user.full_name}</p>
                  <p style={{ color:t.textSub,margin:'.15rem 0 0',fontSize:'.78rem',fontFamily:'DM Sans',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'160px' }}>{user.email}</p>
                  <p style={{ color:t.textMuted,margin:'.1rem 0 0',fontSize:'.72rem',fontFamily:'DM Sans' }}>Joined {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="au-stats" style={{ display:'flex',gap:'.7rem',flex:1 }}>
                {[{label:'Balance',value:`$${user.balance?.toFixed(2)||'0.00'}`,color:t.green},{label:'Invested',value:`$${user.total_invested?.toFixed(2)||'0.00'}`,color:t.blue},{label:'Earnings',value:`$${user.total_earnings?.toFixed(2)||'0.00'}`,color:t.yellow}].map((stat,i)=>(
                  <div key={i} style={{ background:t.input,padding:'.55rem .9rem',borderRadius:'8px',border:`1px solid ${t.cardBorder}`,minWidth:'80px' }}>
                    <p style={{ color:t.textMuted,margin:0,fontSize:'.7rem',fontFamily:'DM Sans' }}>{stat.label}</p>
                    <p style={{ color:stat.color,margin:'.15rem 0 0',fontWeight:'700',fontFamily:'DM Sans',fontSize:'.88rem' }}>{stat.value}</p>
                  </div>
                ))}
                {/* KYC badge */}
                <div style={{ background:t.input,padding:'.55rem .9rem',borderRadius:'8px',border:`1px solid ${t.cardBorder}` }}>
                  <p style={{ color:t.textMuted,margin:0,fontSize:'.7rem',fontFamily:'DM Sans' }}>KYC</p>
                  <p style={{ color:user.kyc_status==='verified'?t.green:user.kyc_status==='pending'?t.yellow:t.red,margin:'.15rem 0 0',fontWeight:'700',fontFamily:'DM Sans',fontSize:'.78rem' }}>
                    {user.kyc_status==='verified'?'✓ Verified':user.kyc_status==='pending'?'⏳ Pending':'⚠ None'}
                  </p>
                </div>
              </div>

              {/* Credit */}
              <div className="au-credit" style={{ display:'flex',gap:'.6rem',alignItems:'center' }}>
                <input type="number" placeholder="Amount ($)" style={{ padding:'.6rem .9rem',background:t.input,border:`1px solid ${t.cardBorder}`,borderRadius:'8px',color:t.text,fontSize:'.88rem',width:'130px',outline:'none',fontFamily:'DM Sans' }}
                  value={creditForm[user.id]||''} onChange={e=>setCreditForm({...creditForm,[user.id]:e.target.value})}/>
                <button style={{ display:'flex',alignItems:'center',gap:'.4rem',padding:'.6rem 1rem',background:t.yellow+'18',color:t.yellow,border:`1px solid ${t.yellow}33`,borderRadius:'8px',cursor:'pointer',fontSize:'.82rem',fontWeight:'600',fontFamily:'DM Sans',whiteSpace:'nowrap',opacity:crediting===user.id?.6:1 }}
                  onClick={()=>handleCreditEarning(user)} disabled={crediting===user.id}>
                  <Gift size={14}/>{crediting===user.id?'...':'Credit'}
                </button>
              </div>
            </div>
          ))
        )}
        {!loading&&filtered.length===0&&<p style={{ color:t.textMuted,textAlign:'center',fontFamily:'DM Sans',padding:'2rem 0' }}>No users found.</p>}
      </div>
    </div>
  )
}