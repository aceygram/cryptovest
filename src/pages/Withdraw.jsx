import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowUpCircle, Clock, CheckCircle, XCircle } from 'lucide-react'

const SUPPORTED_COINS = [
  { id:'btc',      label:'Bitcoin',      symbol:'BTC' },
  { id:'eth',      label:'Ethereum',     symbol:'ETH' },
  { id:'usdttrc20',label:'USDT (TRC20)', symbol:'USDT' },
  { id:'usdterc20',label:'USDT (ERC20)', symbol:'USDT' },
  { id:'bnbbsc',   label:'BNB',          symbol:'BNB' },
  { id:'ltc',      label:'Litecoin',     symbol:'LTC' },
]

export default function Withdraw() {
  const { user, profile, fetchProfile } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [form, setForm] = useState({ amount:'', coin:'', wallet_address:'' })
  const [loading, setLoading] = useState(false)
  const [withdrawals, setWithdrawals] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (user) { fetchWithdrawals(); fetchProfile(user.id) }
  }, [user])

  const fetchWithdrawals = async () => {
    const { data } = await supabase.from('transactions').select('*').eq('user_id',user.id).eq('type','withdrawal').order('created_at',{ascending:false})
    setWithdrawals(data||[]); setFetching(false)
  }

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount)
    if (!form.coin) return toast.error('Select a cryptocurrency')
    if (!form.wallet_address) return toast.error('Enter your wallet address')
    if (!amount || amount < 10) return toast.error('Minimum withdrawal is $10')
    if (amount > (profile?.balance||0)) return toast.error('Insufficient balance')
    // Enforce: cannot withdraw more than confirmed earnings + deposits (not active investment capital)
    if (profile?.kyc_status !== 'verified') return toast.error('Complete KYC verification before withdrawing')
    setLoading(true)
    const { error:balErr } = await supabase.from('profiles').update({ balance:profile.balance-amount }).eq('id',user.id)
    if (balErr) { toast.error('Failed to process request'); setLoading(false); return }
    const { error:txErr } = await supabase.from('transactions').insert({ user_id:user.id, type:'withdrawal', amount, crypto_currency:form.coin, crypto_address:form.wallet_address, status:'pending' })
    if (txErr) { await supabase.from('profiles').update({ balance:profile.balance }).eq('id',user.id); toast.error('Failed to submit withdrawal'); setLoading(false); return }
    await fetchProfile(user.id); await fetchWithdrawals()
    toast.success('Withdrawal request submitted!')
    setForm({ amount:'', coin:'', wallet_address:'' })
    setLoading(false)
  }

  const statusIcon = s => s==='confirmed'?<CheckCircle size={14} color={t.green}/>:s==='rejected'?<XCircle size={14} color={t.red}/>:<Clock size={14} color={t.yellow}/>
  const statusColor = s => s==='confirmed'?t.green:s==='rejected'?t.red:t.yellow

  const card = { background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'1.6rem', display:'flex', flexDirection:'column', gap:'1rem' }
  const lbl = { color:t.textSub, fontSize:'.8rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.05em', fontFamily:'DM Sans' }
  const inp = { width:'100%', padding:'.85rem 1rem', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:'8px', color:t.text, fontSize:'.9rem', boxSizing:'border-box', outline:'none', fontFamily:'DM Sans' }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        .wd-inp:focus{border-color:#00d4ff66!important;outline:none}
        .wd-coin{transition:all .2s;cursor:pointer}
        @media(max-width:700px){.wd-top{grid-template-columns:1fr!important}}
        @media(max-width:480px){.wd-coin-grid{grid-template-columns:repeat(2,1fr)!important}.wd-table-row{grid-template-columns:1fr 1fr!important;gap:.5rem!important}.wd-table-header{display:none!important}.wd-table-wallet{display:none!important}.wd-table-cell-wallet{display:none!important}}
      `}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'2rem 1.5rem' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'.8rem', marginBottom:'2rem' }}>
          <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:t.red+'18',border:`1px solid ${t.red}33`,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <ArrowUpCircle size={20} color={t.red}/>
          </div>
          <div>
            <h2 style={{ color:t.text,margin:0,fontSize:'1.4rem',fontWeight:'800',letterSpacing:'-.02em' }}>Withdraw</h2>
            <p style={{ color:t.textSub,margin:'.2rem 0 0',fontFamily:'DM Sans',fontSize:'.85rem' }}>Request a crypto withdrawal</p>
          </div>
        </div>

        <div className="wd-top" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', marginBottom:'1.5rem' }}>

          {/* Form */}
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:t.input, padding:'1rem', borderRadius:'10px', border:`1px solid ${t.cardBorder}` }}>
              <span style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.88rem' }}>Available Balance</span>
              <span style={{ color:t.green, fontWeight:'800', fontSize:'1.3rem' }}>${profile?.balance?.toFixed(2)??'0.00'}</span>
            </div>

            <div>
              <label style={lbl}>Amount (USD)</label>
              <input className="wd-inp" type="number" placeholder="Minimum $10" style={inp} value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/>
            </div>

            <div>
              <label style={lbl}>Select Cryptocurrency to receive</label>
              <div className="wd-coin-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.6rem' }}>
                {SUPPORTED_COINS.map(c=>(
                  <div key={c.id} className="wd-coin" onClick={()=>setForm({...form,coin:c.id})}
                    style={{ padding:'.75rem', borderRadius:'8px', border:`1px solid ${form.coin===c.id?t.red:t.cardBorder}`, background:form.coin===c.id?t.red+'11':t.input, display:'flex', flexDirection:'column', alignItems:'center', gap:'.2rem' }}>
                    <span style={{ fontWeight:'700', color:form.coin===c.id?t.red:t.text, fontSize:'.85rem' }}>{c.symbol}</span>
                    <span style={{ fontSize:'.7rem', color:form.coin===c.id?t.red:t.textSub, fontFamily:'DM Sans', textAlign:'center' }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={lbl}>Your Wallet Address</label>
              <input className="wd-inp" type="text" placeholder="Paste your wallet address" style={inp} value={form.wallet_address} onChange={e=>setForm({...form,wallet_address:e.target.value})}/>
            </div>

            <div style={{ background:t.input, padding:'1rem', borderRadius:'8px', borderLeft:`3px solid ${t.blue}` }}>
              <p style={{ color:t.textSub, fontSize:'.85rem', margin:0, fontFamily:'DM Sans' }}>
                💡 Withdrawals are reviewed within 24 hours. Balance is deducted immediately. Rejected requests are refunded automatically.
              </p>
            </div>

            <button style={{ width:'100%',padding:'.9rem',background:t.red,color:'#fff',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'1rem',cursor:'pointer',opacity:loading?.7:1 }}
              onClick={handleSubmit} disabled={loading}>
              {loading?'Submitting...':'Submit Withdrawal Request'}
            </button>
          </div>

          {/* Rules */}
          <div style={{ ...card, gap:'.9rem' }}>
            <h3 style={{ color:t.text, margin:0, fontSize:'.95rem', fontWeight:'700' }}>Withdrawal Rules</h3>
            {[
              { title:'Minimum Amount',  desc:'$10 per withdrawal' },
              { title:'Processing Time', desc:'Within 24 hours of request' },
              { title:'Correct Address', desc:'Double-check your wallet address. Wrong addresses result in permanent loss.' },
              { title:'Network Match',   desc:'Make sure the coin and network match your wallet.' },
              { title:'Rejection Refund',desc:'If rejected, balance is returned immediately.' },
              { title:'Eligibility',     desc:'Only confirmed earnings and deposits can be withdrawn.' },
            ].map((rule,i)=>(
              <div key={i} style={{ display:'flex', gap:'.7rem', alignItems:'flex-start' }}>
                <div style={{ width:'7px',height:'7px',borderRadius:'50%',background:t.green,marginTop:'6px',flexShrink:0 }}/>
                <div>
                  <p style={{ color:t.text, margin:0, fontSize:'.85rem', fontWeight:'600', fontFamily:'DM Sans' }}>{rule.title}</p>
                  <p style={{ color:t.textSub, margin:'.2rem 0 0', fontSize:'.8rem', fontFamily:'DM Sans' }}>{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div style={card}>
          <h3 style={{ color:t.text, margin:0, fontSize:'.95rem', fontWeight:'700' }}>Withdrawal History</h3>
          {fetching ? (
            <p style={{ color:t.textSub, fontFamily:'DM Sans' }}>Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p style={{ color:t.textMuted, textAlign:'center', padding:'2rem 0', fontFamily:'DM Sans' }}>No withdrawals yet.</p>
          ) : (
            <div>
              {/* Desktop header */}
              <div className="wd-table-header" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 2fr 1fr', padding:'.6rem .8rem', color:t.textMuted, fontSize:'.75rem', textTransform:'uppercase', letterSpacing:'.05em', fontFamily:'DM Sans' }}>
                <span>Date</span><span>Amount</span><span>Coin</span><span className="wd-table-wallet">Wallet</span><span>Status</span>
              </div>
              {withdrawals.map(w=>(
                <div key={w.id} className="wd-table-row" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 2fr 1fr', padding:'.85rem .8rem', background:t.input, borderRadius:'8px', marginBottom:'.4rem', alignItems:'center', border:`1px solid ${t.cardBorder}` }}>
                  <span style={{ color:t.textSub, fontSize:'.82rem', fontFamily:'DM Sans' }}>{new Date(w.created_at).toLocaleDateString()}</span>
                  <span style={{ color:t.text, fontWeight:'700', fontFamily:'DM Sans' }}>${w.amount}</span>
                  <span style={{ color:t.textSub, textTransform:'uppercase', fontFamily:'DM Sans', fontSize:'.82rem' }}>{w.crypto_currency}</span>
                  <span className="wd-table-cell-wallet" style={{ color:t.textMuted, fontSize:'.78rem', fontFamily:'DM Sans' }}>{w.crypto_address?.slice(0,8)}...{w.crypto_address?.slice(-6)}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'.3rem', color:statusColor(w.status), fontSize:'.82rem', fontFamily:'DM Sans' }}>{statusIcon(w.status)} {w.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}