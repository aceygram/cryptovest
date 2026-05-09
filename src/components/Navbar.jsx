import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme, tokens } from '../context/ThemeContext'
import { LayoutDashboard, TrendingUp, ArrowDownCircle, ArrowUpCircle, History, LogOut, Shield, Settings, ChevronDown, User, Sun, Moon, BookOpen, Users, HandHelping } from 'lucide-react'

import AnnouncementBanner from './Announcementbanner'

const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }

export default function Navbar() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const t = tokens(theme)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const isActive = (p) => location.pathname === p
  const kycColor = profile?.kyc_status === 'verified' ? t.green : profile?.kyc_status === 'pending' ? t.yellow : t.red
  const avatarEmoji = SEX_AVATARS[profile?.sex] || '🧑'

  const navItems = [
    { to:'/dashboard', icon:<LayoutDashboard size={15}/>, label:'Dashboard' },
    { to:'/plans',     icon:<TrendingUp size={15}/>,      label:'Plans' },
    { to:'/deposit',   icon:<ArrowDownCircle size={15}/>, label:'Deposit' },
    { to:'/withdraw',  icon:<ArrowUpCircle size={15}/>,   label:'Withdraw' },
    { to:'/history',   icon:<History size={15}/>,         label:'History' },
    { to:'/kyc',        icon:<Shield size={15}/>,          label:'KYC' },
    { to:'/investments', icon:<BookOpen size={15}/>,        label:'My Plans' },
    { to:'/referrals',   icon:<Users size={15}/>,           label:'Referrals' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .nv-link{transition:color .2s,background .2s}
        .nv-link:hover{color:#00d4ff!important;background:rgba(0,212,255,0.06)!important}
        .nv-profile,.nv-theme{transition:background .2s}
        .nv-profile:hover,.nv-theme:hover{background:rgba(0,212,255,0.06)!important}
        .nv-dd{transition:background .2s,color .2s}
        .nv-dd:hover{background:${t.hover}!important;color:${t.text}!important}
        .nv-out{transition:background .2s,color .2s}
        .nv-out:hover{background:rgba(239,68,68,0.1)!important;color:#ef4444!important}
        .nv-mob{transition:background .2s,color .2s}
        .nv-mob:hover{background:rgba(0,212,255,0.06)!important;color:#00d4ff!important}
        .nv-plink{transition:background .2s}.nv-plink:hover{background:${t.hover}!important}
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        .nv-dropdown{animation:dropIn .18s cubic-bezier(.16,1,.3,1) both}
        @keyframes slideDown{from{opacity:0;max-height:0}to{opacity:1;max-height:700px}}
        @keyframes slideUp{from{opacity:1;max-height:700px}to{opacity:0;max-height:0}}
        .nv-mobile-open{animation:slideDown .28s cubic-bezier(.16,1,.3,1) both}
        .nv-mobile-close{animation:slideUp .22s cubic-bezier(.4,0,1,1) both}
        .hb-bar{display:block;width:20px;height:2px;background:${t.textSub};border-radius:2px;transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s,width .3s;transform-origin:center}
        .hb-open .hb-bar:nth-child(1){transform:translateY(6px) rotate(45deg)}
        .hb-open .hb-bar:nth-child(2){opacity:0;width:0}
        .hb-open .hb-bar:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
        @media(max-width:989px){.nv-desktop{display:none!important}.nv-balance{display:none!important}.nv-profbtn{display:none!important}.nv-hamburger{display:flex!important}}
        @media(min-width:990px){.nv-hamburger{display:none!important}.nv-mobile-wrap{display:none!important}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:200,background:t.nav,backdropFilter:'blur(24px)',borderBottom:`1px solid ${t.navBorder}`,fontFamily:"'Syne',sans-serif" }}>
        <div style={{ maxWidth:'1400px',margin:'0 auto',padding:'0 1.4rem',height:'62px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem' }}>

          <Link to="/dashboard" style={{ display:'flex',alignItems:'center',gap:'.55rem',textDecoration:'none',flexShrink:0 }}>
            <div style={{ width:'30px',height:'30px',background:t.grad,borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.78rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
            <span style={{ color:t.text,fontWeight:'800',fontSize:'.98rem',letterSpacing:'-.03em' }}>SentientTrade</span>
          </Link>

          <div className="nv-desktop" style={{ display:'flex',alignItems:'center',gap:'.05rem',flex:1,justifyContent:'center' }}>
            {navItems.map(item => {
              const active = isActive(item.to)
              const isKyc = item.to === '/kyc'
              return (
                <Link key={item.to} to={item.to} className="nv-link"
                  style={{ display:'flex',alignItems:'center',gap:'.38rem',padding:'0 .9rem',height:'62px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',letterSpacing:'.01em',whiteSpace:'nowrap',color:active?t.cyan:t.textSub,background:active?'rgba(0,212,255,0.07)':'transparent',borderBottom:`2px solid ${active?t.cyan:'transparent'}`,transition:'all .2s' }}>
                  <span style={{ color:active?t.cyan:isKyc?kycColor:t.textSub,display:'flex',transition:'color .2s' }}>{item.icon}</span>
                  {item.label}
                  {isKyc && profile?.kyc_status !== 'verified' && (
                    <span style={{ background:kycColor+'22',color:kycColor,padding:'.1rem .38rem',borderRadius:'4px',fontSize:'.64rem',fontWeight:'700' }}>
                      {profile?.kyc_status === 'pending' ? '●' : '!'}
                    </span>
                  )}
                </Link>
              )
            })}
            
          </div>

          <div style={{ display:'flex',alignItems:'center',gap:'.7rem',flexShrink:0 }}>
            <div className="nv-balance" style={{ background:isDark?'#0f2040':t.bgSub,border:`1px solid ${isDark?'#1e3a5f':t.cardBorder}`,borderRadius:'8px',padding:'.36rem .85rem',display:'flex',flexDirection:'column',alignItems:'flex-end' }}>
              <span style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.63rem' }}>Balance</span>
              <span style={{ color:t.green,fontWeight:'700',fontSize:'.85rem',fontFamily:'DM Sans' }}>${profile?.balance?.toFixed(2)??'0.00'}</span>
            </div>

            {/* Theme toggle */}
            <button className="nv-theme" onClick={toggleTheme}
              style={{ background:'transparent',border:`1px solid ${t.cardBorder}`,borderRadius:'8px',cursor:'pointer',padding:'.36rem .55rem',display:'flex',alignItems:'center',justifyContent:'center',color:t.textSub }}>
              {isDark ? <Sun size={16}/> : <Moon size={16}/>}
            </button>

            <div className="nv-profbtn" ref={profileRef} style={{ position:'relative' }}>
              <button className="nv-profile" onClick={() => setProfileOpen(o=>!o)}
                style={{ display:'flex',alignItems:'center',gap:'.55rem',background:'transparent',border:'none',cursor:'pointer',padding:'.36rem .65rem',borderRadius:'8px' }}>
                <div style={{ width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff22,#00ff8822)',border:'1px solid #00d4ff44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0 }}>
                  {avatarEmoji}
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-start' }}>
                  <span style={{ color:t.text,fontFamily:'DM Sans',fontSize:'.8rem',fontWeight:'500' }}>{profile?.full_name?.split(' ')[0]}</span>
                  <span style={{ color:kycColor,fontFamily:'DM Sans',fontSize:'.66rem' }}>
                    {profile?.kyc_status==='verified'?'✓ Verified':profile?.kyc_status==='pending'?'⏳ Pending':'⚠ Unverified'}
                  </span>
                </div>
                <ChevronDown size={13} color={t.textSub} style={{ transition:'transform .25s cubic-bezier(.16,1,.3,1)',transform:profileOpen?'rotate(180deg)':'rotate(0)' }}/>
              </button>

              {profileOpen && (
                <div className="nv-dropdown" style={{ position:'absolute',top:'calc(100% + 8px)',right:0,background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'12px',padding:'.45rem',minWidth:'225px',boxShadow:t.shadow,zIndex:300 }}>
                  <Link to="/profile" className="nv-plink" onClick={() => setProfileOpen(false)}
                    style={{ display:'block',padding:'.7rem .75rem .6rem',borderRadius:'8px',textDecoration:'none' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:'.6rem' }}>
                      <div style={{ width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff22,#00ff8822)',border:'1px solid #00d4ff44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0 }}>
                        {avatarEmoji}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ color:t.text,fontFamily:'DM Sans',fontSize:'.86rem',fontWeight:'500',margin:0 }}>{profile?.full_name}</p>
                        <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.74rem',margin:'.1rem 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{profile?.email}</p>
                      </div>
                    </div>
                    <div style={{ display:'flex',alignItems:'center',gap:'.3rem',marginTop:'.5rem',color:t.cyan,fontFamily:'DM Sans',fontSize:'.72rem' }}>
                      <User size={11}/> View Profile & Settings →
                    </div>
                  </Link>
                  <div style={{ height:'1px',background:t.cardBorder,margin:'.3rem 0' }}/>
                  {[{to:'/kyc',icon:<Shield size={13}/>,label:'KYC Verification'},{to:'/history',icon:<History size={13}/>,label:'Transaction History'},{to:'/support',icon:<HandHelping size={13}/>,label:'Support'}].map(item=>(
                    <Link key={item.to} to={item.to} className="nv-dd" onClick={() => setProfileOpen(false)}
                      style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'.52rem .75rem',color:t.textSub,fontFamily:'DM Sans',fontSize:'.82rem',textDecoration:'none',borderRadius:'6px' }}>
                      {item.icon} {item.label}
                    </Link>
                  ))}

                  {profile?.is_admin && (
              <>
                <Link to="/admin" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'0 .9rem',height:'32px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <Settings size={13}/> Admin
                </Link>
                <Link to="/admin/kyc" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'0 .9rem',height:'32px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin/kyc')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin/kyc')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <Shield size={13}/> KYC Review
                </Link>
                <Link to="/admin/support" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'0 .9rem',height:'32px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin/support')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin/support')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <HandHelping size={13}/> Support Request
                </Link>
                <Link to="/admin/announcements" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'0 .9rem',height:'32px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin/announcements')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin/announcements')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <HandHelping size={13}/> Announcements
                </Link>
              </>
            )}
                  <div style={{ height:'1px',background:t.cardBorder,margin:'.3rem 0' }}/>
                  <button className="nv-out" onClick={handleSignOut}
                    style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'.52rem .75rem',color:t.textSub,fontFamily:'DM Sans',fontSize:'.82rem',borderRadius:'6px',cursor:'pointer',background:'transparent',border:'none',width:'100%' }}>
                    <LogOut size={13}/> Sign Out
                  </button>
                </div>
              )}
            </div>

            <button className={`nv-hamburger${mobileOpen?' hb-open':''}`} onClick={() => setMobileOpen(o=>!o)}
              style={{ display:'none',flexDirection:'column',gap:'4px',background:'none',border:'none',cursor:'pointer',padding:'.4rem',borderRadius:'6px' }} aria-label="Toggle menu">
              <span className="hb-bar"/><span className="hb-bar"/><span className="hb-bar"/>
            </button>
          </div>
        </div>

        <div className={`nv-mobile-wrap${mobileOpen?' nv-mobile-open':' nv-mobile-close'}`}
          style={{ background:isDark?'#020c1b':t.bgSub,borderTop:`1px solid ${t.navBorder}`,overflow:'hidden' }}>
          <Link to="/profile" onClick={() => setMobileOpen(false)} className="nv-plink"
            style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.9rem 1.4rem',borderBottom:`1px solid ${t.navBorder}`,textDecoration:'none' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'.6rem' }}>
              <div style={{ width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff22,#00ff8822)',border:'1px solid #00d4ff44',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0 }}>
                {avatarEmoji}
              </div>
              <div>
                <p style={{ color:t.text,fontFamily:'DM Sans',fontSize:'.84rem',fontWeight:'500',margin:0 }}>{profile?.full_name}</p>
                <p style={{ color:t.cyan,fontFamily:'DM Sans',fontSize:'.7rem',margin:0 }}>View Profile →</p>
              </div>
            </div>
            <div style={{ background:isDark?'#0f2040':t.bgSub,border:`1px solid ${t.cardBorder}`,borderRadius:'8px',padding:'.35rem .8rem',textAlign:'right' }}>
              <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.63rem',margin:0 }}>Balance</p>
              <p style={{ color:t.green,fontFamily:'DM Sans',fontWeight:'700',fontSize:'.88rem',margin:0 }}>${profile?.balance?.toFixed(2)??'0.00'}</p>
            </div>
          </Link>
          <div style={{ padding:'.6rem' }}>
            {navItems.map((item,idx) => {
              const active = isActive(item.to)
              const isKyc = item.to === '/kyc'
              return (
                <Link key={item.to} to={item.to} className="nv-mob" onClick={() => setMobileOpen(false)}
                  style={{ display:'flex',alignItems:'center',gap:'.7rem',padding:'.72rem 1rem',borderRadius:'8px',textDecoration:'none',fontFamily:'DM Sans',fontSize:'.88rem',color:active?t.cyan:t.textSub,background:active?'rgba(0,212,255,0.07)':'transparent',marginBottom:'.2rem',animation:`fadeIn .25s ${idx*0.04}s both` }}>
                  <span style={{ color:active?t.cyan:isKyc?kycColor:t.textSub,display:'flex' }}>{item.icon}</span>
                  {item.label}
                  {isKyc && profile?.kyc_status !== 'verified' && (
                    <span style={{ marginLeft:'auto',background:kycColor+'22',color:kycColor,padding:'.1rem .45rem',borderRadius:'4px',fontSize:'.68rem',fontWeight:'700' }}>
                      {profile?.kyc_status==='pending'?'Pending':'Required'}
                    </span>
                  )}
                </Link>
              )
            })}
                {profile?.is_admin && (
              <>
                <Link to="/admin" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.80rem',padding:'0 1rem',height:'40px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <Settings size={13}/> Admin
                </Link>
                {/* <Link to="/admin/kyc" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'0 .9rem',height:'40px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin/kyc')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin/kyc')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <Shield size={13}/> KYC Review
                </Link>
                <Link to="/admin/support" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'0 .9rem',height:'40px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin/support')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin/support')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <HandHelping size={13}/> Support Request
                </Link>
                <Link to="/admin/announcements" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.55rem',padding:'0 .9rem',height:'40px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:t.yellow,background:isActive('/admin/announcements')?'rgba(245,158,11,0.07)':'transparent',borderBottom:`2px solid ${isActive('/admin/announcements')?t.yellow:'transparent'}`,transition:'all .2s' }}>
                  <HandHelping size={13}/> Announcement
                </Link> */}
              </>
            )}
            {!profile?.is_admin && (
              <>
                <Link to="/support" className="nv-link" style={{ display:'flex',alignItems:'center',gap:'.80rem',padding:'0 1rem', marginBottom:'.2rem',height:'40px',textDecoration:'none',fontSize:'.78rem',fontWeight:'600',color:isActive('/support')?t.cyan:t.textSub,background:isActive('/support')?'rgba(0,212,255,0.07)':'transparent',transition:'all .2s' }}>
                  <Settings size={13}/> Support
                </Link>
              </>
            )}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.72rem 1rem',borderRadius:'8px',background:t.hover,marginBottom:'.2rem' }}>
              <span style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.88rem' }}>{isDark?'Dark Mode':'Light Mode'}</span>
              <button onClick={toggleTheme} style={{ background:isDark?'#0f2040':t.bgSub,border:`1px solid ${t.cardBorder}`,borderRadius:'6px',cursor:'pointer',padding:'.3rem .6rem',color:t.textSub,display:'flex',alignItems:'center',gap:'.3rem',fontFamily:'DM Sans',fontSize:'.8rem' }}>
                {isDark?<Sun size={14}/>:<Moon size={14}/>} {isDark?'Light':'Dark'}
              </button>
            </div>
          </div>
          <div style={{ height:'1px',background:t.navBorder,margin:'0 .6rem' }}/>
          <div style={{ padding:'.6rem' }}>
            <button onClick={handleSignOut} className="nv-out"
              style={{ display:'flex',alignItems:'center',gap:'.7rem',padding:'.72rem 1rem',borderRadius:'8px',fontFamily:'DM Sans',fontSize:'.88rem',color:t.textSub,background:'transparent',border:'none',cursor:'pointer',width:'100%' }}>
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        </div>
      </nav>
      <div style={{ height:'62px' }}/>
      <AnnouncementBanner/>
    </>
  )
}