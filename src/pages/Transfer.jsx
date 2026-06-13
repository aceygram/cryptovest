import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Send, User, CheckCircle, AlertCircle } from 'lucide-react'

export default function Transfer() {
  const { user, profile, fetchProfile } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [step, setStep] = useState(1) // 1: form, 2: preview, 3: done
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [recipient, setRecipient] = useState(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(false)

  const inp = { width:'100%', padding:'.85rem 1rem', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:'8px', color:t.text, fontFamily:'DM Sans', fontSize:'.9rem', boxSizing:'border-box', outline:'none' }
  const lbl = { color:t.textSub, fontFamily:'DM Sans', fontSize:'.75rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:'.4rem' }

  const searchRecipient = async () => {
    if (!email.trim()) return toast.error('Enter recipient email')
    if (email.toLowerCase() === profile?.email?.toLowerCase()) return toast.error('You cannot transfer to yourself')
    setSearching(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, sex')
      .eq('email', email.trim().toLowerCase())
      .single()
    setSearching(false)
    if (error || !data) return toast.error('No user found with that email')
    setRecipient(data)
    toast.success(`Found: ${data.full_name}`)
  }

  const handlePreview = () => {
    if (!recipient) return toast.error('Search for a recipient first')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')
    if (amt < 1) return toast.error('Minimum transfer is $1')
    if (amt > (profile?.balance || 0)) return toast.error('Insufficient balance')
    setStep(2)
  }

  const handleConfirm = async () => {
    const amt = parseFloat(amount)
    setLoading(true)
    try {
      // Call atomic SQL function
      const { error: transferError } = await supabase.rpc('transfer_funds', {
        sender_id: user.id,
        recipient_id: recipient.id,
        transfer_amount: amt
      })
      if (transferError) throw transferError

      // Log sender transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'transfer_sent',
        amount: amt,
        status: 'confirmed',
        crypto_currency: null,
        crypto_address: recipient.email,
      })

      // Log recipient transaction
      await supabase.from('transactions').insert({
        user_id: recipient.id,
        type: 'transfer_received',
        amount: amt,
        status: 'confirmed',
        crypto_currency: null,
        crypto_address: profile?.email,
      })

      await fetchProfile(user.id)
      setStep(3)
    } catch (err) {
      toast.error('Transfer failed: ' + err.message)
    }
    setLoading(false)
  }

  const reset = () => {
    setStep(1); setEmail(''); setAmount(''); setNote(''); setRecipient(null)
  }

  const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}.tr-inp:focus{border-color:#00d4ff66!important;outline:none}.tr-inp::placeholder{color:${t.textMuted}}`}</style>
      <Toaster position="top-center"/>
      <Navbar/>
      <div style={{ maxWidth:'520px', margin:'0 auto', padding:'2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'.8rem', marginBottom:'2rem' }}>
          <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:'#8b5cf618',border:'1px solid #8b5cf633',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Send size={20} color="#8b5cf6"/>
          </div>
          <div>
            <h2 style={{ color:t.text, margin:0, fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Send Funds</h2>
            <p style={{ color:t.textSub, margin:'.2rem 0 0', fontFamily:'DM Sans', fontSize:'.85rem' }}>Transfer to another SentientTrade user</p>
          </div>
        </div>

        {/* Balance pill */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:t.card, padding:'1rem 1.2rem', borderRadius:'10px', border:`1px solid ${t.cardBorder}`, marginBottom:'1.5rem' }}>
          <span style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.88rem' }}>Your Balance</span>
          <span style={{ color:t.green, fontWeight:'800', fontSize:'1.2rem' }}>${profile?.balance?.toFixed(2) ?? '0.00'}</span>
        </div>

        {/* Step 1 — Form */}
        {step === 1 && (
          <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'1.6rem', display:'flex', flexDirection:'column', gap:'1.2rem' }}>

            {/* Recipient search */}
            <div>
              <label style={lbl}>Recipient Email</label>
              <div style={{ display:'flex', gap:'.5rem' }}>
                <input className="tr-inp" style={{...inp, flex:1}} type="email"
                  placeholder="their@email.com"
                  value={email} onChange={e=>{ setEmail(e.target.value); setRecipient(null) }}
                  onKeyDown={e=>e.key==='Enter'&&searchRecipient()}/>
                <button onClick={searchRecipient} disabled={searching}
                  style={{ padding:'.85rem 1.1rem', background:'linear-gradient(135deg,#00d4ff,#00ff88)', color:'#020817', border:'none', borderRadius:'8px', fontFamily:'Syne', fontWeight:'700', fontSize:'.82rem', cursor:'pointer', whiteSpace:'nowrap', opacity:searching?.7:1 }}>
                  {searching ? '...' : 'Find'}
                </button>
              </div>
              {/* Recipient found */}
              {recipient && (
                <div style={{ display:'flex', alignItems:'center', gap:'.8rem', marginTop:'.7rem', background:t.green+'08', border:`1px solid ${t.green}22`, borderRadius:'8px', padding:'.7rem 1rem' }}>
                  <span style={{ fontSize:'1.4rem' }}>{SEX_AVATARS[recipient.sex]||'🧑'}</span>
                  <div>
                    <p style={{ color:t.green, margin:0, fontWeight:'700', fontFamily:'DM Sans', fontSize:'.88rem' }}>{recipient.full_name}</p>
                    <p style={{ color:t.textSub, margin:'.1rem 0 0', fontFamily:'DM Sans', fontSize:'.75rem' }}>{recipient.email}</p>
                  </div>
                  <CheckCircle size={16} color={t.green} style={{ marginLeft:'auto' }}/>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label style={lbl}>Amount (USD)</label>
              <input className="tr-inp" style={inp} type="number" placeholder="Minimum $1"
                value={amount} onChange={e=>setAmount(e.target.value)}/>
              {amount && parseFloat(amount) > (profile?.balance||0) && (
                <p style={{ color:t.red, fontFamily:'DM Sans', fontSize:'.75rem', marginTop:'.4rem', display:'flex', alignItems:'center', gap:'.3rem' }}>
                  <AlertCircle size={13}/> Exceeds your balance
                </p>
              )}
            </div>

            {/* Note (optional) */}
            <div>
              <label style={lbl}>Note <span style={{ color:t.textMuted, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
              <input className="tr-inp" style={inp} type="text" placeholder="e.g. Thanks for lunch"
                value={note} onChange={e=>setNote(e.target.value)} maxLength={100}/>
            </div>

            <div style={{ background:t.input, padding:'1rem', borderRadius:'8px', borderLeft:`3px solid #8b5cf6` }}>
              <p style={{ color:t.textSub, fontSize:'.83rem', margin:0, fontFamily:'DM Sans' }}>
                💸 Transfers are <strong style={{ color:t.text }}>instant and irreversible</strong>. Double-check the recipient before confirming.
              </p>
            </div>

            <button onClick={handlePreview}
              style={{ width:'100%', padding:'.9rem', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'#fff', border:'none', borderRadius:'10px', fontFamily:'Syne', fontWeight:'700', fontSize:'.95rem', cursor:'pointer' }}>
              Preview Transfer →
            </button>
          </div>
        )}

        {/* Step 2 — Preview / confirm */}
        {step === 2 && (
          <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'1.6rem', display:'flex', flexDirection:'column', gap:'1.2rem' }}>
            <h3 style={{ color:t.text, margin:0, fontWeight:'800', fontSize:'1.05rem' }}>Confirm Transfer</h3>

            {/* Summary */}
            <div style={{ background:t.input, borderRadius:'12px', padding:'1.2rem', border:`1px solid ${t.cardBorder}` }}>
              {[
                ['From', `${profile?.full_name} (you)`],
                ['To', `${recipient?.full_name} · ${recipient?.email}`],
                ['Amount', `$${parseFloat(amount).toFixed(2)}`],
                ...(note ? [['Note', note]] : []),
                ['Balance After', `$${(profile.balance - parseFloat(amount)).toFixed(2)}`],
              ].map(([label, value], i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.55rem 0', borderBottom: i < (note ? 4 : 3) ? `1px solid ${t.cardBorder}` : 'none' }}>
                  <span style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.83rem' }}>{label}</span>
                  <span style={{ color: label==='Amount'?'#8b5cf6':label==='Balance After'?t.green:t.text, fontFamily:'DM Sans', fontWeight:'600', fontSize:'.88rem', textAlign:'right', maxWidth:'220px' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ background:'#f59e0b11', border:'1px solid #f59e0b33', borderRadius:'8px', padding:'.85rem 1rem' }}>
              <p style={{ color:t.yellow, margin:0, fontFamily:'DM Sans', fontSize:'.82rem' }}>
                ⚠️ This action is <strong>instant and cannot be undone</strong>. Please verify the recipient.
              </p>
            </div>

            <div style={{ display:'flex', gap:'.7rem' }}>
              <button onClick={()=>setStep(1)} style={{ flex:1, padding:'.9rem', background:'transparent', border:`1px solid ${t.cardBorder}`, color:t.textSub, borderRadius:'10px', fontFamily:'Syne', fontWeight:'600', fontSize:'.9rem', cursor:'pointer' }}>
                ← Back
              </button>
              <button onClick={handleConfirm} disabled={loading}
                style={{ flex:2, padding:'.9rem', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'#fff', border:'none', borderRadius:'10px', fontFamily:'Syne', fontWeight:'700', fontSize:'.95rem', cursor:'pointer', opacity:loading?.7:1 }}>
                {loading ? 'Sending...' : `Send $${parseFloat(amount).toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'2.5rem 1.6rem', textAlign:'center' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'#8b5cf622', border:'1px solid #8b5cf644', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.2rem' }}>
              <CheckCircle size={32} color="#8b5cf6"/>
            </div>
            <h3 style={{ color:t.text, fontWeight:'800', fontSize:'1.2rem', margin:'0 0 .5rem' }}>Transfer Sent!</h3>
            <p style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.88rem', margin:'0 0 .3rem' }}>
              <strong style={{ color:'#8b5cf6' }}>${parseFloat(amount).toFixed(2)}</strong> sent to <strong style={{ color:t.text }}>{recipient?.full_name}</strong>
            </p>
            <p style={{ color:t.textMuted, fontFamily:'DM Sans', fontSize:'.82rem', margin:'0 0 1.8rem' }}>New balance: <strong style={{ color:t.green }}>${profile?.balance?.toFixed(2)}</strong></p>
            <div style={{ display:'flex', gap:'.7rem', justifyContent:'center' }}>
              <button onClick={reset}
                style={{ padding:'.8rem 1.5rem', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'#fff', border:'none', borderRadius:'10px', fontFamily:'Syne', fontWeight:'700', fontSize:'.9rem', cursor:'pointer' }}>
                Send Another
              </button>
              <a href="/history" style={{ padding:'.8rem 1.5rem', background:t.input, color:t.textSub, border:`1px solid ${t.cardBorder}`, borderRadius:'10px', fontFamily:'DM Sans', fontWeight:'600', fontSize:'.9rem', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
                View History
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}