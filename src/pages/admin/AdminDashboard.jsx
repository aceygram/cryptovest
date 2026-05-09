import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useTheme, tokens } from '../../context/ThemeContext'
import { Users, DollarSign, ArrowUpCircle, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const [stats, setStats] = useState({ totalUsers:0, totalDeposits:0, pendingWithdrawals:0, activeInvestments:0, totalWithdrawn:0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    const [
      { count:totalUsers },
      { data:deposits },
      { data:pendingW },
      { count:activeInv },
      { data:confirmedW },
      { data:users }
    ] = await Promise.all([
      supabase.from('profiles').select('*',{count:'exact',head:true}),
      supabase.from('transactions').select('amount').eq('type','deposit').eq('status','confirmed'),
      supabase.from('transactions').select('*').eq('type','withdrawal').eq('status','pending'),
      supabase.from('investments').select('*',{count:'exact',head:true}).eq('status','active'),
      supabase.from('transactions').select('amount').eq('type','withdrawal').eq('status','confirmed'),
      supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(5)
    ])
    setStats({
      totalUsers:totalUsers||0,
      totalDeposits:deposits?.reduce((s,d)=>s+d.amount,0)||0,
      pendingWithdrawals:pendingW?.length||0,
      activeInvestments:activeInv||0,
      totalWithdrawn:confirmedW?.reduce((s,w)=>s+w.amount,0)||0
    })
    setRecentUsers(users||[])
    setLoading(false)
  }

  const statCards = [
    { label:'Total Users',         value:stats.totalUsers,                        icon:<Users size={20}/>,       color:t.blue },
    { label:'Total Deposits',      value:`$${stats.totalDeposits.toFixed(2)}`,     icon:<DollarSign size={20}/>,  color:t.green },
    { label:'Pending Withdrawals', value:stats.pendingWithdrawals,                 icon:<ArrowUpCircle size={20}/>,color:t.red, link:'/admin/withdrawals' },
    { label:'Active Investments',  value:stats.activeInvestments,                  icon:<TrendingUp size={20}/>,  color:t.yellow },
    { label:'Total Withdrawn',     value:`$${stats.totalWithdrawn.toFixed(2)}`,    icon:<ArrowUpCircle size={20}/>,color:t.purple||'#8b5cf6' },
  ]

  if (loading) return <div style={{ background:t.bg,minHeight:'100vh' }}><Navbar/><div style={{ color:t.textSub,textAlign:'center',marginTop:'20%',fontFamily:'DM Sans' }}>Loading...</div></div>

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @media(max-width:600px){
          .adm-stat-grid{grid-template-columns:1fr 1fr!important}
          .adm-quick{flex-direction:column!important}
          .adm-user-row{flex-wrap:wrap!important;gap:.6rem!important}
          .adm-user-right{width:100%!important;text-align:left!important}
        }
        @media(max-width:500px){.adm-stat-grid{grid-template-columns:1fr!important}}
      `}</style>
      <Navbar/>
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:'0 0 .3rem', fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Admin Dashboard</h2>
        <p style={{ color:t.textSub, margin:'0 0 2rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>Platform overview</p>

        <div className="adm-stat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
          {statCards.map((card,i)=>(
            <div key={i} style={{ background:t.card,borderRadius:'12px',padding:'1.2rem',display:'flex',alignItems:'center',gap:'1rem',border:`1px solid ${t.cardBorder}`,cursor:card.link?'pointer':'default' }}
              onClick={()=>card.link&&(window.location.href=card.link)}>
              <div style={{ padding:'.65rem',borderRadius:'10px',background:card.color+'22',color:card.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{card.icon}</div>
              <div style={{ minWidth:0 }}>
                <p style={{ color:t.textSub,margin:0,fontSize:'.78rem',fontFamily:'DM Sans' }}>{card.label}</p>
                <p style={{ color:card.color,margin:'.15rem 0 0',fontWeight:'800',fontSize:'1.2rem',letterSpacing:'-.02em' }}>{card.value}</p>
              </div>
              {card.link&&card.value>0&&<span style={{ marginLeft:'auto',background:t.red+'22',color:t.red,padding:'.2rem .55rem',borderRadius:'99px',fontSize:'.7rem',fontFamily:'DM Sans',fontWeight:'600',flexShrink:0 }}>!</span>}
            </div>
          ))}
        </div>

        <div className="adm-quick" style={{ display:'flex', gap:'1rem', marginBottom:'2rem', flexWrap:'wrap' }}>
          {[{to:'/admin/withdrawals',label:'Manage Withdrawals',color:t.red},{to:'/admin/users',label:'Manage Users',color:t.blue},{to:'/admin/kyc',label:'KYC Review',color:t.yellow}, {to:'/admin/announcements',label:'Manage Announcements',color:t.green}, {to:'/admin/support',label:'Support',color:t.purple}].map(btn=>(
            <Link key={btn.to} to={btn.to} style={{ padding:'.7rem 1.4rem',borderRadius:'8px',textDecoration:'none',fontWeight:'600',fontSize:'.88rem',fontFamily:'DM Sans',background:btn.color+'18',color:btn.color,border:`1px solid ${btn.color}33` }}>{btn.label}</Link>
          ))}
        </div>

        <div style={{ background:t.card,borderRadius:'12px',padding:'1.5rem',border:`1px solid ${t.cardBorder}` }}>
          <h3 style={{ color:t.text,margin:'0 0 1rem',fontSize:'.95rem',fontWeight:'700' }}>Recent Registrations</h3>
          {recentUsers.map(u=>(
            <div key={u.id} className="adm-user-row" style={{ display:'flex',alignItems:'center',gap:'1rem',padding:'.9rem',background:t.input,borderRadius:'8px',marginBottom:'.5rem',border:`1px solid ${t.cardBorder}` }}>
              <div style={{ width:'38px',height:'38px',borderRadius:'50%',background:t.blue+'22',color:t.blue,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',flexShrink:0,fontSize:'.9rem' }}>
                {u.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <p style={{ color:t.text,margin:0,fontWeight:'600',fontFamily:'DM Sans',fontSize:'.88rem' }}>{u.full_name}</p>
                <p style={{ color:t.textSub,margin:'.1rem 0 0',fontSize:'.78rem',fontFamily:'DM Sans',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{u.email}</p>
              </div>
              <div className="adm-user-right" style={{ textAlign:'right',flexShrink:0 }}>
                <p style={{ color:t.green,margin:0,fontWeight:'700',fontFamily:'DM Sans' }}>${u.balance?.toFixed(2)}</p>
                <p style={{ color:t.textMuted,margin:'.1rem 0 0',fontSize:'.75rem',fontFamily:'DM Sans' }}>{new Date(u.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}