import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, TrendingUp, ArrowDownCircle,
  ArrowUpCircle, History, LogOut, Shield,
  Settings, ChevronDown, Menu, X
} from 'lucide-react'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

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
    // { to: '/admin/kyc', icon: <Settings size={15} />, label: 'Admin KYC', adminOnly: true },
  ]

  const active = (path) => location.pathname === path

  const kycColor = profile?.kyc_status === 'verified' ? '#00ff88'
    : profile?.kyc_status === 'pending' ? '#f59e0b' : '#ef4444'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .nv-item:hover { background: #0f2040 !important; color: #00d4ff !important; }
        .nv-item:hover svg { stroke: #00d4ff; }
        .nv-profile:hover { background: #0f2040 !important; }
        .nv-dd-item:hover { background: #0f2040 !important; color: #cbd5e1 !important; }
        .nv-signout:hover { background: #ef444418 !important; color: #ef4444 !important; }
        .nv-mob-item:hover { background: #0f2040 !important; color: #00d4ff !important; }

        /* Hide desktop nav on mobile, show hamburger */
        @media (max-width: 988px) {
          .nv-desktop { display: none !important; }
          .nv-balance { display: none !important; }
          .nv-profile-btn { display: none !important; }
          .nv-hamburger { display: flex !important; }
        }
        @media (min-width: 989px) {
          .nv-hamburger { display: none !important; }
          .nv-mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'rgba(2,8,23,.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #0f2040', fontFamily: "'Syne',sans-serif" }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.4rem', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>

          {/* Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '.55rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '.88rem', color: '#020817' }}>₿</div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '.98rem', letterSpacing: '-.02em' }}>CryptoVest</span>
          </Link>

          {/* Desktop nav */}
          <div className="nv-desktop" style={{ display: 'flex', alignItems: 'center', gap: '.1rem', flex: 1, justifyContent: 'center' }}>
            {navItems.map(item => {
              const isKyc = item.to === '/kyc'
              const isActive = active(item.to)
              return (
                <Link key={item.to} to={item.to} className="nv-item"
                  style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '0 .85rem', height: '62px', textDecoration: 'none', fontSize: '.8rem', fontWeight: '600', letterSpacing: '.01em', transition: 'all .2s', whiteSpace: 'nowrap', color: isActive ? '#00d4ff' : '#64748b', background: isActive ? '#0f2a4a' : 'transparent', borderBottom: `2px solid ${isActive ? '#00d4ff' : 'transparent'}` }}>
                  <span style={{ color: isActive ? '#00d4ff' : isKyc ? kycColor : '#64748b', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                  {isKyc && profile?.kyc_status !== 'verified' && (
                    <span style={{ background: kycColor + '22', color: kycColor, padding: '.1rem .38rem', borderRadius: '4px', fontSize: '.66rem', fontWeight: '700' }}>
                      {profile?.kyc_status === 'pending' ? '●' : '!'}
                    </span>
                  )}
                </Link>
              )
            })}
            {profile?.is_admin && (
              <Link to="/admin/kyc" className="nv-item"
                style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '0 .85rem', height: '62px', textDecoration: 'none', fontSize: '.8rem', fontWeight: '600', color: '#f59e0b', background: active('/admin/kyc') ? '#f59e0b11' : 'transparent', borderBottom: `2px solid ${active('/admin/kyc') ? '#f59e0b' : 'transparent'}`, transition: 'all .2s' }}>
                <Shield size={13} /> Admin KYC
              </Link>
            )}
            {profile?.is_admin && (
              <Link to="/admin" className="nv-item"
                style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '0 .85rem', height: '62px', textDecoration: 'none', fontSize: '.8rem', fontWeight: '600', color: '#f59e0b', background: active('/admin') ? '#f59e0b11' : 'transparent', borderBottom: `2px solid ${active('/admin') ? '#f59e0b' : 'transparent'}`, transition: 'all .2s' }}>
                <Settings size={15} /> Admin
              </Link>
            )}
          </div>

          {/* Right — desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', flexShrink: 0 }}>
            <div className="nv-balance" style={{ background: '#0f2040', border: '1px solid #1e3a5f', borderRadius: '8px', padding: '.38rem .85rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.65rem' }}>Balance</span>
              <span style={{ color: '#00ff88', fontWeight: '700', fontSize: '.86rem', fontFamily: 'DM Sans' }}>${profile?.balance?.toFixed(2) ?? '0.00'}</span>
            </div>

            {/* Profile dropdown */}
            <div className="nv-profile-btn" style={{ position: 'relative' }}>
              <button className="nv-profile" onClick={() => setProfileOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '.55rem', background: 'transparent', border: 'none', cursor: 'pointer', padding: '.38rem .65rem', borderRadius: '8px', transition: 'background .2s' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff22,#00ff8822)', border: '1px solid #00d4ff44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: '700', fontSize: '.84rem', flexShrink: 0 }}>
                  {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: '500' }}>{profile?.full_name?.split(' ')[0]}</span>
                  <span style={{ color: kycColor, fontFamily: 'DM Sans', fontSize: '.68rem' }}>
                    {profile?.kyc_status === 'verified' ? '✓ Verified' : profile?.kyc_status === 'pending' ? '⏳ Pending' : '⚠ Unverified'}
                  </span>
                </div>
                <ChevronDown size={13} color="#475569" style={{ transition: 'transform .2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>

              {profileOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#030e1f', border: '1px solid #0f2a4a', borderRadius: '12px', padding: '.45rem', minWidth: '210px', boxShadow: '0 20px 40px rgba(0,0,0,.6)', zIndex: 300 }}>
                  <div style={{ padding: '.7rem .75rem .55rem' }}>
                    <p style={{ color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '.86rem', fontWeight: '500' }}>{profile?.full_name}</p>
                    <p style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.76rem', marginTop: '.1rem' }}>{profile?.email}</p>
                  </div>
                  <div style={{ height: '1px', background: '#0f2040', margin: '.3rem 0' }} />
                  {[{ to: '/kyc', icon: <Shield size={13} />, label: 'KYC Verification' }, { to: '/history', icon: <History size={13} />, label: 'Transaction History' }].map(item => (
                    <Link key={item.to} to={item.to} className="nv-dd-item" onClick={() => setProfileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.55rem .75rem', color: '#64748b', fontFamily: 'DM Sans', fontSize: '.82rem', textDecoration: 'none', borderRadius: '6px', transition: 'all .2s' }}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
                  <div style={{ height: '1px', background: '#0f2040', margin: '.3rem 0' }} />
                  <button className="nv-signout" onClick={handleSignOut}
                    style={{ display: 'flex', alignItems: 'center', gap: '.55rem', padding: '.55rem .75rem', color: '#64748b', fontFamily: 'DM Sans', fontSize: '.82rem', borderRadius: '6px', transition: 'all .2s', cursor: 'pointer', background: 'transparent', border: 'none', width: '100%' }}>
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button className="nv-hamburger" onClick={() => setMobileOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '.4rem', color: '#94a3b8' }}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
        <div
          className="nv-mobile-menu"
          style={{
            background: '#020c1b',
            borderTop: '1px solid #0f2040'
          }}
        >
          {/* User info strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.9rem 1.4rem', borderBottom: '1px solid #0f2040' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff22,#00ff8822)', border: '1px solid #00d4ff44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: '700', fontSize: '.88rem' }}>
                {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div>
                <p style={{ color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '.84rem', fontWeight: '500' }}>{profile?.full_name}</p>
                <p style={{ color: kycColor, fontFamily: 'DM Sans', fontSize: '.7rem' }}>
                  {profile?.kyc_status === 'verified' ? '✓ Verified' : profile?.kyc_status === 'pending' ? '⏳ Pending' : '⚠ Unverified'}
                </p>
              </div>
            </div>
            <div style={{ background: '#0f2040', borderRadius: '8px', padding: '.35rem .8rem', textAlign: 'right' }}>
              <p style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.65rem' }}>Balance</p>
              <p style={{ color: '#00ff88', fontFamily: 'DM Sans', fontWeight: '700', fontSize: '.88rem' }}>${profile?.balance?.toFixed(2) ?? '0.00'}</p>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ padding: '.6rem' }}>
            {navItems.map(item => {
              const isActive = active(item.to)
              const isKyc = item.to === '/kyc'
              return (
                <Link key={item.to} to={item.to} className="nv-mob-item" onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.75rem 1rem', borderRadius: '8px', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.9rem', transition: 'all .2s', color: isActive ? '#00d4ff' : '#64748b', background: isActive ? '#0f2a4a' : 'transparent', marginBottom: '.2rem' }}>
                  <span style={{ color: isActive ? '#00d4ff' : isKyc ? kycColor : '#64748b', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                  {isKyc && profile?.kyc_status !== 'verified' && (
                    <span style={{ background: kycColor + '22', color: kycColor, padding: '.1rem .4rem', borderRadius: '4px', fontSize: '.68rem', fontWeight: '700', marginLeft: 'auto' }}>
                      {profile?.kyc_status === 'pending' ? 'Pending' : 'Required'}
                    </span>
                  )}
                </Link>
              )
            })}
            {profile?.is_admin && (
              <Link to="/admin/kyc" className="nv-item"
                style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '0 .85rem', height: '62px', textDecoration: 'none', fontSize: '.8rem', fontWeight: '600', color: '#f59e0b', background: active('/admin/kyc') ? '#f59e0b11' : 'transparent', borderBottom: `2px solid ${active('/admin/kyc') ? '#f59e0b' : 'transparent'}`, transition: 'all .2s' }}>
                <Shield size={15} /> Admin KYC
              </Link>
            )}
            {profile?.is_admin && (
              <Link to="/admin" className="nv-item"
                style={{ display: 'flex', alignItems: 'center', gap: '.38rem', padding: '0 .85rem', height: '62px', textDecoration: 'none', fontSize: '.8rem', fontWeight: '600', color: '#f59e0b', background: active('/admin') ? '#f59e0b11' : 'transparent', borderBottom: `2px solid ${active('/admin') ? '#f59e0b' : 'transparent'}`, transition: 'all .2s' }}>
                <Settings size={15} /> Admin
              </Link>
            )}
          </div>

          <div style={{ height: '1px', background: '#0f2040', margin: '0 .6rem' }} />
          <div style={{ padding: '.6rem' }}>
            <button onClick={handleSignOut}
              style={{ display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.75rem 1rem', borderRadius: '8px', fontFamily: 'DM Sans', fontSize: '.9rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all .2s' }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height: '62px' }} />
    </>
  )
}