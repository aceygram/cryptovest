import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { sendEmail, emailTemplates } from '../../lib/email'

export default function AdminKYC() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [viewing, setViewing] = useState(null)
  const [docUrls, setDocUrls] = useState({})
  const [rejectReason, setRejectReason] = useState('')
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchSubmissions()
  }, [filter])

  const fetchSubmissions = async () => {
    setLoading(true)
    const query = supabase
      .from('profiles')
      .select('*, kyc_documents(*)')
      .order('kyc_submitted_at', { ascending: false })

    if (filter !== 'all') query.eq('kyc_status', filter)

    const { data } = await query
    setSubmissions(data?.filter(u => u.kyc_documents?.length > 0) || [])
    setLoading(false)
  }

  const loadDocuments = async (user) => {
    setViewing(user)
    const urls = {}
    for (const doc of user.kyc_documents) {
      const { data } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(doc.file_path, 60 * 60) // 1 hour expiry
      if (data) urls[doc.document_type] = data.signedUrl
    }
    setDocUrls(urls)
  }

  const handleApprove = async (user) => {
    setProcessing(user.id)
    await supabase.from('profiles').update({
      kyc_status: 'verified',
      kyc_reviewed_at: new Date().toISOString(),
      kyc_rejection_reason: null
    }).eq('id', user.id)

    // Send email
    await sendEmail({
      to_email: user.email,
      to_name: user.full_name,
      subject: '✅ KYC Verified — CryptoVest',
      html_content: `
        <div style="font-family: Arial, sans-serif; background: #0a0f1e; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <h1 style="color: #00ff88; text-align: center;">💰 CryptoVest</h1>
          <div style="background: #111827; padding: 30px; border-radius: 12px;">
            <h2 style="color: #00ff88;">Identity Verified!</h2>
            <p style="color: #9ca3af;">Hi ${user.full_name},</p>
            <p style="color: #9ca3af;">Your identity has been verified. Your account is now fully activated and you can make withdrawals without restrictions.</p>
          </div>
        </div>
      `
    })

    toast.success(`${user.full_name} verified`)
    setViewing(null)
    fetchSubmissions()
    setProcessing(null)
  }

  const handleReject = async (user) => {
    if (!rejectReason) return toast.error('Enter a rejection reason')
    setProcessing(user.id)

    await supabase.from('profiles').update({
      kyc_status: 'rejected',
      kyc_reviewed_at: new Date().toISOString(),
      kyc_rejection_reason: rejectReason
    }).eq('id', user.id)

    // Send email
    await sendEmail({
      to_email: user.email,
      to_name: user.full_name,
      subject: '❌ KYC Rejected — CryptoVest',
      html_content: `
        <div style="font-family: Arial, sans-serif; background: #0a0f1e; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <h1 style="color: #00ff88; text-align: center;">💰 CryptoVest</h1>
          <div style="background: #111827; padding: 30px; border-radius: 12px;">
            <h2 style="color: #ef4444;">KYC Rejected</h2>
            <p style="color: #9ca3af;">Hi ${user.full_name},</p>
            <p style="color: #9ca3af;">Your KYC submission was rejected for the following reason:</p>
            <div style="background: #ef444411; border: 1px solid #ef444433; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="color: #ef4444; margin: 0;">${rejectReason}</p>
            </div>
            <p style="color: #9ca3af;">Please resubmit with the correct documents.</p>
          </div>
        </div>
      `
    })

    toast.success(`${user.full_name} rejected`)
    setViewing(null)
    setRejectReason('')
    fetchSubmissions()
    setProcessing(null)
  }

  const DOC_LABELS = { id_front: 'ID Front', id_back: 'ID Back', selfie: 'Selfie with ID' }

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Toaster />
      <Navbar />
      <div style={styles.container}>
        <h2 style={{ color: '#fff', margin: '0 0 0.3rem' }}>KYC Submissions</h2>
        <p style={{ color: '#6b7280', margin: '0 0 2rem' }}>Review and verify user identity documents</p>

        <div style={styles.tabs}>
          {['pending', 'verified', 'rejected', 'all'].map(tab => (
            <button key={tab} style={{ ...styles.tab, background: filter === tab ? '#00ff88' : '#1f2937', color: filter === tab ? '#0a0f1e' : '#9ca3af' }}
              onClick={() => setFilter(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={styles.card}>
          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>Loading...</p>
          ) : submissions.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No {filter} submissions.</p>
          ) : (
            submissions.map(user => (
              <div key={user.id} style={styles.row}>
                <div style={styles.avatar}>{user.full_name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', margin: 0, fontWeight: '600' }}>{user.full_name}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.82rem' }}>{user.email}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.78rem' }}>
                    Submitted: {user.kyc_submitted_at ? new Date(user.kyc_submitted_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span style={{
                  padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '600',
                  background: user.kyc_status === 'verified' ? '#00ff8822' : user.kyc_status === 'rejected' ? '#ef444422' : '#f59e0b22',
                  color: user.kyc_status === 'verified' ? '#00ff88' : user.kyc_status === 'rejected' ? '#ef4444' : '#f59e0b'
                }}>
                  {user.kyc_status}
                </span>
                <button style={styles.viewBtn} onClick={() => loadDocuments(user)}>
                  <Eye size={15} /> View Docs
                </button>
              </div>
            ))
          )}
        </div>

        {/* Document Viewer Modal */}
        {viewing && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={{ color: '#fff', margin: '0 0 0.3rem' }}>{viewing.full_name}</h3>
              <p style={{ color: '#6b7280', margin: '0 0 1.5rem', fontSize: '0.85rem' }}>{viewing.email}</p>

              <div style={styles.docsGrid}>
                {viewing.kyc_documents.map(doc => (
                  <div key={doc.id} style={styles.docCard}>
                    <p style={{ color: '#9ca3af', margin: '0 0 0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                      {DOC_LABELS[doc.document_type]}
                    </p>
                    {docUrls[doc.document_type] ? (
                      <img src={docUrls[doc.document_type]} alt={doc.document_type}
                        style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '200px' }} />
                    ) : (
                      <div style={{ background: '#1f2937', height: '120px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Loading...</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {viewing.kyc_status === 'pending' && (
                <>
                  <input
                    placeholder="Rejection reason (required to reject)"
                    style={styles.input}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                  <div style={styles.modalActions}>
                    <button style={styles.approveBtn} onClick={() => handleApprove(viewing)} disabled={processing === viewing.id}>
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button style={styles.rejectBtn} onClick={() => handleReject(viewing)} disabled={processing === viewing.id}>
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </>
              )}

              <button style={styles.closeBtn} onClick={() => { setViewing(null); setDocUrls({}); setRejectReason('') }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
  tabs: { display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1.2rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  card: { background: '#111827', borderRadius: '16px', padding: '1.2rem', border: '1px solid #1f2937' },
  row: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#1f2937', borderRadius: '10px', marginBottom: '0.6rem' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#3b82f622', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 },
  viewBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f644', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modal: { background: '#111827', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #1f2937' },
  docsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  docCard: { background: '#1f2937', padding: '0.8rem', borderRadius: '8px' },
  input: { width: '100%', padding: '0.8rem 1rem', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '1rem' },
  modalActions: { display: 'flex', gap: '0.8rem', marginBottom: '1rem' },
  approveBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', background: '#00ff8822', color: '#00ff88', border: '1px solid #00ff8844', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, justifyContent: 'center' },
  rejectBtn: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.7rem 1.5rem', background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, justifyContent: 'center' },
  closeBtn: { width: '100%', padding: '0.8rem', background: '#1f2937', color: '#9ca3af', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }
}