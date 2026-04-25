import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { ArrowDownCircle, ArrowUpCircle, TrendingUp, Gift, Clock, CheckCircle, XCircle } from 'lucide-react'

const TYPE_CONFIG = {
  deposit:    { icon: <ArrowDownCircle size={18} />, color: '#00ff88', label: 'Deposit' },
  withdrawal: { icon: <ArrowUpCircle size={18} />,   color: '#ef4444', label: 'Withdrawal' },
  investment: { icon: <TrendingUp size={18} />,      color: '#3b82f6', label: 'Investment' },
  earning:    { icon: <Gift size={18} />,            color: '#f59e0b', label: 'Earning' },
}

export default function History() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchTransactions()
  }, [user])

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter)

  const statusIcon = (status) => {
    if (status === 'confirmed') return <CheckCircle size={14} color="#00ff88" />
    if (status === 'rejected') return <XCircle size={14} color="#ef4444" />
    return <Clock size={14} color="#f59e0b" />
  }

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={{ color: '#fff', margin: '0 0 0.3rem' }}>Transaction History</h2>
        <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>All your deposits, withdrawals and earnings</p>

        {/* Filter Tabs */}
        <div style={styles.tabs}>
          {['all', 'deposit', 'withdrawal', 'investment', 'earning'].map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                background: filter === tab ? '#00ff88' : '#1f2937',
                color: filter === tab ? '#0a0f1e' : '#9ca3af'
              }}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions */}
        <div style={styles.card}>
          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem 0' }}>No transactions found.</p>
          ) : (
            filtered.map(tx => {
              const config = TYPE_CONFIG[tx.type] || TYPE_CONFIG.deposit
              const isDebit = tx.type === 'withdrawal' || tx.type === 'investment'
              return (
                <div key={tx.id} style={styles.row}>
                  <div style={{ ...styles.iconBox, background: config.color + '22', color: config.color }}>
                    {config.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#fff', margin: 0, fontWeight: '600' }}>{config.label}</p>
                    <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.8rem' }}>
                      {new Date(tx.created_at).toLocaleString()}
                      {tx.crypto_currency && ` · ${tx.crypto_currency.toUpperCase()}`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: isDebit ? '#ef4444' : '#00ff88', margin: 0, fontWeight: 'bold', fontSize: '1.05rem' }}>
                      {isDebit ? '-' : '+'}${tx.amount}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', marginTop: '0.3rem' }}>
                      {statusIcon(tx.status)}
                      <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{tx.status}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem' },
  tabs: { display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: { padding: '0.5rem 1.2rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  card: { background: '#111827', borderRadius: '16px', padding: '1.2rem', border: '1px solid #1f2937' },
  row: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '10px', marginBottom: '0.5rem', background: '#1f2937' },
  iconBox: { padding: '0.6rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
}