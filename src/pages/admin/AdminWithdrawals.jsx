import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { sendEmail, emailTemplates } from '../../lib/email'

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    fetchWithdrawals()
  }, [filter])

  const fetchWithdrawals = async () => {
    setLoading(true)
    const query = supabase
      .from('transactions')
      .select('*, profiles(full_name, email)')
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })

    if (filter !== 'all') query.eq('status', filter)

    const { data } = await query
    setWithdrawals(data || [])
    setLoading(false)
  }

  const handleApprove = async (tx) => {
    setProcessing(tx.id)
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'confirmed' })
      .eq('id', tx.id)

    if (error) {
      toast.error('Failed to approve')
    } else {
      // Send email
      const template = emailTemplates.withdrawalApproved({
        name: tx.profiles?.full_name,
        amount: tx.amount,
        currency: tx.crypto_currency,
        wallet: tx.crypto_address
      })
      await sendEmail({
        to_email: tx.profiles?.email,
        to_name: tx.profiles?.full_name,
        ...template
      })

      toast.success(`Approved $${tx.amount} withdrawal`)
      fetchWithdrawals()
    }
    setProcessing(null)
  }

  const handleReject = async (tx) => {
    setProcessing(tx.id)
    const { error } = await supabase.rpc('refund_withdrawal', { transaction_id: tx.id })

    if (error) {
      toast.error('Failed to reject')
    } else {
      // Send email
      const template = emailTemplates.withdrawalRejected({
        name: tx.profiles?.full_name,
        amount: tx.amount
      })
      await sendEmail({
        to_email: tx.profiles?.email,
        to_name: tx.profiles?.full_name,
        ...template
      })

      toast.success(`Rejected and refunded $${tx.amount}`)
      fetchWithdrawals()
    }
    setProcessing(null)
  }

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Toaster />
      <Navbar />
      <div style={styles.container}>
        <h2 style={{ color: '#fff', margin: '0 0 0.3rem' }}>Withdrawal Requests</h2>
        <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>Approve or reject user withdrawal requests</p>

        {/* Filter Tabs */}
        <div style={styles.tabs}>
          {['pending', 'confirmed', 'rejected', 'all'].map(tab => (
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

        <div style={styles.card}>
          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>Loading...</p>
          ) : withdrawals.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '3rem' }}>No {filter} withdrawals.</p>
          ) : (
            withdrawals.map(tx => (
              <div key={tx.id} style={styles.row}>
                {/* User Info */}
                <div style={{ minWidth: '180px' }}>
                  <p style={{ color: '#fff', margin: 0, fontWeight: '600' }}>{tx.profiles?.full_name}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.8rem' }}>{tx.profiles?.email}</p>
                </div>

                {/* Amount */}
                <div style={{ minWidth: '100px' }}>
                  <p style={{ color: '#ef4444', margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>${tx.amount}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    {tx.crypto_currency}
                  </p>
                </div>

                {/* Wallet */}
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.82rem' }}>Wallet Address</p>
                  <p style={{ color: '#fff', margin: '0.2rem 0 0', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {tx.crypto_address}
                  </p>
                </div>

                {/* Date */}
                <div style={{ minWidth: '100px', textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.8rem' }}>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Status / Actions */}
                <div style={{ minWidth: '180px', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {tx.status === 'pending' ? (
                    <>
                      <button
                        style={{ ...styles.approveBtn, opacity: processing === tx.id ? 0.6 : 1 }}
                        onClick={() => handleApprove(tx)}
                        disabled={processing === tx.id}
                      >
                        <CheckCircle size={15} /> Approve
                      </button>
                      <button
                        style={{ ...styles.rejectBtn, opacity: processing === tx.id ? 0.6 : 1 }}
                        onClick={() => handleReject(tx)}
                        disabled={processing === tx.id}
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </>
                  ) : (
                    <span style={{
                      padding: '0.4rem 0.8rem', borderRadius: '99px', fontSize: '0.82rem', fontWeight: '600',
                      background: tx.status === 'confirmed' ? '#00ff8822' : '#ef444422',
                      color: tx.status === 'confirmed' ? '#00ff88' : '#ef4444'
                    }}>
                      {tx.status === 'confirmed' ? <CheckCircle size={13} /> : <XCircle size={13} />} {tx.status}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  tabs: { display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1.2rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  card: { background: '#111827', borderRadius: '16px', padding: '1.2rem', border: '1px solid #1f2937' },
  row: { display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.2rem', background: '#1f2937', borderRadius: '10px', marginBottom: '0.7rem', flexWrap: 'wrap' },
  approveBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', background: '#00ff8822', color: '#00ff88', border: '1px solid #00ff8844', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  rejectBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 1rem', background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }
}