import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme, tokens } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BtcChart from '../components/BtcChart'
import { TrendingUp, ArrowDownCircle, ArrowUpCircle, DollarSign, Clock } from 'lucide-react'

function LiveChart({ t }) {
  const canvasRef = useRef(null)
  const dataRef = useRef([])
  const frameRef = useRef(null)
  const offsetRef = useRef(0)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    let last = 50
    for (let i=0;i<300;i++) { last+=((Math.random()-.48)*3); last=Math.max(10,Math.min(90,last)); dataRef.current.push(last) }
    const STEP=4, SPEED=0.8
    const draw = () => {
      const w=canvas.width=canvas.offsetWidth, h=canvas.height=canvas.offsetHeight
      if (offsetRef.current%STEP<SPEED) { last+=((Math.random()-.48)*2.5); last=Math.max(10,Math.min(90,last)); dataRef.current.push(last); if(dataRef.current.length>600) dataRef.current.shift() }
      offsetRef.current+=SPEED
      ctx.clearRect(0,0,w,h)
      ctx.strokeStyle='rgba(15,42,74,0.4)'; ctx.lineWidth=1
      for(let r=0;r<5;r++){const y=(h/4)*r;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
      const visibleCount=Math.ceil(w/STEP)+2
      const startIdx=Math.max(0,dataRef.current.length-visibleCount)
      const visible=dataRef.current.slice(startIdx)
      const pixelShift=offsetRef.current%STEP
      const toY=v=>h-(v/100)*h*.8-h*.1
      ctx.beginPath()
      visible.forEach((v,i)=>{ const x=i*STEP-pixelShift; if(i===0)ctx.moveTo(x,toY(v));else ctx.lineTo(x,toY(v)) })
      const grad=ctx.createLinearGradient(0,0,0,h)
      grad.addColorStop(0,'rgba(0,212,255,0.2)'); grad.addColorStop(1,'rgba(0,212,255,0)')
      ctx.strokeStyle='#00d4ff'; ctx.lineWidth=2; ctx.stroke()
      ctx.lineTo((visible.length-1)*STEP-pixelShift,h); ctx.lineTo(0,h); ctx.fillStyle=grad; ctx.fill()
      const tipX=(visible.length-1)*STEP-pixelShift, tipY=toY(visible[visible.length-1])
      ctx.beginPath();ctx.arc(tipX,tipY,4,0,Math.PI*2);ctx.fillStyle='#00d4ff';ctx.fill()
      ctx.beginPath();ctx.arc(tipX,tipY,8,0,Math.PI*2);ctx.fillStyle='rgba(0,212,255,0.2)';ctx.fill()
      frameRef.current=requestAnimationFrame(draw)
    }
    draw()
    return ()=>cancelAnimationFrame(frameRef.current)
  },[])
  return <canvas ref={canvasRef} style={{ width:'100%',height:'100%',display:'block' }}/>
}

function DonutChart({ balance, invested, earnings, t }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')
    const size=160; canvas.width=size; canvas.height=size
    const cx=size/2,cy=size/2,r=62,inner=42
    const total=(balance||0)+(invested||0)+(earnings||0)
    const segments=total===0?[{value:1,color:'#0f2040'}]:[{value:balance||0,color:'#00d4ff'},{value:invested||0,color:'#3b82f6'},{value:earnings||0,color:'#00ff88'}].filter(s=>s.value>0)
    let angle=-Math.PI/2
    segments.forEach(seg=>{
      const slice=(seg.value/(total||1))*Math.PI*2
      ctx.beginPath();ctx.arc(cx,cy,r,angle,angle+slice);ctx.arc(cx,cy,inner,angle+slice,angle,true);ctx.closePath();ctx.fillStyle=seg.color;ctx.fill()
      angle+=slice
    })
    ctx.fillStyle=t.text; ctx.font='bold 13px DM Sans'; ctx.textAlign='center'; ctx.textBaseline='middle'
    ctx.fillText(`$${total.toFixed(0)}`,cx,cy)
  },[balance,invested,earnings,t])
  return <canvas ref={canvasRef} style={{ width:'160px',height:'160px' }}/>
}

