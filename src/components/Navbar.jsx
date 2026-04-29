import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, TrendingUp, ArrowDownCircle,
  ArrowUpCircle, History, LogOut, Shield,
  Settings, ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  // close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { to: '/plans', icon: <TrendingUp size={15} />, label: 'Plans' },
    { to: '/deposit', icon: <ArrowDownCircle size={15} />, label: 'Deposit' },
    { to: '/withdraw', icon: <ArrowUpCircle size={15} />, label: 'Withdraw' },
    { to: '/history', icon: <History size={15} />, label: 'History' },
    { to: '/kyc', icon: <Shield size={15} />, label: 'KYC' },
  ]

  const isActive = (path) => location.pathname === path

  const kycColor = profile?.kyc_status === 'verified' ? '#00ff88'
    : profile?.kyc_status === 'pending' ? '#f59e0b' : '#ef4444'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        /* Nav item hover */
        .nv-link { transition: color .2s, background .2s; }
        .nv-link:hover { color: #00d4ff !important; background: rgba(0,212,255,0.06) !important; }

        /* Profile button */
        .nv-profile { transition: background .2s; }
        .nv-profile:hover { background: rgba(0,212,255,0.06) !important; }

        /* Dropdown items */
        .nv-dd { transition: background .2s, color .2s; }
        .nv-dd:hover { background: #0f2040 !important; color: #cbd5e1 !important; }

        /* Sign out hover */
        .nv-out { transition: background .2s, color .2s; }
        .nv-out:hover { background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; }

        /* Mobile items */
        .nv-mob { transition: background .2s, color .2s; }
        .nv-mob:hover { background: rgba(0,212,255,0.06) !important; color: #00d4ff !important; }

        /* Dropdown enter animation */
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nv-dropdown { animation: dropIn .18s cubic-bezier(.16,1,.3,1) both; }

        /* Mobile slide animation */
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 600px; }
        }
        @keyframes slideUp {
          from { opacity: 1; max-height: 600px; }
          to   { opacity: 0; max-height: 0; }
        }
        .nv-mobile-open  { animation: slideDown .28s cubic-bezier(.16,1,.3,1) both; }
        .nv-mobile-close { animation: slideUp  .22s cubic-bezier(.4,0,1,1) both; }

        /* Hamburger bars */
        .hb-bar { display: block; width: 20px; height: 2px; background: #94a3b8; border-radius: 2px;
          transition: transform .3s cubic-bezier(.16,1,.3,1), opacity .2s, width .3s; transform-origin: center; }
        .hb-open .hb-bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
        .hb-open .hb-bar:nth-child(2) { opacity: 0; width: 0; }
        .hb-open .hb-bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

        /* Hide desktop nav on small screens */
        @media (max-width: 860px) {
          .nv-desktop  { display: none !important; }
          .nv-balance  { display: none !important; }
          .nv-profbtn  { display: none !important; }
          .nv-hamburger { display: flex !important; }
        }
        @media (min-width: 861px) {
          .nv-hamburger  { display: none !important; }
          .nv-mobile-wrap { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(2,8,23,.97)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid #0f2040', fontFamily: "'Syne',sans-serif"
      }}>
        {/* Main bar */}
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          padding: '0 1.4rem', height: '62px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'
        }}>

          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '.55rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '.88rem', color: '#020817' }}>₿</div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '.98rem', letterSpacing: '-.02em' }}>CryptoVest</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nv-desktop" style={{ display: 'flex', alignItems: 'center', gap: '.05rem', flex: 1, justifyContent: 'center' }}>
            {navItems.map(item => {
              const active = isActive(item.to)
              const isKyc = item.to === '/kyc'
              return (
                <Link key={item.to} to={item.to} className="nv-link"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.38rem',
                    padding: '0 .9rem', height: '62px',
                    textDecoration: 'none', fontSize: '.78rem', fontWeight: '600',
                    letterSpacing: '.01em', whiteSpace: 'nowrap',
                    color: active ? '#00d4ff' : '#64748b',
                    background: active ? 'rgba(0,212,255,0.07)' : 'transparent',
                    borderBottom: `2px solid ${active ? '#00d4ff' : 'transparent'}`,
                    transition: 'color .2s, background .2s, border-color .2s',
                  }}>
                  <span style={{ color: active ? '#00d4ff' : isKyc ? kycColor : '#64748b', display: 'flex', transition: 'color .2s' }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isKyc && profile?.kyc_status !== 'verified' && (
                    <span style={{ background: kycColor + '22', color: kycColor, padding: '.1rem .38rem', borderRadius: '4px', fontSize: '.64rem', fontWeight: '700' }}>
                      {profile?.kyc_status === 'pending' ? '●' : '!'}
                    </span>
                  )}
                </Link>
              )
            })}
            {profile?.is_admin && (
              <Link to="/admin" className="nv-link"
                style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '0 .9rem', height: '62px', textDecoration: 'none', fontSize: '.78rem', fontWeight: '600', color: '#f59e0b', background: isActive('/admin') ? 'rgba(245,158,11,0.07)' : 'transparent', borderBottom: `2px solid ${isActive('/admin') ? '#f59e0b' : 'transparent'}`, transition: 'all .2s' }}>
                <Settings size={15} /> Admin
              </Link>
            )}
            {profile?.is_admin && (
              <Link to="/admin/kyc" className="nv-link"
                style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '0 .9rem', height: '62px', textDecoration: 'none', fontSize: '.78rem', fontWeight: '600', color: '#f59e0b', background: isActive('/admin/kyc') ? 'rgba(245,158,11,0.07)' : 'transparent', borderBottom: `2px solid ${isActive('/admin/kyc') ? '#f59e0b' : 'transparent'}`, transition: 'all .2s' }}>
                <Shield size={15} /> KYC Review
              </Link>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', flexShrink: 0 }}>

            {/* Balance pill */}
            <div className="nv-balance" style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '.36rem .85rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.63rem' }}>Balance</span>
              <span style={{ color: '#00ff88', fontWeight: '700', fontSize: '.85rem', fontFamily: 'DM Sans' }}>
                ${profile?.balance?.toFixed(2) ?? '0.00'}
              </span>
            </div>

            {/* Profile dropdown */}
            <div className="nv-profbtn" ref={profileRef} style={{ position: 'relative' }}>
              <button className="nv-profile" onClick={() => setProfileOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '.55rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: '.36rem .65rem', borderRadius: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff22,#00ff8822)', border: '1px solid #00d4ff44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: '700', fontSize: '.84rem' }}>
                  {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: '500' }}>{profile?.full_name?.split(' ')[0]}</span>
                  <span style={{ color: kycColor, fontFamily: 'DM Sans', fontSize: '.66rem' }}>
                    {profile?.kyc_status === 'verified' ? '✓ Verified' : profile?.kyc_status === 'pending' ? '⏳ Pending' : '⚠ Unverified'}
                  </span>
                </div>
                <ChevronDown size={13} color="#475569" style={{ transition: 'transform .25s cubic-bezier(.16,1,.3,1)', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {profileOpen && (
                <div className="nv-dropdown" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#030e1f', border: '1px solid #0f2a4a', borderRadius: '12px', padding: '.45rem', minWidth: '215px', boxShadow: '0 24px 48px rgba(0,0,0,.7)', zIndex: 300 }}>
                  <div style={{ padding: '.7rem .75rem .55rem' }}>
                    <p style={{ color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '.86rem', fontWeight: '500', margin: 0 }}>{profile?.full_name}</p>
                    <p style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.75rem', margin: '.1rem 0 0' }}>{profile?.email}</p>
                  </div>
                  <div style={{ height: '1px', background: '#0f2040', margin: '.3rem 0' }} />
                  {[
                    { to: '/kyc', icon: <Shield size={13} />, label: 'KYC Verification' },
                    { to: '/history', icon: <History size={13} />, label: 'Transaction History' }
                  ].map(item => (
                    <Link key={item.to} to={item.to} className="nv-dd" onClick={() => setProfileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.52rem .75rem', color: '#64748b', fontFamily: 'DM Sans', fontSize: '.82rem', textDecoration: 'none', borderRadius: '6px' }}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
                  <div style={{ height: '1px', background: '#0f2040', margin: '.3rem 0' }} />
                  <button className="nv-out" onClick={handleSignOut}
                    style={{ display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.52rem .75rem', color: '#64748b', fontFamily: 'DM Sans', fontSize: '.82rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: 'none', width: '100%' }}>
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button className={`nv-hamburger ${mobileOpen ? 'hb-open' : ''}`}
              onClick={() => setMobileOpen(o => !o)}
              style={{ display: 'none', flexDirection: 'column', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '.4rem', borderRadius: '6px' }}
              aria-label="Toggle menu">
              <span className="hb-bar" />
              <span className="hb-bar" />
              <span className="hb-bar" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`nv-mobile-wrap ${mobileOpen ? 'nv-mobile-open' : 'nv-mobile-close'}`}
          style={{ background: '#020c1b', borderTop: '1px solid #0f2040', overflow: 'hidden' }}>

          {/* User strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.4rem', borderBottom: '1px solid #0f2040' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff22,#00ff8822)', border: '1px solid #00d4ff44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: '700', fontSize: '.88rem' }}>
                {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div>
                <p style={{ color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '.84rem', fontWeight: '500', margin: 0 }}>{profile?.full_name}</p>
                <p style={{ color: kycColor, fontFamily: 'DM Sans', fontSize: '.7rem', margin: 0 }}>
                  {profile?.kyc_status === 'verified' ? '✓ Verified' : profile?.kyc_status === 'pending' ? '⏳ Pending' : '⚠ Unverified'}
                </p>
              </div>
            </div>
            <div style={{ background: '#0f2040', borderRadius: '8px', padding: '.35rem .8rem', textAlign: 'right' }}>
              <p style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.63rem', margin: 0 }}>Balance</p>
              <p style={{ color: '#00ff88', fontFamily: 'DM Sans', fontWeight: '700', fontSize: '.88rem', margin: 0 }}>
                ${profile?.balance?.toFixed(2) ?? '0.00'}
              </p>
            </div>
          </div>

          {/* Links */}
          <div style={{ padding: '.6rem' }}>
            {navItems.map((item, idx) => {
              const active = isActive(item.to)
              const isKyc = item.to === '/kyc'
              return (
                <Link key={item.to} to={item.to} className="nv-mob"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.7rem',
                    padding: '.72rem 1rem', borderRadius: '8px',
                    textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.88rem',
                    color: active ? '#00d4ff' : '#64748b',
                    background: active ? 'rgba(0,212,255,0.07)' : 'transparent',
                    marginBottom: '.2rem',
                    animation: `fadeIn .25s ${idx * 0.04}s both`,
                  }}>
                  <span style={{ color: active ? '#00d4ff' : isKyc ? kycColor : '#64748b', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                  {isKyc && profile?.kyc_status !== 'verified' && (
                    <span style={{ marginLeft: 'auto', background: kycColor + '22', color: kycColor, padding: '.1rem .45rem', borderRadius: '4px', fontSize: '.68rem', fontWeight: '700' }}>
                      {profile?.kyc_status === 'pending' ? 'Pending' : 'Required'}
                    </span>
                  )}
                </Link>
              )
            })}
            {profile?.is_admin && (
              <Link to="/admin" className="nv-mob" onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.72rem 1rem', borderRadius: '8px', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.88rem', color: '#f59e0b', background: 'transparent', marginBottom: '.2rem' }}>
                <Settings size={15} /> Admin Panel
              </Link>
            )}
            {profile?.is_admin && (
              <Link to="/admin/kyc" className="nv-mob" onClick={() => setMobileOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.72rem 1rem', borderRadius: '8px', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.88rem', color: '#f59e0b', background: 'transparent', marginBottom: '.2rem' }}>
                <Settings size={15} /> KYC Review
              </Link>
            )}
          </div>

          <div style={{ height: '1px', background: '#0f2040', margin: '0 .6rem' }} />
          <div style={{ padding: '.6rem' }}>
            <button onClick={handleSignOut} className="nv-out"
              style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.72rem 1rem', borderRadius: '8px', fontFamily: 'DM Sans', fontSize: '.88rem', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: '62px' }} />

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </>
  )
}