import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { useTheme, tokens } from '../../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { MessageCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function AdminSupport() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('open')
  const [viewing, setViewing] = useState(null)
  const [reply, setReply] = useState('')
  const [processing, setProcessing] = useState(null)

  useEffect(() => { fetchTickets() }, [filter])

  const fetchTickets = async () => {
    setLoading(true)
    const query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') query.eq('status', filter)
    const { data } = await query
    setTickets(data || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    setProcessing(id)
    await supabase.from('support_tickets').update({ status }).eq('id', id)
    toast.success(`Ticket marked as ${status}`)
    setViewing(null)
    fetchTickets()
    setProcessing(null)
  }

  const statusIcon = s => s === 'resolved' ? <CheckCircle size={14} color={t.green}/> : s === 'closed' ? <XCircle size={14} color={t.red}/> : <Clock size={14} color={t.yellow}/>
  const statusColor = s => s === 'resolved' ? t.green : s === 'closed' ? t.red : t.yellow

  const categoryColors = { deposit:t.cyan, withdrawal:t.red, kyc:t.yellow, account:t.blue, investment:t.green, technical:t.purple||'#8b5cf6', general:t.textSub }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}@media(max-width:600px){.st-row{flex-wrap:wrap!important;gap:.6rem!important}}`}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:'0 0 .3rem', fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Support Tickets</h2>
        <p style={{ color:t.textSub, margin:'0 0 1.5rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>Manage user support requests</p>

        <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {['open','resolved','closed','all'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)}
              style={{ padding:'.48rem 1.1rem', borderRadius:'99px', border:'none', cursor:'pointer', fontSize:'.82rem', fontFamily:'DM Sans', fontWeight:'600', transition:'all .2s', background:filter===tab?'linear-gradient(135deg,#00d4ff,#00ff88)':t.card, color:filter===tab?'#020817':t.textSub, border:filter===tab?'none':`1px solid ${t.cardBorder}` }}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'14px', padding:'1.2rem' }}>
          {loading ? (
            <p style={{ color:t.textSub, textAlign:'center', padding:'3rem', fontFamily:'DM Sans' }}>Loading...</p>
          ) : tickets.length === 0 ? (
            <p style={{ color:t.textMuted, textAlign:'center', padding:'3rem', fontFamily:'DM Sans' }}>No {filter} tickets.</p>
          ) : tickets.map(ticket => (
            <div key={ticket.id} className="st-row" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', background:t.input, borderRadius:'10px', marginBottom:'.5rem', border:`1px solid ${t.cardBorder}` }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:(categoryColors[ticket.category]||t.cyan)+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <MessageCircle size={16} color={categoryColors[ticket.category]||t.cyan}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ color:t.text, margin:0, fontWeight:'700', fontFamily:'DM Sans', fontSize:'.88rem' }}>{ticket.subject}</p>
                <p style={{ color:t.textSub, margin:'.12rem 0 0', fontFamily:'DM Sans', fontSize:'.75rem' }}>
                  {ticket.user_name} · {ticket.user_email} · {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
              <span style={{ padding:'.22rem .65rem', borderRadius:'6px', fontSize:'.72rem', fontFamily:'DM Sans', fontWeight:'600', background:(categoryColors[ticket.category]||t.cyan)+'18', color:categoryColors[ticket.category]||t.cyan, flexShrink:0, textTransform:'capitalize' }}>
                {ticket.category}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:'.3rem', flexShrink:0 }}>
                {statusIcon(ticket.status)}
                <span style={{ color:statusColor(ticket.status), fontFamily:'DM Sans', fontSize:'.78rem', fontWeight:'600' }}>{ticket.status}</span>
              </div>
              <button onClick={() => setViewing(ticket)}
                style={{ padding:'.48rem 1rem', background:t.blue+'22', color:t.blue, border:`1px solid ${t.blue}33`, borderRadius:'6px', cursor:'pointer', fontFamily:'DM Sans', fontSize:'.8rem', fontWeight:'600', flexShrink:0 }}>
                View
              </button>
            </div>
          ))}
        </div>

        {/* Modal */}
        {viewing && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
            <div style={{ background:t.card, borderRadius:'16px', padding:'2rem', width:'100%', maxWidth:'600px', maxHeight:'90vh', overflowY:'auto', border:`1px solid ${t.cardBorder}`, boxShadow:t.shadow }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.4rem' }}>
                <div>
                  <p style={{ color:t.text, margin:0, fontWeight:'800', fontSize:'1rem' }}>{viewing.subject}</p>
                  <p style={{ color:t.textSub, margin:'.2rem 0 0', fontFamily:'DM Sans', fontSize:'.78rem' }}>{viewing.user_name} · {viewing.user_email}</p>
                  <p style={{ color:t.textMuted, margin:'.2rem 0 0', fontFamily:'DM Sans', fontSize:'.74rem' }}>{new Date(viewing.created_at).toLocaleString()} · {viewing.category}</p>
                </div>
                <button onClick={() => setViewing(null)} style={{ background:'none', border:'none', color:t.textSub, cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
              </div>

              <div style={{ background:t.input, borderRadius:'10px', padding:'1.2rem', marginBottom:'1.4rem', border:`1px solid ${t.cardBorder}` }}>
                <p style={{ color:t.textSub, margin:'0 0 .5rem', fontFamily:'DM Sans', fontSize:'.72rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.05em' }}>Message</p>
                <p style={{ color:t.text, margin:0, fontFamily:'DM Sans', fontSize:'.88rem', lineHeight:1.7 }}>{viewing.message}</p>
              </div>

              {viewing.status === 'open' && (
                <div style={{ display:'flex', gap:'.7rem' }}>
                  <button onClick={() => updateStatus(viewing.id, 'resolved')} disabled={processing === viewing.id}
                    style={{ flex:1, padding:'.82rem', background:t.green+'22', color:t.green, border:`1px solid ${t.green}44`, borderRadius:'10px', fontFamily:'Syne', fontWeight:'700', fontSize:'.9rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'.4rem' }}>
                    <CheckCircle size={15}/> Mark Resolved
                  </button>
                  <button onClick={() => updateStatus(viewing.id, 'closed')} disabled={processing === viewing.id}
                    style={{ flex:1, padding:'.82rem', background:t.red+'22', color:t.red, border:`1px solid ${t.red}44`, borderRadius:'10px', fontFamily:'Syne', fontWeight:'700', fontSize:'.9rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'.4rem' }}>
                    <XCircle size={15}/> Close Ticket
                  </button>
                </div>
              )}
              {viewing.status !== 'open' && (
                <button onClick={() => updateStatus(viewing.id, 'open')}
                  style={{ width:'100%', padding:'.82rem', background:t.input, color:t.textSub, border:`1px solid ${t.cardBorder}`, borderRadius:'10px', fontFamily:'DM Sans', fontWeight:'600', fontSize:'.9rem', cursor:'pointer' }}>
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}