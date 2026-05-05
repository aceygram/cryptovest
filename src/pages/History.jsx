import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import BtcChart from '../components/BtcChart'
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Gift, Clock, CheckCircle, XCircle } from 'lucide-react'

function BalanceChart({ transactions, t }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')
    const w=canvas.width=canvas.offsetWidth, h=canvas.height=canvas.offsetHeight
    ctx.clearRect(0,0,w,h)
    if(!transactions||transactions.length===0){ ctx.fillStyle=t.textMuted; ctx.font='12px DM Sans'; ctx.textAlign='center'; ctx.fillText('No data yet',w/2,h/2); return }
    const sorted=[...transactions].reverse()
    let running=0
    const points=sorted.map(tx=>{ if(tx.status!=='confirmed') return null; if(tx.type==='deposit'||tx.type==='earning') running+=tx.amount; else if(tx.type==='withdrawal') running-=tx.amount; return running }).filter(v=>v!==null)
    if(points.length<2){ ctx.fillStyle=t.textMuted; ctx.font='12px DM Sans'; ctx.textAlign='center'; ctx.fillText('More transactions needed',w/2,h/2); return }
    const min=Math.min(...points,0), max=Math.max(...points,1)
    const pad={t:16,b:24,l:12,r:12}
    const chartW=w-pad.l-pad.r, chartH=h-pad.t-pad.b
    const toX=i=>pad.l+(i/(points.length-1))*chartW
    const toY=v=>pad.t+chartH-((v-min)/(max-min||1))*chartH
    ctx.strokeStyle='rgba(15,42,74,0.4)'; ctx.lineWidth=1
    for(let i=0;i<=3;i++){ const y=pad.t+(i/3)*chartH; ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke() }
    const grad=ctx.createLinearGradient(0,pad.t,0,h-pad.b)
    grad.addColorStop(0,'rgba(0,255,136,0.25)'); grad.addColorStop(1,'rgba(0,255,136,0)')
    ctx.beginPath(); points.forEach((v,i)=>{ const x=toX(i),y=toY(v); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y) })
    ctx.strokeStyle=t.green; ctx.lineWidth=2.5; ctx.stroke()
    ctx.lineTo(toX(points.length-1),h-pad.b); ctx.lineTo(toX(0),h-pad.b); ctx.closePath(); ctx.fillStyle=grad; ctx.fill()
    ctx.fillStyle=t.textSub; ctx.font='10px DM Sans'; ctx.textAlign='left'; ctx.fillText(`$${points[0].toFixed(0)}`,pad.l,h-6)
    ctx.textAlign='right'; ctx.fillStyle=t.green; ctx.fillText(`$${points[points.length-1].toFixed(0)}`,w-pad.r,h-6)
    const ex=toX(points.length-1),ey=toY(points[points.length-1])
    ctx.beginPath();ctx.arc(ex,ey,5,0,Math.PI*2);ctx.fillStyle=t.green;ctx.fill()
    ctx.beginPath();ctx.arc(ex,ey,10,0,Math.PI*2);ctx.fillStyle='rgba(0,255,136,0.2)';ctx.fill()
  },[transactions,t])
  return <canvas ref={canvasRef} style={{ width:'100%',height:'100%',display:'block' }}/>
}