function BarChart({ transactions, t }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')
    const w=canvas.width=canvas.offsetWidth, h=canvas.height=canvas.offsetHeight
    ctx.clearRect(0,0,w,h)
    const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return{label:d.toLocaleDateString('en',{weekday:'short'}),value:0}})
    transactions?.forEach(tx=>{
      if(tx.type==='deposit'&&tx.status==='confirmed'){
        const daysAgo=Math.floor((Date.now()-new Date(tx.created_at))/(24*60*60*1000))
        if(daysAgo<7) days[6-daysAgo].value+=tx.amount
      }
    })
    const max=Math.max(...days.map(d=>d.value),1)
    const barW=Math.floor((w-40)/7)-8, baseY=h-28
    days.forEach((day,i)=>{
      const barH=Math.max(3,(day.value/max)*(h-48)), x=20+i*((w-40)/7), y=baseY-barH
      const grad=ctx.createLinearGradient(0,y,0,baseY)
      grad.addColorStop(0,'#00d4ff'); grad.addColorStop(1,'rgba(0,212,255,0.2)')
      ctx.fillStyle=day.value>0?grad:'#0f2040'
      ctx.beginPath();ctx.roundRect(x,y,barW,barH,[4,4,0,0]);ctx.fill()
      ctx.fillStyle=t.textMuted; ctx.font='10px DM Sans'; ctx.textAlign='center'
      ctx.fillText(day.label,x+barW/2,h-8)
    })
  },[transactions,t])
  return <canvas ref={canvasRef} style={{ width:'100%',height:'100%',display:'block' }}/>
}

