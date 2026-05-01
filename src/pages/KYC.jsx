import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'
import { Upload, CheckCircle, Clock, XCircle, Shield } from 'lucide-react'

const REFERRERS = {
  'ty75ghb':  { name: 'Elon Musk',   avatar: '👨‍💼' },
  'k9x4mzt':  { name: 'Nicholas Galitzine', avatar: '👩‍💼' },
  'q2v8rpl':  { name: 'Timothée Chalamet', avatar: '👨‍💻' },
  'grace77q': { name: 'Grace Okafor',  avatar: '👩‍💻' },
  'james4rt': { name: 'James Oluwole', avatar: '👨‍🦱' },
  'lucy55wx': { name: 'Lucy Chen',     avatar: '👩‍🦰' },
  'dan001zz': { name: 'Daniel Musa',   avatar: '👨‍🦳' },
  'emma88kk': { name: 'Emma Williams', avatar: '👩‍🦳' },
  'tony12pp': { name: 'Tony Adeyemi',  avatar: '🧑‍💼' },
  'rose99vv': { name: 'Rose Obi',      avatar: '👩‍🌾' },
}

const DOCUMENTS = [
  { id: 'id_front', label: 'ID Card (Front)', desc: 'National ID, Passport, or Drivers License — front side' },
  { id: 'id_back',  label: 'ID Card (Back)',  desc: 'Back side of your ID card' },
  { id: 'selfie',   label: 'Selfie with ID',  desc: 'Hold your ID next to your face clearly' },
]

