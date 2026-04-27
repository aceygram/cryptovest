import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { Upload, CheckCircle, Clock, XCircle, Shield } from 'lucide-react'

const DOCUMENTS = [
  { id: 'id_front', label: 'ID Card (Front)', desc: 'National ID, Passport, or Drivers License — front side' },
  { id: 'id_back', label: 'ID Card (Back)', desc: 'Back side of your ID card' },
  { id: 'selfie', label: 'Selfie with ID', desc: 'Hold your ID next to your face clearly' },
]

export default function KYC() {
  const { user, profile, fetchProfile } = useAuth()
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})
  const [uploading, setUploading] = useState(false)
  const [existing, setExisting] = useState([])

  useEffect(() => {
    if (user) {
      fetchProfile(user.id)
      fetchExisting()
    }
  }, [user])

  const fetchExisting = async () => {
    const { data } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', user.id)
    setExisting(data || [])
  }

  const handleFileChange = (docType, e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB')
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return toast.error('Only JPG and PNG files allowed')
    }
    setFiles({ ...files, [docType]: file })
    setPreviews({ ...previews, [docType]: URL.createObjectURL(file) })
  }

  const handleSubmit = async () => {
    if (Object.keys(files).length < 3) {
      return toast.error('Please upload all 3 documents')
    }

    setUploading(true)

    try {
      for (const [docType, file] of Object.entries(files)) {
        const filePath = `${user.id}/${docType}_${Date.now()}.${file.name.split('.').pop()}`

        const { error: uploadError } = await supabase.storage
          .from('kyc-documents')
          .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        await supabase.from('kyc_documents').insert({
          user_id: user.id,
          document_type: docType,
          file_path: filePath
        })
      }

      await supabase.from('profiles').update({
        kyc_status: 'pending',
        kyc_submitted_at: new Date().toISOString()
      }).eq('id', user.id)

      await fetchProfile(user.id)
      await fetchExisting()
      toast.success('KYC documents submitted! Under review.')
      setFiles({})
      setPreviews({})
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    }

    setUploading(false)
  }

  const statusConfig = {
    unverified: { icon: <Shield size={20} />, color: '#6b7280', label: 'Not Submitted' },
    pending: { icon: <Clock size={20} />, color: '#f59e0b', label: 'Under Review' },
    verified: { icon: <CheckCircle size={20} />, color: '#00ff88', label: 'Verified' },
    rejected: { icon: <XCircle size={20} />, color: '#ef4444', label: 'Rejected' },
  }

  const status = statusConfig[profile?.kyc_status] || statusConfig.unverified
  const alreadySubmitted = ['pending', 'verified'].includes(profile?.kyc_status)

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh' }}>
      <Toaster />
      <Navbar />
      <div style={styles.container}>
        <h2 style={{ color: '#fff', margin: 0 }}>KYC Verification</h2>
        <p style={{ color: '#6b7280', margin: '0.3rem 0 2rem' }}>Verify your identity to unlock withdrawals</p>

        {/* Status Banner */}
        <div style={{ ...styles.statusBanner, borderColor: status.color + '44', background: status.color + '11' }}>
          <span style={{ color: status.color }}>{status.icon}</span>
          <div>
            <p style={{ color: status.color, margin: 0, fontWeight: 'bold' }}>
              Verification Status: {status.label}
            </p>
            {profile?.kyc_status === 'rejected' && profile?.kyc_rejection_reason && (
              <p style={{ color: '#ef4444', margin: '0.3rem 0 0', fontSize: '0.85rem' }}>
                Reason: {profile.kyc_rejection_reason}
              </p>
            )}
            {profile?.kyc_status === 'pending' && (
              <p style={{ color: '#6b7280', margin: '0.3rem 0 0', fontSize: '0.85rem' }}>
                Your documents are being reviewed. This usually takes 24 hours.
              </p>
            )}
          </div>
        </div>

        {/* Upload Form */}
        {!alreadySubmitted && (
          <div style={styles.card}>
            <div style={styles.infoBox}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
                📋 Upload clear photos of your ID and a selfie holding it.
                Files must be JPG or PNG and under 5MB each.
              </p>
            </div>

            {DOCUMENTS.map(doc => (
              <div key={doc.id} style={styles.docRow}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', margin: 0, fontWeight: '600' }}>{doc.label}</p>
                  <p style={{ color: '#6b7280', margin: '0.2rem 0 0', fontSize: '0.82rem' }}>{doc.desc}</p>
                </div>

                <div style={styles.uploadArea}>
                  {previews[doc.id] ? (
                    <div style={styles.previewBox}>
                      <img src={previews[doc.id]} alt={doc.label}
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                      <CheckCircle size={16} color="#00ff88" />
                    </div>
                  ) : (
                    <label style={styles.uploadBtn}>
                      <Upload size={16} />
                      <span>Choose file</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(doc.id, e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}

            <button
              style={{ ...styles.btn, opacity: uploading ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Submit for Verification'}
            </button>
          </div>
        )}

        {/* Already verified message */}
        {profile?.kyc_status === 'verified' && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={48} color="#00ff88" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>Identity Verified</p>
            <p style={{ color: '#6b7280' }}>Your account is fully verified. You can withdraw without restrictions.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem' },
  statusBanner: { display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.2rem', borderRadius: '10px', border: '1px solid', marginBottom: '1.5rem' },
  card: { background: '#111827', borderRadius: '16px', padding: '1.8rem', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  infoBox: { background: '#1f2937', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #3b82f6' },
  docRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#1f2937', borderRadius: '8px' },
  uploadArea: { flexShrink: 0 },
  uploadBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#374151', color: '#9ca3af', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' },
  previewBox: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  btn: { width: '100%', padding: '0.9rem', background: '#00ff88', color: '#0a0f1e', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }
}