export default function Dashboard() {
  const { profile, fetchProfile, user } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [investments, setInvestments] = useState([])
  const [recentTx, setRecentTx] = useState([])
  const [allTx, setAllTx] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if(user){fetchProfile(user.id);fetchData()} },[user])

  const fetchData = async () => {
    const [{data:inv},{data:tx}] = await Promise.all([
      supabase.from('investments').select('*,plans(name,roi_percent,duration_days)').eq('user_id',user.id).eq('status','active').order('created_at',{ascending:false}),
      supabase.from('transactions').select('*').eq('user_id',user.id).order('created_at',{ascending:false})
    ])
    setInvestments(inv||[]); setRecentTx((tx||[]).slice(0,5)); setAllTx(tx||[]); setLoading(false)
  }

  const statCards = [
    { label:'Available Balance', value:`$${profile?.balance?.toFixed(2)??"0.00"}`,       icon:<DollarSign size={18}/>, color:t.cyan },
    { label:'Total Invested',    value:`$${profile?.total_invested?.toFixed(2)??"0.00"}`, icon:<TrendingUp size={18}/>, color:t.blue },
    { label:'Total Earnings',    value:`$${profile?.total_earnings?.toFixed(2)??"0.00"}`, icon:<ArrowDownCircle size={18}/>, color:t.green },
    { label:'Active Plans',      value:investments.length,                                 icon:<Clock size={18}/>,      color:t.yellow },
  ]

  if (loading) return <div style={{ background:t.bg,minHeight:'100vh' }}><Navbar/><div style={{ color:t.textSub,textAlign:'center',marginTop:'20%',fontFamily:'DM Sans' }}>Loading...</div></div>

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @media(max-width:700px){.db-charts{grid-template-columns:1fr!important}.db-row{grid-template-columns:1fr!important}.db-stats{grid-template-columns:1fr 1fr!important}}
        @media(max-width:500px){.db-stats{grid-template-columns:1fr!important}.db-actions{flex-direction:column!important}}
      `}</style>
      <Navbar/>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <div style={{ marginBottom:'1.8rem' }}>
          <h2 style={{ color:t.text,margin:0,fontSize:'1.4rem',fontWeight:'800',letterSpacing:'-.02em' }}>Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h2>
          <p style={{ color:t.textSub,margin:'.3rem 0 0',fontFamily:'DM Sans',fontSize:'.88rem' }}>Here's your portfolio overview</p>
        </div>

        <div className="db-stats" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'1.5rem' }}>
          {statCards.map((card,i)=>(
            <div key={i} style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'12px',padding:'1.1rem',display:'flex',alignItems:'center',gap:'.9rem' }}>
              <div style={{ padding:'.65rem',borderRadius:'10px',background:card.color+'18',color:card.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{card.icon}</div>
              <div>
                <p style={{ color:t.textSub,margin:0,fontSize:'.75rem',fontFamily:'DM Sans' }}>{card.label}</p>
                <p style={{ color:card.color,margin:'.15rem 0 0',fontWeight:'800',fontSize:'1.15rem',letterSpacing:'-.02em' }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="db-charts" style={{ display:'grid',gridTemplateColumns:'1fr 300px',gap:'1rem',marginBottom:'1.5rem' }}>
          <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'14px',padding:'1.2rem' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem' }}>
              <div>
                <p style={{ color:t.text,margin:0,fontWeight:'700',fontSize:'.92rem' }}>AI Market Feed</p>
                <p style={{ color:t.textSub,margin:'.2rem 0 0',fontFamily:'DM Sans',fontSize:'.72rem' }}>Live signal stream</p>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:'.4rem',background:'#00d4ff11',border:'1px solid #00d4ff33',padding:'.28rem .7rem',borderRadius:'99px' }}>
                <span style={{ width:'6px',height:'6px',borderRadius:'50%',background:t.cyan,display:'inline-block',animation:'pulse 2s ease-in-out infinite' }}/>
                <span style={{ color:t.cyan,fontFamily:'DM Sans',fontSize:'.72rem' }}>LIVE</span>
              </div>
            </div>
            <div style={{ height:'160px' }}><LiveChart t={t}/></div>
          </div>

          <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'14px',padding:'1.2rem' }}>
            <p style={{ color:t.text,margin:'0 0 1rem',fontWeight:'700',fontSize:'.92rem' }}>Portfolio Split</p>
            <div style={{ display:'flex',alignItems:'center',gap:'1.2rem',justifyContent:'center',flexWrap:'wrap' }}>
              <DonutChart balance={profile?.balance} invested={profile?.total_invested} earnings={profile?.total_earnings} t={t}/>
              <div style={{ display:'flex',flexDirection:'column',gap:'.6rem' }}>
                {[{label:'Balance',value:`$${profile?.balance?.toFixed(0)??"0"}`,color:t.cyan},{label:'Invested',value:`$${profile?.total_invested?.toFixed(0)??"0"}`,color:t.blue},{label:'Earnings',value:`$${profile?.total_earnings?.toFixed(0)??"0"}`,color:t.green}].map((item,i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:'.5rem' }}>
                    <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:item.color,flexShrink:0 }}/>
                    <div>
                      <p style={{ color:t.textSub,margin:0,fontFamily:'DM Sans',fontSize:'.7rem' }}>{item.label}</p>
                      <p style={{ color:item.color,margin:0,fontFamily:'DM Sans',fontWeight:'700',fontSize:'.85rem' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="db-actions" style={{ display:'flex',gap:'.8rem',marginBottom:'1.5rem',flexWrap:'wrap' }}>
          {[{to:'/deposit',label:'Deposit',icon:<ArrowDownCircle size={15}/>,color:t.cyan},{to:'/withdraw',label:'Withdraw',icon:<ArrowUpCircle size={15}/>,color:t.red},{to:'/plans',label:'Invest Now',icon:<TrendingUp size={15}/>,color:t.green}].map(btn=>(
            <Link key={btn.to} to={btn.to} style={{ display:'flex',alignItems:'center',gap:'.5rem',padding:'.75rem 1.4rem',background:btn.color+'14',color:btn.color,border:`1px solid ${btn.color}33`,borderRadius:'8px',textDecoration:'none',fontFamily:'DM Sans',fontWeight:'600',fontSize:'.88rem' }}>
              {btn.icon} {btn.label}
            </Link>
          ))}
        </div>

        <div className="db-row" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem' }}>
          <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'14px',padding:'1.2rem' }}>
            <p style={{ color:t.text,margin:'0 0 .3rem',fontWeight:'700',fontSize:'.9rem' }}>7-Day Deposit Activity</p>
            <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.72rem',margin:'0 0 1rem' }}>Confirmed deposits per day</p>
            <div style={{ height:'130px' }}><BarChart transactions={allTx} t={t}/></div>
          </div>

          <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'14px',padding:'1.2rem' }}>
            <p style={{ color:t.text,margin:'0 0 1rem',fontWeight:'700',fontSize:'.9rem' }}>Active Investments</p>
            {investments.length===0 ? (
              <div style={{ textAlign:'center',padding:'1.5rem 0' }}>
                <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.85rem',marginBottom:'.5rem' }}>No active investments yet.</p>
                <Link to="/plans" style={{ color:t.cyan,fontFamily:'DM Sans',fontSize:'.82rem' }}>Browse Plans →</Link>
              </div>
            ) : investments.map(inv=>(
              <div key={inv.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.8rem',background:t.input,borderRadius:'8px',marginBottom:'.5rem',border:`1px solid ${t.cardBorder}` }}>
                <div>
                  <p style={{ color:t.text,margin:0,fontWeight:'600',fontSize:'.85rem',fontFamily:'DM Sans' }}>{inv.plans?.name} Plan</p>
                  <p style={{ color:t.textSub,margin:'.15rem 0 0',fontFamily:'DM Sans',fontSize:'.72rem' }}>{inv.plans?.duration_days}d · {inv.plans?.roi_percent}% ROI</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ color:t.cyan,margin:0,fontWeight:'700',fontSize:'.88rem',fontFamily:'DM Sans' }}>${inv.amount}</p>
                  <p style={{ color:t.green,margin:'.15rem 0 0',fontFamily:'DM Sans',fontSize:'.72rem' }}>+${inv.roi_amount?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'14px',padding:'1.2rem',marginBottom:'1.5rem' }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem' }}>
            <p style={{ color:t.text,margin:0,fontWeight:'700',fontSize:'.9rem' }}>Recent Transactions</p>
            <Link to="/history" style={{ color:t.cyan,fontFamily:'DM Sans',fontSize:'.78rem',textDecoration:'none' }}>View all →</Link>
          </div>
          {recentTx.length===0 ? <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.85rem',textAlign:'center',padding:'1.5rem 0' }}>No transactions yet.</p>
          : recentTx.map(tx=>{
            const isDebit=tx.type==='withdrawal'||tx.type==='investment'
            const statusColor=tx.status==='confirmed'?t.green:tx.status==='rejected'?t.red:t.yellow
            return (
              <div key={tx.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.8rem',background:t.input,borderRadius:'8px',marginBottom:'.4rem',border:`1px solid ${t.cardBorder}` }}>
                <div style={{ display:'flex',alignItems:'center',gap:'.7rem' }}>
                  <div style={{ width:'32px',height:'32px',borderRadius:'8px',background:isDebit?t.red+'18':t.cyan+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    {isDebit?<ArrowUpCircle size={14} color={t.red}/>:<ArrowDownCircle size={14} color={t.cyan}/>}
                  </div>
                  <div>
                    <p style={{ color:t.text,margin:0,fontFamily:'DM Sans',fontSize:'.82rem',fontWeight:'600',textTransform:'capitalize' }}>{tx.type}</p>
                    <p style={{ color:t.textMuted,margin:'.1rem 0 0',fontFamily:'DM Sans',fontSize:'.7rem' }}>{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ color:isDebit?t.red:t.cyan,margin:0,fontFamily:'DM Sans',fontWeight:'700',fontSize:'.88rem' }}>{isDebit?'-':'+'}${tx.amount}</p>
                  <span style={{ fontFamily:'DM Sans',fontSize:'.7rem',color:statusColor }}>{tx.status}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginBottom:'1rem' }}><BtcChart/></div>
      </div>
    </div>
  )
}