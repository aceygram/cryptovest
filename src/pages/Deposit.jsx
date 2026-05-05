import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Copy, CheckCircle, ArrowDownCircle } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

const SUPPORTED_COINS = [
  { id:'btc',      label:'Bitcoin',      symbol:'BTC' },
  { id:'eth',      label:'Ethereum',     symbol:'ETH' },
  { id:'usdttrc20',label:'USDT (TRC20)', symbol:'USDT' },
  { id:'usdterc20',label:'USDT (ERC20)', symbol:'USDT' },
  { id:'bnbbsc',   label:'BNB',          symbol:'BNB' },
  { id:'ltc',      label:'Litecoin',     symbol:'LTC' },
]

function QRDisplay({ address }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!address || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, address, {
      width: 160, margin: 1,
      color: { dark: '#020817', light: '#00ff88' }
    }).catch(() => {})
  }, [address])
  return <canvas ref={canvasRef} style={{ borderRadius:'10px', display:'block' }}/>
}

export default function Deposit() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [step, setStep] = useState(1)
  const [coin, setCoin] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleCreatePayment = async () => {
    if (!coin) return toast.error('Select a cryptocurrency')
    if (!amount || parseFloat(amount) < 10) return toast.error('Minimum deposit is $10')
    setLoading(true)
    try {
      const { data: tx, error: txError } = await supabase.from('transactions').insert({
        user_id:user.id, type:'deposit', amount:parseFloat(amount), status:'pending', crypto_currency:coin
      }).select().single()
      if (txError) throw txError

      const response = await fetch('https://api.nowpayments.io/v1/payment', {
        method:'POST',
        headers:{ 'x-api-key':import.meta.env.VITE_NOWPAYMENTS_API_KEY, 'Content-Type':'application/json' },
        body:JSON.stringify({ price_amount:parseFloat(amount), price_currency:'usd', pay_currency:coin, order_id:tx.id, order_description:`Deposit for user ${user.id}` })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Payment creation failed')
      await supabase.from('transactions').update({ payment_id:data.payment_id }).eq('id', tx.id)
      setPaymentData({ address:data.pay_address, amount:data.pay_amount, currency:data.pay_currency.toUpperCase(), paymentId:data.payment_id, network:data.network, usdAmount:amount })
      setStep(2)
    } catch (err) { toast.error(err.message || 'Something went wrong') }
    setLoading(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(paymentData.address)
    setCopied(true); toast.success('Address copied!')
    setTimeout(() => setCopied(false), 3000)
  }

  const card = { background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'1.8rem', display:'flex', flexDirection:'column', gap:'1.2rem' }
  const lbl = { color:t.textSub, fontSize:'.82rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.05em', fontFamily:'DM Sans' }
  const inp = { width:'100%', padding:'.85rem 1rem', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:'8px', color:t.text, fontSize:'.95rem', boxSizing:'border-box', outline:'none', fontFamily:'DM Sans' }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}.dep-inp:focus{border-color:#00d4ff66!important;outline:none}.dep-coin{transition:all .2s;cursor:pointer}@media(max-width:480px){.coin-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'580px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.8rem', marginBottom:'2rem' }}>
          <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:'#00d4ff18',border:'1px solid #00d4ff33',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <ArrowDownCircle size={20} color="#00d4ff"/>
          </div>
          <div>
            <h2 style={{ color:t.text, margin:0, fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Deposit Crypto</h2>
            <p style={{ color:t.textSub, margin:'.2rem 0 0', fontFamily:'DM Sans', fontSize:'.85rem' }}>Fund your account to start investing</p>
          </div>
        </div>

        {step === 1 && (
          <div style={card}>
            <label style={lbl}>Select Cryptocurrency</label>
            <div className="coin-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'.7rem' }}>
              {SUPPORTED_COINS.map(c => (
                <div key={c.id} className="dep-coin"
                  onClick={() => setCoin(c.id)}
                  style={{ padding:'.9rem', borderRadius:'10px', border:`1px solid ${coin===c.id?'#00d4ff':t.cardBorder}`, background:coin===c.id?'#00d4ff11':t.input, display:'flex', flexDirection:'column', alignItems:'center', gap:'.3rem' }}>
                  <span style={{ fontWeight:'700', color:coin===c.id?'#00d4ff':t.text, fontSize:'.9rem' }}>{c.symbol}</span>
                  <span style={{ fontSize:'.72rem', color:coin===c.id?'#00d4ff':t.textSub, fontFamily:'DM Sans', textAlign:'center' }}>{c.label}</span>
                </div>
              ))}
            </div>

            <div>
              <label style={lbl}>Amount (USD)</label>
              <input className="dep-inp" type="number" placeholder="Minimum $10" style={inp} value={amount} onChange={e=>setAmount(e.target.value)}/>
            </div>

            <div style={{ background:t.input, padding:'1rem', borderRadius:'8px', borderLeft:`3px solid #00d4ff` }}>
              <p style={{ color:t.textSub, fontSize:'.85rem', margin:0, fontFamily:'DM Sans' }}>
                💡 You will receive the exact crypto equivalent of your USD amount at current market rate. Balance is credited in USD once confirmed.
              </p>
            </div>

            <button style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'1rem',cursor:'pointer',opacity:loading?.7:1 }}
              onClick={handleCreatePayment} disabled={loading}>
              {loading ? 'Generating address...' : 'Generate Payment Address'}
            </button>
          </div>
        )}

        {step === 2 && paymentData && (
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <CheckCircle size={32} color={t.green}/>
              <h3 style={{ color:t.text, margin:0, fontSize:'1.1rem', fontWeight:'800' }}>Payment Address Ready</h3>
            </div>

            <div style={{ background:t.input, borderRadius:'10px', padding:'1rem', display:'flex', flexDirection:'column', gap:'.7rem', border:`1px solid ${t.cardBorder}` }}>
              {[['Send exactly', `${paymentData.amount} ${paymentData.currency}`],['USD Value', `$${paymentData.usdAmount}`], ...(paymentData.network?[['Network', paymentData.network.toUpperCase()]]:[])]
                .map(([lk,lv],i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.88rem' }}>{lk}</span>
                    <span style={{ color:t.text, fontWeight:'700', fontFamily:'DM Sans' }}>{lv}</span>
                  </div>
                ))}
            </div>

            {/* QR code + address */}
            <div style={{ display:'flex', gap:'1.2rem', alignItems:'flex-start', flexWrap:'wrap' }}>
              <div style={{ background:t.green, borderRadius:'12px', padding:'8px', flexShrink:0 }}>
                <QRDisplay address={paymentData.address}/>
              </div>
              <div style={{ flex:1, minWidth:'200px' }}>
                <label style={{ ...lbl, marginBottom:'.5rem', display:'block' }}>Send to this address</label>
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', background:t.input, padding:'.8rem 1rem', borderRadius:'8px', border:`1px solid ${t.cardBorder}` }}>
                  <span style={{ color:t.green, fontSize:'.82rem', wordBreak:'break-all', flex:1, fontFamily:'DM Sans' }}>{paymentData.address}</span>
                  <button onClick={copyAddress} style={{ background:'none', border:'none', color:t.textSub, cursor:'pointer', flexShrink:0 }}>
                    {copied ? <CheckCircle size={18} color={t.green}/> : <Copy size={18}/>}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background:t.yellow+'11', padding:'1rem', borderRadius:'8px', border:`1px solid ${t.yellow}33` }}>
              <p style={{ color:t.yellow, fontSize:'.85rem', margin:0, fontFamily:'DM Sans' }}>
                ⚠️ Send only <strong>{paymentData.currency}</strong> to this address. Sending any other coin will result in permanent loss. Balance updates automatically once confirmed on the blockchain.
              </p>
            </div>

            <button style={{ width:'100%',padding:'.9rem',background:t.input,color:t.text,border:`1px solid ${t.cardBorder}`,borderRadius:'10px',fontFamily:'Syne',fontWeight:'600',fontSize:'.92rem',cursor:'pointer' }}
              onClick={() => { setStep(1); setPaymentData(null); setAmount(''); setCoin('') }}>
              Make Another Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}