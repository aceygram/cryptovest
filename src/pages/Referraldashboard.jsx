import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useTheme, tokens } from '../context/ThemeContext'
import { Users, Copy, CheckCircle, TrendingUp, Gift } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const REFERRERS = {
  'ty75ghb':  { name:'Elon Musk',          avatar:'👨‍💼' },
  'k9x4mzt':  { name:'Nicholas Galitzine', avatar:'👨‍💻' },
  'q2v8rpl':  { name:'Timothée Chalamet',  avatar:'👨‍🎨' },
  'grace77q': { name:'Grace Okafor',        avatar:'👩‍💻' },
  'james4rt': { name:'James Oluwole',       avatar:'👨‍🦱' },
  'lucy55wx': { name:'Lucy Chen',           avatar:'👩‍🦰' },
  'soph55wx': { name:'Sophie Cunningham',   avatar:'👩‍🦰' },
  'dan001zz': { name:'Daniel Musa',         avatar:'👨‍🦳' },
  'emma88kk': { name:'Emma Williams',       avatar:'👩‍🦳' },
  'tony12pp': { name:'Tony Adeyemi',        avatar:'🧑‍💼' },
  'rose99vv': { name:'Rose Obi',            avatar:'👩‍🌾' },
}

const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }

export default function ReferralDashboard() {
  const { user, profile } = useAuth()
  const { theme } = useTheme()
  const t = tokens(theme)
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Check if this user is one of the hardcoded referrers
  const myReferralCode = Object.entries(REFERRERS).find(
    ([code, r]) => r.name === profile?.full_name
  )?.[0] || null

  const referralLink = myReferralCode
    ? `https://sentienttrade.online/register?ref=${myReferralCode}`
    : null

  useEffect(() => {
    if (user && myReferralCode) fetchReferrals()
    else setLoading(false)
  }, [user, myReferralCode])

  const fetchReferrals = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, sex, created_at, kyc_status, total_invested, balance')
      .eq('ref_code', myReferralCode)
      .order('created_at', { ascending: false })
    setReferrals(data || [])
    setLoading(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 3000)
  }

  const totalInvested = referrals.reduce((s, r) => s + (r.total_invested || 0), 0)
  const verifiedCount = referrals.filter(r => r.kyc_status === 'verified').length

  // User was referred by someone
  const myReferrer = REFERRERS[profile?.ref_code?.toLowerCase()]

  return (
    <div style={{ background: t.bg, minHeight: '100vh', fontFamily: "'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}@media(max-width:600px){.ref-grid{grid-template-columns:1fr 1fr!important}.ref-row{flex-wrap:wrap!important;gap:.5rem!important}}`}</style>
      <Toaster position="top-center"/>
      <Navbar/>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h2 style={{ color: t.text, margin: '0 0 .3rem', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-.02em' }}>Referral Dashboard</h2>
        <p style={{ color: t.textSub, margin: '0 0 2rem', fontFamily: 'DM Sans', fontSize: '.88rem' }}>Track who you've invited and your referral activity</p>

        {/* If user was referred by someone */}
        {myReferrer && (
          <div style={{ background: t.green + '08', border: `1px solid ${t.green}22`, borderRadius: '12px', padding: '1rem 1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>{myReferrer.avatar}</span>
            <div>
              <p style={{ color: t.textMuted, fontFamily: 'DM Sans', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>You were invited by</p>
              <p style={{ color: t.green, fontFamily: 'DM Sans', fontWeight: '700', fontSize: '.95rem', margin: '.15rem 0 0' }}>{myReferrer.name}</p>
            </div>
          </div>
        )}

        {/* Referral link — only for hardcoded referrers */}
        {myReferralCode ? (
          <>
            <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '16px', padding: '1.6rem', marginBottom: '1.5rem' }}>
              <h3 style={{ color: t.text, margin: '0 0 .3rem', fontWeight: '700', fontSize: '.95rem' }}>Your Referral Link</h3>
              <p style={{ color: t.textSub, fontFamily: 'DM Sans', fontSize: '.82rem', margin: '0 0 1.2rem' }}>Share this link — anyone who registers using it is tracked here.</p>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', background: t.input, padding: '.85rem 1rem', borderRadius: '8px', border: `1px solid ${t.cardBorder}` }}>
                <span style={{ color: t.cyan, fontFamily: 'DM Sans', fontSize: '.82rem', flex: 1, wordBreak: 'break-all' }}>{referralLink}</span>
                <button onClick={copyLink} style={{ background: 'none', border: 'none', color: t.textSub, cursor: 'pointer', flexShrink: 0 }}>
                  {copied ? <CheckCircle size={18} color={t.green}/> : <Copy size={18}/>}
                </button>
              </div>
              <p style={{ color: t.textMuted, fontFamily: 'DM Sans', fontSize: '.75rem', margin: '.6rem 0 0' }}>
                Your referral code: <strong style={{ color: t.text }}>{myReferralCode}</strong>
              </p>
            </div>

            {/* Stats */}
            <div className="ref-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { icon: <Users size={18}/>, label: 'Total Referrals', value: referrals.length, color: t.cyan },
                { icon: <CheckCircle size={18}/>, label: 'KYC Verified', value: verifiedCount, color: t.green },
                { icon: <TrendingUp size={18}/>, label: 'Total Invested', value: `$${totalInvested.toFixed(0)}`, color: t.yellow },
              ].map((card, i) => (
                <div key={i} style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: card.color + '18', color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{card.icon}</div>
                  <div>
                    <p style={{ color: t.textSub, margin: 0, fontFamily: 'DM Sans', fontSize: '.73rem' }}>{card.label}</p>
                    <p style={{ color: card.color, margin: '.15rem 0 0', fontWeight: '800', fontSize: '1.1rem' }}>{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Referral list */}
            <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '14px', padding: '1.2rem' }}>
              <h3 style={{ color: t.text, margin: '0 0 1rem', fontWeight: '700', fontSize: '.92rem' }}>
                People You Referred {referrals.length > 0 && <span style={{ color: t.textMuted, fontWeight: '400' }}>({referrals.length})</span>}
              </h3>
              {loading ? (
                <p style={{ color: t.textSub, fontFamily: 'DM Sans', textAlign: 'center', padding: '2rem 0' }}>Loading...</p>
              ) : referrals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                  <Gift size={36} color={t.textMuted} style={{ marginBottom: '1rem' }}/>
                  <p style={{ color: t.textMuted, fontFamily: 'DM Sans', fontSize: '.88rem', margin: 0 }}>No referrals yet. Share your link to get started.</p>
                </div>
              ) : (
                referrals.map(r => (
                  <div key={r.id} className="ref-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.8rem', background: t.input, borderRadius: '8px', marginBottom: '.5rem', border: `1px solid ${t.cardBorder}` }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff22,#00ff8822)', border: '1px solid #00d4ff44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {SEX_AVATARS[r.sex] || r.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: t.text, margin: 0, fontWeight: '600', fontFamily: 'DM Sans', fontSize: '.88rem' }}>{r.full_name}</p>
                      <p style={{ color: t.textSub, margin: '.1rem 0 0', fontFamily: 'DM Sans', fontSize: '.74rem' }}>Joined {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ padding: '.22rem .65rem', borderRadius: '99px', fontSize: '.72rem', fontFamily: 'DM Sans', fontWeight: '600',
                        background: r.kyc_status === 'verified' ? t.green + '18' : r.kyc_status === 'pending' ? t.yellow + '18' : t.red + '18',
                        color: r.kyc_status === 'verified' ? t.green : r.kyc_status === 'pending' ? t.yellow : t.red }}>
                        {r.kyc_status === 'verified' ? '✓ KYC' : r.kyc_status === 'pending' ? '⏳ Pending' : '⚠ No KYC'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ color: t.cyan, margin: 0, fontWeight: '700', fontFamily: 'DM Sans', fontSize: '.88rem' }}>${(r.total_invested || 0).toFixed(0)}</p>
                      <p style={{ color: t.textMuted, margin: '.1rem 0 0', fontFamily: 'DM Sans', fontSize: '.72rem' }}>invested</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          /* User is not a hardcoded referrer — show info only */
          <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
            <Users size={44} color={t.textMuted} style={{ marginBottom: '1rem' }}/>
            <p style={{ color: t.text, fontWeight: '700', fontSize: '1rem', margin: '0 0 .5rem' }}>Referral Program</p>
            <p style={{ color: t.textSub, fontFamily: 'DM Sans', fontSize: '.88rem', lineHeight: 1.7, margin: 0 }}>
              Our referral program is invite-only at this time. If you were referred by someone, it's shown above. Contact support if you're interested in becoming a referrer.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
