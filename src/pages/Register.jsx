import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

const COUNTRY_CODES = [
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
]

const NATIONALITIES = [
  'Nigerian', 'American', 'British', 'Ghanaian', 'Kenyan', 'South African',
  'Indian', 'Emirati', 'German', 'French', 'Australian', 'Brazilian',
  'Chinese', 'Japanese', 'Russian', 'Spanish', 'Italian', 'Dutch',
  'Canadian', 'Moroccan', 'Egyptian', 'Ethiopian', 'Tanzanian', 'Ugandan',
  'Zambian', 'Zimbabwean', 'Other'
]

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', dob: '',
    nationality: '', phone_code: '+234', phone: '',
    password: '', confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showCodePicker, setShowCodePicker] = useState(false)
  const [step, setStep] = useState(1) // 1 = personal info, 2 = security
  const navigate = useNavigate()

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const validateStep1 = () => {
    if (!form.full_name.trim()) return 'Full name is required'
    if (!form.email.trim()) return 'Email is required'
    if (!form.dob) return 'Date of birth is required'
    const age = Math.floor((Date.now() - new Date(form.dob)) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 18) return 'You must be at least 18 years old'
    if (!form.nationality) return 'Select your nationality'
    if (!form.phone.trim()) return 'Phone number is required'
    return null
  }

  const validateStep2 = () => {
    if (!form.password) return 'Password is required'
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter'
    if (!/[0-9]/.test(form.password)) return 'Password must contain a number'
    if (form.password !== form.confirm_password) return 'Passwords do not match'
    return null
  }

  const handleNext = () => {
    const err = validateStep1()
    if (err) { toast.error(err); return }
    setStep(2)
  }

  const handleSubmit = async () => {
    const err = validateStep2()
    if (err) { toast.error(err); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          dob: form.dob,
          nationality: form.nationality,
          phone: `${form.phone_code}${form.phone}`
        }
      }
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email to confirm.')
      setTimeout(() => navigate('/login'), 3000)
    }
    setLoading(false)
  }

  const pwStrength = () => {
    if (!form.password) return { score: 0, label: '', color: '#1f2937' }
    let score = 0
    if (form.password.length >= 8) score++
    if (form.password.length >= 12) score++
    if (/[A-Z]/.test(form.password)) score++
    if (/[0-9]/.test(form.password)) score++
    if (/[^A-Za-z0-9]/.test(form.password)) score++
    if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
    if (score <= 3) return { score, label: 'Fair', color: '#f59e0b' }
    return { score, label: 'Strong', color: '#00ff88' }
  }

  const strength = pwStrength()
  const selectedCode = COUNTRY_CODES.find(c => c.code === form.phone_code) || COUNTRY_CODES[0]

  const inputStyle = {
    width: '100%', padding: '.82rem 1rem',
    background: '#020c1b', border: '1px solid #0f2a4a',
    borderRadius: '8px', color: '#f1f5f9',
    fontFamily: 'DM Sans', fontSize: '.9rem',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .2s'
  }
  const labelStyle = {
    color: '#475569', fontFamily: 'DM Sans',
    fontSize: '.75rem', fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: '.06em',
    display: 'block', marginBottom: '.4rem'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: "'Syne',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box}
        .ri:focus{border-color:#00d4ff66!important;outline:none}
        .ri::placeholder{color:#334155}
        select.ri{appearance:none;cursor:pointer}
        .code-opt:hover{background:#0f2040!important}
      `}</style>
      <Toaster position="top-center" />

      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', color: '#020817' }}>₿</div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.15rem', letterSpacing: '-.02em' }}>CryptoVest</span>
        </div>

        <div style={{ background: '#030e1f', border: '1px solid #0f2a4a', borderRadius: '18px', padding: '2rem', boxShadow: '0 24px 60px rgba(0,0,0,.5)' }}>

          {/* Header */}
          <div style={{ marginBottom: '1.6rem' }}>
            <h2 style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-.02em', margin: '0 0 .3rem' }}>
              {step === 1 ? 'Create Account' : 'Set Password'}
            </h2>
            <p style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.85rem', margin: 0 }}>
              {step === 1 ? 'Step 1 of 2 — Personal Information' : 'Step 2 of 2 — Account Security'}
            </p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1.8rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: '3px', borderRadius: '99px', background: s <= step ? 'linear-gradient(90deg,#00d4ff,#00ff88)' : '#0f2a4a', transition: 'background .4s' }} />
            ))}
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input className="ri" style={inputStyle} placeholder="e.g. John Smith"
                  value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input className="ri" style={inputStyle} type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>

              {/* DOB */}
              <div>
                <label style={labelStyle}>Date of Birth</label>
                <input className="ri" style={{ ...inputStyle, colorScheme: 'dark' }} type="date"
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  value={form.dob} onChange={e => set('dob', e.target.value)} />
              </div>

              {/* Nationality */}
              <div>
                <label style={labelStyle}>Nationality</label>
                <select className="ri" style={{ ...inputStyle, background: '#020c1b' }}
                  value={form.nationality} onChange={e => set('nationality', e.target.value)}>
                  <option value="">Select nationality</option>
                  {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  {/* Country code picker */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button type="button" onClick={() => setShowCodePicker(o => !o)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.82rem .9rem', background: '#020c1b', border: '1px solid #0f2a4a', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '.88rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'border-color .2s' }}>
                      <span>{selectedCode.flag}</span>
                      <span>{selectedCode.code}</span>
                      <span style={{ color: '#475569', fontSize: '.7rem', transition: 'transform .2s', display: 'inline-block', transform: showCodePicker ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
                    </button>
                    {showCodePicker && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: '#030e1f', border: '1px solid #0f2a4a', borderRadius: '10px', padding: '.4rem', zIndex: 50, maxHeight: '220px', overflowY: 'auto', minWidth: '200px', boxShadow: '0 16px 40px rgba(0,0,0,.6)' }}>
                        {COUNTRY_CODES.map((c, i) => (
                          <div key={i} className="code-opt"
                            onClick={() => { set('phone_code', c.code); setShowCodePicker(false) }}
                            style={{ display: 'flex', alignItems: 'center', gap: '.6rem', padding: '.55rem .75rem', borderRadius: '6px', cursor: 'pointer', transition: 'background .15s' }}>
                            <span>{c.flag}</span>
                            <span style={{ color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '.82rem', flex: 1 }}>{c.name}</span>
                            <span style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.78rem' }}>{c.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input className="ri" style={{ ...inputStyle, flex: 1 }} type="tel"
                    placeholder="8012345678" value={form.phone}
                    onChange={e => set('phone', e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>

              <button onClick={handleNext}
                style={{ width: '100%', padding: '.9rem', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', color: '#020817', border: 'none', borderRadius: '10px', fontFamily: 'Syne', fontWeight: '700', fontSize: '.95rem', cursor: 'pointer', marginTop: '.3rem' }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <input className="ri" style={inputStyle} type="password" placeholder="Min. 8 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} />
                {/* Strength bar */}
                {form.password && (
                  <div style={{ marginTop: '.6rem' }}>
                    <div style={{ display: 'flex', gap: '.3rem', marginBottom: '.3rem' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', background: i <= strength.score ? strength.color : '#0f2040', transition: 'background .3s' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Password strength</span>
                      <span style={{ color: strength.color, fontFamily: 'DM Sans', fontSize: '.72rem', fontWeight: '600' }}>{strength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input className="ri" style={{ ...inputStyle, borderColor: form.confirm_password && form.confirm_password !== form.password ? '#ef444466' : '#0f2a4a' }}
                  type="password" placeholder="Re-enter password"
                  value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} />
                {form.confirm_password && form.confirm_password !== form.password && (
                  <p style={{ color: '#ef4444', fontFamily: 'DM Sans', fontSize: '.75rem', marginTop: '.35rem' }}>Passwords do not match</p>
                )}
                {form.confirm_password && form.confirm_password === form.password && (
                  <p style={{ color: '#00ff88', fontFamily: 'DM Sans', fontSize: '.75rem', marginTop: '.35rem' }}>✓ Passwords match</p>
                )}
              </div>

              {/* Requirements */}
              <div style={{ background: '#020c1b', borderRadius: '8px', padding: '.9rem 1rem' }}>
                <p style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.75rem', marginBottom: '.5rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.05em' }}>Requirements</p>
                {[
                  [form.password.length >= 8, 'At least 8 characters'],
                  [/[A-Z]/.test(form.password), 'One uppercase letter'],
                  [/[0-9]/.test(form.password), 'One number'],
                  [form.password === form.confirm_password && form.confirm_password !== '', 'Passwords match'],
                ].map(([met, label], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
                    <span style={{ color: met ? '#00ff88' : '#334155', fontSize: '.78rem' }}>{met ? '✓' : '○'}</span>
                    <span style={{ color: met ? '#94a3b8' : '#334155', fontFamily: 'DM Sans', fontSize: '.78rem' }}>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '.7rem' }}>
                <button onClick={() => setStep(1)}
                  style={{ flex: 1, padding: '.9rem', background: 'transparent', border: '1px solid #0f2a4a', color: '#64748b', borderRadius: '10px', fontFamily: 'Syne', fontWeight: '600', fontSize: '.92rem', cursor: 'pointer' }}>
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ flex: 2, padding: '.9rem', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', color: '#020817', border: 'none', borderRadius: '10px', fontFamily: 'Syne', fontWeight: '700', fontSize: '.95rem', cursor: 'pointer', opacity: loading ? .7 : 1 }}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#334155', fontFamily: 'DM Sans', fontSize: '.83rem', marginTop: '1.4rem', marginBottom: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}