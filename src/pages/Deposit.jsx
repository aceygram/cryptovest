import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { Copy, CheckCircle } from 'lucide-react'

const SUPPORTED_COINS = [
  { id: 'btc', label: 'Bitcoin', symbol: 'BTC' },
  { id: 'eth', label: 'Ethereum', symbol: 'ETH' },
  { id: 'usdttrc20', label: 'USDT (TRC20)', symbol: 'USDT' },
  { id: 'usdterc20', label: 'USDT (ERC20)', symbol: 'USDT' },
  { id: 'bnbbsc', label: 'BNB', symbol: 'BNB' },
  { id: 'ltc', label: 'Litecoin', symbol: 'LTC' },
]

export default function Deposit() {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: form, 2: payment address
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
      // Create a pending transaction first to get an ID
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: parseFloat(amount),
          status: 'pending',
          crypto_currency: coin
        })
        .select()
        .single()

      if (txError) throw txError

      // Call NOWPayments API to create a payment
      const response = await fetch('https://api.nowpayments.io/v1/payment', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: parseFloat(amount),
          price_currency: 'usd',
          pay_currency: coin,
          order_id: tx.id, // we use the transaction ID as order reference
          order_description: `Deposit for user ${user.id}`
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Payment creation failed')

      // Save the NOWPayments payment ID to the transaction
      await supabase.from('transactions').update({
        payment_id: data.payment_id
      }).eq('id', tx.id)

      setPaymentData({
        address: data.pay_address,
        amount: data.pay_amount,
        currency: data.pay_currency.toUpperCase(),
        paymentId: data.payment_id,
        network: data.network,
        usdAmount: amount
      })

      setStep(2)
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    }

    setLoading(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(paymentData.address)
    setCopied(true)
    toast.success('Address copied!')
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Toaster />
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Deposit Crypto</h2>
        <p style={styles.sub}>Fund your account to start investing</p>

        {step === 1 && (
          <div style={styles.card}>
            <label style={styles.label}>Select Cryptocurrency</label>
            <div style={styles.coinGrid}>
              {SUPPORTED_COINS.map(c => (
                <div
                  key={c.id}
                  style={{
                    ...styles.coinBtn,
                    borderColor: coin === c.id ? '#00ff88' : '#374151',
                    background: coin === c.id ? '#00ff8811' : '#1f2937',
                    color: coin === c.id ? '#00ff88' : '#9ca3af'
                  }}
                  onClick={() => setCoin(c.id)}
                >
                  <span style={{ fontWeight: 'bold' }}>{c.symbol}</span>
                  <span style={{ fontSize: '0.75rem' }}>{c.label}</span>
                </div>
              ))}
            </div>

            <label style={styles.label}>Amount (USD)</label>
            <input
              type="number"
              placeholder="Minimum $10"
              style={styles.input}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />

            <div style={styles.infoBox}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                💡 You will receive the exact crypto equivalent of your USD amount at current market rate.
                Your balance will be credited in USD once payment is confirmed.
              </p>
            </div>

            <button style={styles.btn} onClick={handleCreatePayment} disabled={loading}>
              {loading ? 'Generating address...' : 'Generate Payment Address'}
            </button>
          </div>
        )}

        {step === 2 && paymentData && (
          <div style={styles.card}>
            <div style={styles.successHeader}>
              <CheckCircle size={32} color="#00ff88" />
              <h3 style={{ color: '#fff', margin: 0 }}>Payment Address Ready</h3>
            </div>

            <div style={styles.paymentInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Send exactly</span>
                <span style={styles.infoValue}>{paymentData.amount} {paymentData.currency}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>USD Value</span>
                <span style={styles.infoValue}>${paymentData.usdAmount}</span>
              </div>
              {paymentData.network && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Network</span>
                  <span style={styles.infoValue}>{paymentData.network.toUpperCase()}</span>
                </div>
              )}
            </div>

            <label style={styles.label}>Send to this address</label>
            <div style={styles.addressBox}>
              <span style={styles.addressText}>{paymentData.address}</span>
              <button style={styles.copyBtn} onClick={copyAddress}>
                {copied ? <CheckCircle size={18} color="#00ff88" /> : <Copy size={18} />}
              </button>
            </div>

            <div style={styles.warningBox}>
              <p style={{ color: '#f59e0b', fontSize: '0.85rem', margin: 0 }}>
                ⚠️ Send only <strong>{paymentData.currency}</strong> to this address.
                Sending any other coin will result in permanent loss.
                Your balance will update automatically once the transaction is confirmed on the blockchain.
              </p>
            </div>

            <button
              style={{ ...styles.btn, background: '#1f2937', color: '#fff' }}
              onClick={() => { setStep(1); setPaymentData(null); setAmount(''); setCoin('') }}
            >
              Make Another Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '560px', margin: '0 auto', padding: '2rem' },
  title: { color: '#fff', margin: 0 },
  sub: { color: '#6b7280', margin: '0.3rem 0 2rem' },
  card: { background: '#111827', borderRadius: '16px', padding: '2rem', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  label: { color: '#9ca3af', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  coinGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.7rem' },
  coinBtn: { padding: '0.8rem', borderRadius: '8px', border: '1px solid', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', transition: 'all 0.2s' },
  input: { width: '100%', padding: '0.85rem 1rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', boxSizing: 'border-box' },
  infoBox: { background: '#1f2937', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' },
  btn: { width: '100%', padding: '0.9rem', background: '#00ff88', color: '#0a0f1e', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  successHeader: { display: 'flex', alignItems: 'center', gap: '1rem' },
  paymentInfo: { background: '#1f2937', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { color: '#6b7280', fontSize: '0.9rem' },
  infoValue: { color: '#fff', fontWeight: 'bold' },
  addressBox: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1f2937', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #374151' },
  addressText: { color: '#00ff88', fontSize: '0.85rem', wordBreak: 'break-all', flex: 1 },
  copyBtn: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', flexShrink: 0 },
  warningBox: { background: '#f59e0b11', padding: '1rem', borderRadius: '8px', border: '1px solid #f59e0b33' }
}