function TypeBreakdown({ transactions, t }) {
  const types=['deposit','withdrawal','investment','earning']
  const colors={ deposit:t.cyan, withdrawal:t.red, investment:t.blue, earning:t.green }
  const totals={}
  types.forEach(type=>{ totals[type]=transactions?.filter(tx=>tx.type===type&&tx.status==='confirmed').reduce((s,tx)=>s+tx.amount,0)||0 })
  const max=Math.max(...Object.values(totals),1)
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:'.6rem' }}>
      {types.map(type=>(
        <div key={type}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'.25rem' }}>
            <span style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.72rem',textTransform:'capitalize' }}>{type}</span>
            <span style={{ color:colors[type],fontFamily:'DM Sans',fontSize:'.72rem',fontWeight:'600' }}>${totals[type].toFixed(0)}</span>
          </div>
          <div style={{ height:'5px',background:t.cardBorder,borderRadius:'99px',overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${(totals[type]/max)*100}%`,background:colors[type],borderRadius:'99px',transition:'width .6s ease' }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

const TYPE_CONFIG = {
  deposit:    { icon:<ArrowDownCircle size={16}/>, colorKey:'cyan',   label:'Deposit' },
  withdrawal: { icon:<ArrowUpCircle size={16}/>,   colorKey:'red',    label:'Withdrawal' },
  investment: { icon:<TrendingUp size={16}/>,      colorKey:'blue',   label:'Investment' },
  earning:    { icon:<Gift size={16}/>,            colorKey:'green',  label:'Earning' },
}

export default function History() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { if(user) fetchTransactions() },[user])

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').eq('user_id',user.id).order('created_at',{ascending:false})
    setTransactions(data||[]); setLoading(false)
  }

  const filtered = filter==='all'?transactions:transactions.filter(tx=>tx.type===filter)
  const statusIcon = s => s==='confirmed'?<CheckCircle size={13} color={t.green}/>:s==='rejected'?<XCircle size={13} color={t.red}/>:<Clock size={13} color={t.yellow}/>
  const statusColor = s => s==='confirmed'?t.green:s==='rejected'?t.red:t.yellow

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}@media(max-width:700px){.hist-top{grid-template-columns:1fr!important}}@media(max-width:480px){.hist-tabs{gap:.3rem!important}.hist-tab{padding:.42rem .8rem!important;font-size:.75rem!important}}`}</style>
      <Navbar/>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:'0 0 .3rem', fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Transaction History</h2>
        <p style={{ color:t.textSub, margin:'0 0 2rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>Your complete financial activity</p>

        <div className="hist-top" style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:'1rem', marginBottom:'1.5rem' }}>
          <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'14px', padding:'1.2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.8rem' }}>
              <div>
                <p style={{ color:t.text, margin:0, fontWeight:'700', fontSize:'.88rem' }}>Cumulative Balance</p>
                <p style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.72rem', margin:'.15rem 0 0' }}>Based on confirmed transactions</p>
              </div>
              <span style={{ color:t.green, fontFamily:'DM Sans', fontWeight:'700', fontSize:'.82rem' }}>
                ${transactions.filter(tx=>tx.status==='confirmed').reduce((s,tx)=>{ if(tx.type==='deposit'||tx.type==='earning') return s+tx.amount; if(tx.type==='withdrawal') return s-tx.amount; return s },0).toFixed(2)}
              </span>
            </div>
            <div style={{ height:'130px' }}><BalanceChart transactions={transactions} t={t}/></div>
          </div>
          <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'14px', padding:'1.2rem' }}>
            <p style={{ color:t.text, margin:'0 0 1rem', fontWeight:'700', fontSize:'.88rem' }}>Activity Breakdown</p>
            <TypeBreakdown transactions={transactions} t={t}/>
          </div>
        </div>

        <div className="hist-tabs" style={{ display:'flex', gap:'.5rem', marginBottom:'1.2rem', flexWrap:'wrap' }}>
          {['all','deposit','withdrawal','investment','earning'].map(tab=>(
            <button key={tab} className="hist-tab" onClick={()=>setFilter(tab)}
              style={{ padding:'.48rem 1.1rem', borderRadius:'99px', border:'none', cursor:'pointer', fontSize:'.8rem', fontFamily:'DM Sans', fontWeight:'600', transition:'all .2s', background:filter===tab?'linear-gradient(135deg,#00d4ff,#00ff88)':t.card, color:filter===tab?'#020817':t.textSub, border:filter===tab?'none':`1px solid ${t.cardBorder}` }}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'14px', padding:'1rem', overflow:'hidden', marginBottom:'1.5rem' }}>
          {loading ? <p style={{ color:t.textSub, textAlign:'center', padding:'3rem', fontFamily:'DM Sans' }}>Loading...</p>
          : filtered.length===0 ? <p style={{ color:t.textMuted, textAlign:'center', padding:'3rem', fontFamily:'DM Sans' }}>No transactions found.</p>
          : filtered.map(tx=>{
            const config=TYPE_CONFIG[tx.type]||TYPE_CONFIG.deposit
            const color=t[config.colorKey]||t.cyan
            const isDebit=tx.type==='withdrawal'||tx.type==='investment'
            return (
              <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:'.9rem', padding:'.85rem', borderRadius:'10px', marginBottom:'.4rem', background:t.input, border:`1px solid ${t.cardBorder}` }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'9px', background:color+'18', border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', color, flexShrink:0 }}>{config.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:t.text, margin:0, fontFamily:'DM Sans', fontWeight:'600', fontSize:'.85rem' }}>{config.label}</p>
                  <p style={{ color:t.textMuted, margin:'.12rem 0 0', fontFamily:'DM Sans', fontSize:'.72rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {new Date(tx.created_at).toLocaleString()}{tx.crypto_currency&&` · ${tx.crypto_currency.toUpperCase()}`}
                  </p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ color:isDebit?t.red:color, margin:0, fontFamily:'DM Sans', fontWeight:'700', fontSize:'.9rem' }}>{isDebit?'-':'+'}${tx.amount}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'.25rem', justifyContent:'flex-end', marginTop:'.2rem' }}>
                    {statusIcon(tx.status)}
                    <span style={{ fontSize:'.7rem', color:statusColor(tx.status), fontFamily:'DM Sans' }}>{tx.status}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <BtcChart/>
      </div>
    </div>
  )
}