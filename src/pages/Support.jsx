import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme, tokens } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { MessageCircle, Mail, Clock, CheckCircle } from 'lucide-react'

export default function Support() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ subject:'', category:'general', message:'' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async () => {
    if (!form.subject.trim()) return toast.error('Enter a subject')
    if (!form.message.trim() || form.message.length < 20) return toast.error('Message must be at least 20 characters')
    setLoading(true)
    try {
      // Store ticket in Supabase
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user?.id || null,
        user_email: user ? profile?.email : form.email,
        user_name: user ? profile?.full_name : form.name,
        category: form.category,
        subject: form.subject,
        message: form.message,
        status: 'open'
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      toast.error('Failed to send. Please try again.')
    }
    setLoading(false)
  }

  const inp = { width:'100%', padding:'.85rem 1rem', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:'8px', color:t.text, fontFamily:'DM Sans', fontSize:'.9rem', boxSizing:'border-box', outline:'none' }
  const lbl = { color:t.textSub, fontFamily:'DM Sans', fontSize:'.75rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:'.4rem' }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}.sp-inp:focus{border-color:#00d4ff66!important;outline:none}.sp-inp::placeholder{color:${t.textMuted}}`}</style>
      <Toaster position="top-center"/>
      {user ? <Navbar/> : (
        <nav style={{ background:t.nav, borderBottom:`1px solid ${t.navBorder}`, padding:'0 2rem', height:'62px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link to="/" style={{ display:'flex',alignItems:'center',gap:'.55rem',textDecoration:'none' }}>
            <div style={{ width:'30px',height:'30px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.78rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
            <span style={{ color:t.text,fontWeight:'800',fontSize:'.98rem',letterSpacing:'-.03em' }}>SentientTrade</span>
          </Link>
          <Link to="/login" style={{ color:t.cyan,fontFamily:'DM Sans',fontSize:'.88rem',textDecoration:'none' }}>Login</Link>
        </nav>
      )}

      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <div style={{ marginBottom:'2rem' }}>
          <h2 style={{ color:t.text, margin:0, fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Support Center</h2>
          <p style={{ color:t.textSub, margin:'.3rem 0 0', fontFamily:'DM Sans', fontSize:'.88rem' }}>We typically respond within 24 hours</p>
        </div>

        {/* Info cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { icon:<Mail size={20}/>, title:'Email Support', desc:'support@sentienttrade.online', color:'#00d4ff' },
            { icon:<Clock size={20}/>, title:'Response Time', desc:'Within 24 hours', color:'#f59e0b' },
            { icon:<MessageCircle size={20}/>, title:'Live Chat', desc:'Coming soon', color:'#8b5cf6' },
          ].map((item,i)=>(
            <div key={i} style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'12px', padding:'1.2rem', display:'flex', alignItems:'center', gap:'.9rem' }}>
              <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:item.color+'18',border:`1px solid ${item.color}33`,display:'flex',alignItems:'center',justifyContent:'center',color:item.color,flexShrink:0 }}>{item.icon}</div>
              <div>
                <p style={{ color:t.text,margin:0,fontWeight:'700',fontFamily:'DM Sans',fontSize:'.85rem' }}>{item.title}</p>
                <p style={{ color:t.textSub,margin:'.2rem 0 0',fontFamily:'DM Sans',fontSize:'.78rem' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'1.6rem', marginBottom:'1.5rem' }}>
          <h3 style={{ color:t.text, margin:'0 0 1.2rem', fontWeight:'700', fontSize:'.95rem' }}>Frequently Asked Questions</h3>
          {[
            { q:'How long does deposit confirmation take?', a:'Most crypto deposits confirm within 10–30 minutes depending on network congestion and the coin you used.' },
            { q:'Why is my withdrawal pending?', a:'Withdrawals are manually reviewed for security. This usually takes under 24 hours. If it has been longer, please submit a ticket below.' },
            { q:'How does the AI trading bot work?', a:'Our AI engine analyzes market signals, sentiment, and on-chain data to execute trades across major crypto pairs. It operates 24/7 and credits ROI to your account when your investment plan matures.' },
            { q:'Can I cancel an active investment plan?', a:'Investment plans cannot be cancelled once activated. Your capital and ROI will be returned when the plan duration completes.' },
            { q:'What happens if my KYC is rejected?', a:'You will receive an email explaining the reason. You can resubmit with corrected documents from the KYC page. Your balance is unaffected.' },
            { q:'How do I change my password?', a:'Go to your Profile page and click "Change Password". You will need to enter your current password to confirm your identity.' },
          ].map((item,i)=>(
            <div key={i} style={{ borderBottom:i<5?`1px solid ${t.cardBorder}`:'none', paddingBottom:i<5?'1rem':'0', marginBottom:i<5?'1rem':'0' }}>
              <p style={{ color:t.text, margin:'0 0 .3rem', fontFamily:'DM Sans', fontWeight:'600', fontSize:'.88rem' }}>{item.q}</p>
              <p style={{ color:t.textSub, margin:0, fontFamily:'DM Sans', fontSize:'.84rem', lineHeight:1.7 }}>{item.a}</p>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'1.6rem' }}>
          <h3 style={{ color:t.text, margin:'0 0 .3rem', fontWeight:'700', fontSize:'.95rem' }}>Submit a Ticket</h3>
          <p style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.82rem', margin:'0 0 1.4rem' }}>Can't find an answer above? Send us a message.</p>

          {sent ? (
            <div style={{ textAlign:'center', padding:'2rem 0' }}>
              <CheckCircle size={48} color={t.green} style={{ marginBottom:'1rem' }}/>
              <p style={{ color:t.text, fontWeight:'800', fontSize:'1.1rem', margin:'0 0 .5rem' }}>Ticket Submitted!</p>
              <p style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.88rem', margin:0 }}>We'll get back to you within 24 hours.</p>
              <button onClick={()=>{ setSent(false); setForm({ subject:'',category:'general',message:'' }) }}
                style={{ marginTop:'1.5rem', padding:'.7rem 1.5rem', background:t.input, border:`1px solid ${t.cardBorder}`, borderRadius:'8px', color:t.textSub, fontFamily:'DM Sans', cursor:'pointer', fontSize:'.88rem' }}>
                Submit Another
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {!user && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                  <div><label style={lbl}>Your Name</label><input className="sp-inp" style={inp} placeholder="Full name" value={form.name||''} onChange={e=>set('name',e.target.value)}/></div>
                  <div><label style={lbl}>Email</label><input className="sp-inp" style={inp} type="email" placeholder="you@example.com" value={form.email||''} onChange={e=>set('email',e.target.value)}/></div>
                </div>
              )}
              <div>
                <label style={lbl}>Category</label>
                <select className="sp-inp" style={{...inp,background:t.input,appearance:'none'}} value={form.category} onChange={e=>set('category',e.target.value)}>
                  <option value="general">General Enquiry</option>
                  <option value="deposit">Deposit Issue</option>
                  <option value="withdrawal">Withdrawal Issue</option>
                  <option value="kyc">KYC / Verification</option>
                  <option value="account">Account Access</option>
                  <option value="investment">Investment Plan</option>
                  <option value="technical">Technical Issue</option>
                </select>
              </div>
              <div><label style={lbl}>Subject</label><input className="sp-inp" style={inp} placeholder="Brief description of your issue" value={form.subject} onChange={e=>set('subject',e.target.value)}/></div>
              <div>
                <label style={lbl}>Message</label>
                <textarea className="sp-inp" style={{...inp,minHeight:'130px',resize:'vertical'}} placeholder="Describe your issue in detail..." value={form.message} onChange={e=>set('message',e.target.value)}/>
              </div>
              <button onClick={handleSubmit} disabled={loading}
                style={{ width:'100%', padding:'.9rem', background:'linear-gradient(135deg,#00d4ff,#00ff88)', color:'#020817', border:'none', borderRadius:'10px', fontFamily:'Syne', fontWeight:'700', fontSize:'.95rem', cursor:'pointer', opacity:loading?.7:1 }}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}