export default function KYC() {
  const { user, profile, fetchProfile } = useAuth()
  const [files, setFiles] = useState({})
  const [previews, setPreviews] = useState({})
  const [uploading, setUploading] = useState(false)
  const [existing, setExisting] = useState([])

  useEffect(() => {
    if (user) { fetchProfile(user.id); fetchExisting() }
  }, [user])

  const fetchExisting = async () => {
    const { data } = await supabase.from('kyc_documents').select('*').eq('user_id', user.id)
    setExisting(data || [])
  }

  const handleFileChange = (docType, e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB')
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) return toast.error('Only JPG and PNG files allowed')
    setFiles({ ...files, [docType]: file })
    setPreviews({ ...previews, [docType]: URL.createObjectURL(file) })
  }

  const handleSubmit = async () => {
    if (Object.keys(files).length < 3) return toast.error('Please upload all 3 documents')
    setUploading(true)
    try {
      for (const [docType, file] of Object.entries(files)) {
        const filePath = `${user.id}/${docType}_${Date.now()}.${file.name.split('.').pop()}`
        const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(filePath, file, { upsert: true })
        if (uploadError) throw uploadError
        await supabase.from('kyc_documents').insert({ user_id: user.id, document_type: docType, file_path: filePath })
      }
      await supabase.from('profiles').update({ kyc_status: 'pending', kyc_submitted_at: new Date().toISOString() }).eq('id', user.id)
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
    unverified: { icon: <Shield size={20} />,       color: '#6b7280', label: 'Not Submitted' },
    pending:    { icon: <Clock size={20} />,         color: '#f59e0b', label: 'Under Review' },
    verified:   { icon: <CheckCircle size={20} />,   color: '#00ff88', label: 'Verified' },
    rejected:   { icon: <XCircle size={20} />,       color: '#ef4444', label: 'Rejected' },
  }

  const status = statusConfig[profile?.kyc_status] || statusConfig.unverified
  const alreadySubmitted = ['pending', 'verified'].includes(profile?.kyc_status)
  const referrer = REFERRERS[profile?.ref_code?.toLowerCase()]

  return (
    <div style={{ background: '#020817', minHeight: '100vh', fontFamily: "'Syne', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <Toaster />
      <Navbar />
      <div style={s.container}>
        <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-.02em' }}>KYC Verification</h2>
        <p style={{ color: '#475569', margin: '0.3rem 0 2rem', fontFamily: 'DM Sans', fontSize: '.88rem' }}>Verify your identity to unlock withdrawals</p>

        {/* Status Banner */}
        <div style={{ ...s.statusBanner, borderColor: status.color + '44', background: status.color + '11' }}>
          <span style={{ color: status.color, display: 'flex', flexShrink: 0 }}>{status.icon}</span>
          <div>
            <p style={{ color: status.color, margin: 0, fontWeight: '700', fontFamily: 'DM Sans' }}>
              Verification Status: {status.label}
            </p>
            {profile?.kyc_status === 'rejected' && profile?.kyc_rejection_reason && (
              <p style={{ color: '#ef4444', margin: '0.3rem 0 0', fontSize: '0.85rem', fontFamily: 'DM Sans' }}>
                Reason: {profile.kyc_rejection_reason}
              </p>
            )}
            {profile?.kyc_status === 'pending' && (
              <p style={{ color: '#475569', margin: '0.3rem 0 0', fontSize: '0.85rem', fontFamily: 'DM Sans' }}>
                Your documents are being reviewed. This usually takes 24 hours.
              </p>
            )}
          </div>
        </div>

        {/* Upload Form */}
        {!alreadySubmitted && (
          <div style={s.card}>
            <div style={s.infoBox}>
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0, fontFamily: 'DM Sans' }}>
                📋 Upload clear photos of your ID and a selfie holding it. Files must be JPG or PNG and under 5MB each.
              </p>
            </div>
            {DOCUMENTS.map(doc => (
              <div key={doc.id} style={s.docRow}>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#f1f5f9', margin: 0, fontWeight: '600', fontFamily: 'DM Sans', fontSize: '.9rem' }}>{doc.label}</p>
                  <p style={{ color: '#475569', margin: '0.2rem 0 0', fontSize: '0.82rem', fontFamily: 'DM Sans' }}>{doc.desc}</p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {previews[doc.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={previews[doc.id]} alt={doc.label} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                      <CheckCircle size={16} color="#00ff88" />
                    </div>
                  ) : (
                    <label style={s.uploadBtn}>
                      <Upload size={16} />
                      <span>Choose file</span>
                      <input type="file" accept="image/jpeg,image/png,image/jpg" style={{ display: 'none' }} onChange={(e) => handleFileChange(doc.id, e)} />
                    </label>
                  )}
                </div>
              </div>
            ))}
            <button style={{ ...s.btn, opacity: uploading ? 0.7 : 1 }} onClick={handleSubmit} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Submit for Verification'}
            </button>
          </div>
        )}

        {/* Verified message */}
        {profile?.kyc_status === 'verified' && (
          <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={48} color="#00ff88" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 .5rem' }}>Identity Verified</p>
            <p style={{ color: '#475569', fontFamily: 'DM Sans', margin: 0 }}>Your account is fully verified. You can withdraw without restrictions.</p>
          </div>
        )}

        {/* Invited By block */}
        {referrer && (
          <div style={s.invitedCard}>
            <div style={s.invitedLeft}>
              <span style={{ fontSize: '2rem' }}>{referrer.avatar}</span>
              <div>
                <p style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 .2rem' }}>You were invited by</p>
                <p style={{ color: '#f1f5f9', fontFamily: 'DM Sans', fontWeight: '600', fontSize: '1rem', margin: 0 }}>{referrer.name}</p>
              </div>
            </div>
            <div style={s.invitedBadge}>
              <span style={{ fontSize: '.75rem' }}>🤝</span>
              <span style={{ color: '#00ff88', fontFamily: 'DM Sans', fontSize: '.75rem', fontWeight: '600' }}>Referral Active</span>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem' },
  statusBanner: { display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.2rem', borderRadius: '12px', border: '1px solid', marginBottom: '1.5rem' },
  card: { background: '#030e1f', borderRadius: '16px', padding: '1.8rem', border: '1px solid #0f2040', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.2rem' },
  infoBox: { background: '#020c1b', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #00d4ff' },
  docRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#020c1b', borderRadius: '8px', border: '1px solid #0f2040' },
  uploadBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: '#0f2040', color: '#64748b', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans' },
  btn: { width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #00d4ff, #00ff88)', color: '#020817', border: 'none', borderRadius: '10px', fontFamily: 'Syne', fontWeight: '700', fontSize: '1rem', cursor: 'pointer' },
  invitedCard: { background: '#030e1f', border: '1px solid #00ff8833', borderRadius: '14px', padding: '1.3rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '.5rem' },
  invitedLeft: { display: 'flex', alignItems: 'center', gap: '1rem' },
  invitedBadge: { display: 'flex', alignItems: 'center', gap: '.4rem', background: '#00ff8811', border: '1px solid #00ff8833', padding: '.35rem .8rem', borderRadius: '99px' },
}