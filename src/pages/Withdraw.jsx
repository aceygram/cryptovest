import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { ArrowUpCircle, Clock, CheckCircle, XCircle } from 'lucide-react'

const SUPPORTED_COINS = [
  { id: 'btc', label: 'Bitcoin', symbol: 'BTC' },
  { id: 'eth', label: 'Ethereum', symbol: 'ETH' },
  { id: 'usdttrc20', label: 'USDT (TRC20)', symbol: 'USDT' },
  { id: 'usdterc20', label: 'USDT (ERC20)', symbol: 'USDT' },
  { id: 'bnbbsc', label: 'BNB', symbol: 'BNB' },
  { id: 'ltc', label: 'Litecoin', symbol: 'LTC' },
]

export default function Withdraw() {
  const { user, profile, fetchProfile } = useAuth()
  const [form, setForm] = useState({ amount: '', coin: '', wallet_address: '' })
  const [loading, setLoading] = useState(false)
  const [withdrawals, setWithdrawals] = useState([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWithdrawals()
      fetchProfile(user.id)
    }
  }, [user])

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })
    setWithdrawals(data || [])
    setFetching(false)
  }

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount)

    if (!form.coin) return toast.error('Select a cryptocurrency')
    if (!form.wallet_address) return toast.error('Enter your wallet address')
    if (!amount || amount < 10) return toast.error('Minimum withdrawal is $10')
    if (amount > (profile?.balance || 0)) return toast.error('Insufficient balance')

    setLoading(true)

    // Deduct balance immediately and hold it pending approval
    const { error: balErr } = await supabase
      .from('profiles')
      .update({ balance: profile.balance - amount })
      .eq('id', user.id)

    if (balErr) {
      toast.error('Failed to process request')
      setLoading(false)
      return
    }

    // Create withdrawal transaction
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount,
        crypto_currency: form.coin,
        crypto_address: form.wallet_address,
        status: 'pending'
      })

    if (txErr) {
      // Refund if transaction insert fails
      await supabase.from('profiles').update({ balance: profile.balance }).eq('id', user.id)
      toast.error('Failed to submit withdrawal')
      setLoading(false)
      return
    }

    await fetchProfile(user.id)
    await fetchWithdrawals()
    toast.success('Withdrawal request submitted!')
    setForm({ amount: '', coin: '', wallet_address: '' })
    setLoading(false)
  }

  const statusIcon = (status) => {
    if (status === 'confirmed') return <CheckCircle size={16} color="#00ff88" />
    if (status === 'rejected') return <XCircle size={16} color="#ef4444" />
    return <Clock size={16} color="#f59e0b" />
  }

  const statusColor = (status) => {
    if (status === 'confirmed') return '#00ff88'
    if (status === 'rejected') return '#ef4444'
    return '#f59e0b'
  }

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Toaster />
      <Navbar />
      <div style={styles.container}>

        <div className="dashboard-row" style={styles.topRow}>

          {/* Withdrawal Form */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <ArrowUpCircle size={22} color="#ef4444" />
              <h3 style={{ color: '#fff', margin: 0 }}>Request Withdrawal</h3>
            </div>

            <div style={styles.balanceBox}>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Available Balance</span>
              <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '1.4rem' }}>
                ${profile?.balance?.toFixed(2) ?? '0.00'}
              </span>
            </div>

            <label style={styles.label}>Amount (USD)</label>
            <input
              type="number"
              placeholder="Minimum $10"
              style={styles.input}
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />

            <label style={styles.label}>Select Cryptocurrency to receive</label>
            <div style={styles.coinGrid}>
              {SUPPORTED_COINS.map(c => (
                <div
                  key={c.id}
                  style={{
                    ...styles.coinBtn,
                    borderColor: form.coin === c.id ? '#ef4444' : '#374151',
                    background: form.coin === c.id ? '#ef444411' : '#1f2937',
                    color: form.coin === c.id ? '#ef4444' : '#9ca3af'
                  }}
                  onClick={() => setForm({ ...form, coin: c.id })}
                >
                  <span style={{ fontWeight: 'bold' }}>{c.symbol}</span>
                  <span style={{ fontSize: '0.75rem' }}>{c.label}</span>
                </div>
              ))}
            </div>

            <label style={styles.label}>Your Wallet Address</label>
            <input
              type="text"
              placeholder="Paste your wallet address"
              style={styles.input}
              value={form.wallet_address}
              onChange={e => setForm({ ...form, wallet_address: e.target.value })}
            />

            <div style={styles.infoBox}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                💡 Withdrawals are reviewed and processed within 24 hours.
                Your balance is deducted immediately upon request.
                If rejected, your balance will be refunded.
              </p>
            </div>

            <button
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </div>

          {/* Withdrawal Rules */}
          <div style={styles.rulesCard}>
            <h3 style={{ color: '#fff', margin: '0 0 1.2rem' }}>Withdrawal Rules</h3>
            {[
              { title: 'Minimum Amount', desc: '$10 per withdrawal' },
              { title: 'Processing Time', desc: 'Within 24 hours of request' },
              { title: 'Correct Address', desc: 'Double-check your wallet address. Wrong addresses result in permanent loss.' },
              { title: 'Network Match', desc: 'Make sure the coin and network match your wallet.' },
              { title: 'Rejection Refund', desc: 'If your withdrawal is rejected, balance is returned immediately.' },
              { title: 'Earnings', desc: 'Only confirmed earnings and deposits can be withdrawn.' },
            ].map((rule, i) => (
              <div key={i} style={styles.ruleItem}>
                <div style={styles.ruleDot} />
                <div>
                  <p style={{ color: '#fff', margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>{rule.title}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.82rem' }}>{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Withdrawal History */}
        <div style={styles.historyCard}>
          <h3 style={{ color: '#fff', margin: '0 0 1.2rem' }}>Withdrawal History</h3>

          {fetching ? (
            <p style={{ color: '#6b7280' }}>Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>No withdrawals yet.</p>
          ) : (
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <span>Date</span>
                <span>Amount</span>
                <span>Coin</span>
                <span>Wallet</span>
                <span>Status</span>
              </div>
              {withdrawals.map(w => (
                <div key={w.id} style={styles.tableRow}>
                  <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                    {new Date(w.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>${w.amount}</span>
                  <span style={{ color: '#9ca3af', textTransform: 'uppercase' }}>{w.crypto_currency}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                    {w.crypto_address?.slice(0, 8)}...{w.crypto_address?.slice(-6)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: statusColor(w.status), fontSize: '0.85rem' }}>
                    {statusIcon(w.status)} {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
<style>{`
@media (max-width: 590px) {
  .dashboard-row {
    grid-template-columns: 1fr !important;
  }
}
`}</style>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  topRow: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', marginBottom: '1.5rem' },
  card: { background: '#111827', borderRadius: '16px', padding: '1.8rem', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '1rem' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  balanceBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1f2937', padding: '1rem', borderRadius: '8px' },
  label: { color: '#9ca3af', fontSize: '0.82rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  coinGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' },
  coinBtn: { padding: '0.7rem', borderRadius: '8px', border: '1px solid', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' },
  input: { width: '100%', padding: '0.85rem 1rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' },
  infoBox: { background: '#1f2937', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' },
  btn: { width: '100%', padding: '0.9rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' },
  rulesCard: { background: '#111827', borderRadius: '16px', padding: '1.8rem', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column' },
  ruleItem: { display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '1rem' },
  ruleDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88', marginTop: '5px', flexShrink: 0 },
  historyCard: { background: '#111827', borderRadius: '16px', padding: '1.8rem', border: '1px solid #1f2937' },
  table: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr', padding: '0.6rem 0.8rem', color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  tableRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr 1fr', padding: '0.8rem', background: '#1f2937', borderRadius: '8px', alignItems: 'center' }
}