import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [activeTab, setActiveTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, w, h, nodes = []
    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      nodes = Array.from({ length: 50 }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      }))
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,212,255,0.5)'
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    resize(); draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  const handleAuth = async () => {
    setLoading(true); setMsg({ text: '', type: '' })
    if (activeTab === 'register') {
      if (!form.name || !form.email || !form.password) {
        setMsg({ text: 'All fields required', type: 'error' }); setLoading(false); return
      }
      const { error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.name } }
      })
      if (error) setMsg({ text: error.message, type: 'error' })
      else setMsg({ text: 'Account created! Check your email to confirm.', type: 'success' })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) setMsg({ text: error.message, type: 'error' })
      else navigate('/dashboard')
    }
    setLoading(false)
  }

  const plans = [
    { name: 'Starter', roi: '5%', duration: '7 days', min: '$50', color: '#00d4ff' },
    { name: 'Growth', roi: '10%', duration: '14 days', min: '$500', color: '#00ff88', featured: true },
    { name: 'Premium', roi: '20%', duration: '30 days', min: '$2,000', color: '#f59e0b' },
    { name: 'Elite', roi: '35%', duration: '60 days', min: '$10,000', color: '#8b5cf6' },
  ]

  const steps = [
    { n: '01', title: 'Create Account', desc: "Sign up in seconds. Verify your identity and you're ready to go." },
    { n: '02', title: 'Deposit Crypto', desc: 'Fund your account with BTC, ETH, USDT and more. Instant confirmation.' },
    { n: '03', title: 'Choose a Plan', desc: 'Select an ROI plan that matches your goals. Our AI handles everything else.' },
    { n: '04', title: 'Earn & Withdraw', desc: 'Watch your earnings grow. Withdraw anytime once your plan matures.' },
  ]

  const testimonials = [
    { name: 'Marcus O.', location: 'Lagos, NG', text: 'Returns have been consistent every single cycle. The bot genuinely works.', roi: '+18%' },
    { name: 'Priya K.', location: 'London, UK', text: 'Set it and forget it. Earnings were credited exactly on time.', roi: '+10%' },
    { name: 'David M.', location: 'Accra, GH', text: 'Smooth platform, responsive support. Already on my third cycle.', roi: '+35%' },
  ]

  const G = 'linear-gradient(90deg,#00d4ff,#00ff88)'
  const gradText = { background: G, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
  const tag = { display: 'inline-block', color: '#00d4ff', fontFamily: 'DM Sans', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#00d4ff11', padding: '0.28rem 0.75rem', borderRadius: '4px', marginBottom: '1rem' }
  const secTitle = { color: '#f1f5f9', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem' }

  return (
    <div style={{ background: '#020817', minHeight: '100vh', fontFamily: "'Syne',sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{overflow-x:hidden}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#020817}
        ::-webkit-scrollbar-thumb{background:#00d4ff33;border-radius:2px}
        .nl{color:#94a3b8;text-decoration:none;font-size:.9rem;font-family:'DM Sans',sans-serif;transition:color .2s}
        .nl:hover{color:#00d4ff}
        .gb{position:relative;overflow:hidden}
        .gb::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(0,212,255,.3),transparent 70%);opacity:0;transition:opacity .3s}
        .gb:hover::before{opacity:1}
        .pc{transition:transform .3s}
        .pc:hover{transform:translateY(-5px)}
        .sc{transition:border-color .3s}
        .sc:hover{border-color:#00d4ff44!important}
        .fi{animation:fadeUp .7s ease both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        .tk{animation:ticker 22s linear infinite}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .pulse{animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .rot{animation:rot 8s linear infinite}
        .rot2{animation:rot 12s linear infinite reverse}
        @keyframes rot{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .ai{border:none;outline:none}
        .ai:focus{border-color:#00d4ff66!important;outline:none}

        /* RESPONSIVE */
        @media(max-width:960px){
          .hgrid{grid-template-columns:1fr!important}
          .botcard{display:none!important}
          .agrid{grid-template-columns:1fr!important}
          .aorb{display:none!important}
          .authgrid{grid-template-columns:1fr!important}
          .authleft{display:none!important}
        }
        @media(max-width:768px){
          .dnav{display:none!important}
          .hmb{display:flex!important}
          .htitle{font-size:2.1rem!important;line-height:1.15!important}
          .stitle{font-size:1.75rem!important}
          .sgrid{grid-template-columns:1fr 1fr!important}
          .pgrid{grid-template-columns:1fr 1fr!important}
          .stepgrid{grid-template-columns:1fr 1fr!important}
          .tgrid{grid-template-columns:1fr!important}
          .spads{padding:3.5rem 0!important}
          .hctas{flex-direction:column!important;align-items:stretch!important}
          .hcta{text-align:center!important}
          .trust{flex-wrap:wrap!important;gap:.6rem!important}
          .fi{padding:0 1rem}
          .footer-row{flex-direction:column!important;text-align:center!important;gap:.8rem!important}
          .footer-links{justify-content:center!important}
          .sin{padding:0 1.2rem!important}
        }
        @media(max-width:480px){
          .htitle{font-size:1.75rem!important}
          .pgrid{grid-template-columns:1fr!important}
          .stepgrid{grid-template-columns:1fr!important}
          .authcard{padding:1.4rem!important}
          .sin{padding:0 1rem!important}
          .sgrid{grid-template-columns:1fr 1fr!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(2,8,23,.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #0f2040' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '62px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '.9rem', color: '#020817' }}>₿</div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '1rem', letterSpacing: '-.02em' }}>CryptoVest</span>
          </div>
          <div className="dnav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {[['#how-it-works', 'How It Works'], ['#plans', 'Plans'], ['#about', 'About'], ['#testimonials', 'Reviews']].map(([h, l]) => (
              <a key={h} href={h} className="nl">{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '.7rem', alignItems: 'center' }}>
            <a href="#auth" className="nl dnav" style={{ display: 'flex' }}>Login</a>
            <a href="#auth" onClick={() => setActiveTab('register')} className="gb"
              style={{ background: 'linear-gradient(135deg,#00d4ff22,#00ff8822)', border: '1px solid #00d4ff44', color: '#00d4ff', padding: '.44rem 1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '.84rem', fontFamily: 'DM Sans', fontWeight: '500' }}>
              Get Started
            </a>
            <button className="hmb" onClick={() => setMobileNavOpen(o => !o)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', flexDirection: 'column', gap: '4px', padding: '4px' }}>
              {mobileNavOpen
                ? <span style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1 }}>✕</span>
                : [0, 1, 2].map(i => <div key={i} style={{ width: '20px', height: '2px', background: '#94a3b8', borderRadius: '2px' }} />)}
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div style={{ background: '#020c1b', borderTop: '1px solid #0f2040', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
            {[['#how-it-works', 'How It Works'], ['#plans', 'Plans'], ['#about', 'About'], ['#testimonials', 'Reviews']].map(([h, l]) => (
              <a key={h} href={h} onClick={() => setMobileNavOpen(false)}
                style={{ color: '#94a3b8', textDecoration: 'none', padding: '.75rem 0', fontFamily: 'DM Sans', fontSize: '.92rem', borderBottom: '1px solid #0f2040' }}>{l}</a>
            ))}
            <div style={{ display: 'flex', gap: '.8rem', marginTop: '.8rem' }}>
              <a href="#auth" onClick={() => { setActiveTab('login'); setMobileNavOpen(false) }}
                style={{ flex: 1, textAlign: 'center', padding: '.7rem', border: '1px solid #1e3a5f', borderRadius: '8px', color: '#94a3b8', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.88rem' }}>Login</a>
              <a href="#auth" onClick={() => { setActiveTab('register'); setMobileNavOpen(false) }}
                style={{ flex: 1, textAlign: 'center', padding: '.7rem', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', borderRadius: '8px', color: '#020817', textDecoration: 'none', fontFamily: 'DM Sans', fontWeight: '700', fontSize: '.88rem' }}>Register</a>
            </div>
          </div>
        )}
      </nav>

      {/* TICKER */}
      <div style={{ marginTop: '62px', background: '#020c1b', borderBottom: '1px solid #0f2040', padding: '.52rem 0', overflow: 'hidden' }}>
        <div className="tk" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...Array(2)].map((_, r) =>
            ['BTC $67,420 ▲2.4%', 'ETH $3,210 ▲1.8%', 'BNB $412 ▲0.9%', 'USDT $1.00', 'SOL $178 ▲3.2%', 'XRP $0.62 ▲1.1%', 'ADA $0.58 ▼0.4%'].map((t, i) => (
              <span key={`${r}${i}`} style={{ color: '#00d4ff', fontFamily: 'DM Sans', fontSize: '.78rem', marginRight: '2.5rem' }}>{t}</span>
            ))
          )}
        </div>
      </div>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%,#00d4ff08,transparent 60%),radial-gradient(ellipse at 20% 80%,#00ff8806,transparent 50%)' }} />
        <div className="sin" style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', width: '100%' }}>
          <div className="hgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '4rem', alignItems: 'center' }}>
            <div className="fi">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: '#00d4ff11', border: '1px solid #00d4ff33', color: '#00d4ff', padding: '.34rem .9rem', borderRadius: '99px', fontSize: '.78rem', fontFamily: 'DM Sans', marginBottom: '1.4rem' }}>
                <span className="pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00d4ff', display: 'inline-block' }} />
                AI Trading Bot — Live 24/7
              </div>
              <h1 className="htitle" style={{ fontSize: '3.5rem', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.1, letterSpacing: '-.03em', marginBottom: '1.1rem' }}>
                Your Money.<br />
                <span style={gradText}>Working While</span><br />
                You Sleep.
              </h1>
              <p style={{ color: '#64748b', fontFamily: 'DM Sans', fontSize: '1rem', lineHeight: 1.75, maxWidth: '460px', marginBottom: '1.8rem' }}>
                CryptoVest's AI engine analyzes thousands of market signals per second — so you don't have to. Deposit, choose a plan, and let the bot do the rest.
              </p>
              <div className="hctas" style={{ display: 'flex', gap: '1rem', marginBottom: '1.4rem' }}>
                <a href="#auth" onClick={() => setActiveTab('register')} className="gb hcta"
                  style={{ background: 'linear-gradient(135deg,#00d4ff,#00ff88)', color: '#020817', padding: '.82rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '.94rem' }}>
                  Start Earning →
                </a>
                <a href="#how-it-works" className="hcta"
                  style={{ border: '1px solid #1e3a5f', color: '#94a3b8', padding: '.82rem 2rem', borderRadius: '10px', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.94rem' }}>
                  How It Works
                </a>
              </div>
              <div className="trust" style={{ display: 'flex', gap: '1.4rem' }}>
                {['🔒 Bank-grade Security', '⚡ Instant Deposits', '🤖 AI-Powered'].map((t, i) => (
                  <span key={i} style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.8rem' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Bot card — hidden on mobile */}
            <div className="botcard">
              <div style={{ background: 'rgba(3,14,31,.92)', border: '1px solid #0f2a4a', borderRadius: '16px', padding: '1.4rem', backdropFilter: 'blur(20px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <span className="pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} />
                    <span style={{ color: '#00d4ff', fontSize: '.8rem', fontFamily: 'DM Sans' }}>AI Engine Active</span>
                  </div>
                  <span style={{ color: '#475569', fontSize: '.72rem', fontFamily: 'DM Sans' }}>LIVE</span>
                </div>
                <svg viewBox="0 0 300 90" style={{ width: '100%', marginBottom: '.9rem' }}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,75 L35,65 L70,58 L100,44 L130,50 L160,30 L190,24 L220,14 L250,20 L280,8 L300,3" fill="none" stroke="#00d4ff" strokeWidth="2" />
                  <path d="M0,75 L35,65 L70,58 L100,44 L130,50 L160,30 L190,24 L220,14 L250,20 L280,8 L300,3 L300,90 L0,90Z" fill="url(#cg)" />
                </svg>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '.4rem', marginBottom: '.9rem' }}>
                  {[['1,247', "Today's Trades"], ['94.2%', 'Win Rate'], ['2,400', 'Active Users']].map(([v, l], i) => (
                    <div key={i} style={{ background: '#020c1b', borderRadius: '7px', padding: '.6rem', textAlign: 'center' }}>
                      <span style={{ display: 'block', color: '#00d4ff', fontWeight: '700', fontSize: '.92rem' }}>{v}</span>
                      <span style={{ display: 'block', color: '#475569', fontFamily: 'DM Sans', fontSize: '.68rem', marginTop: '.15rem' }}>{l}</span>
                    </div>
                  ))}
                </div>
                {[['BTC/USDT', 'BUY', '+$124', '2s'], ['ETH/USDT', 'SELL', '+$67', '8s'], ['SOL/USDT', 'BUY', '+$43', '15s']].map(([p, a, pr, t], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020c1b', padding: '.55rem .8rem', borderRadius: '6px', marginBottom: '.35rem' }}>
                    <span style={{ color: '#cbd5e1', fontSize: '.8rem', fontFamily: 'DM Sans' }}>{p}</span>
                    <span style={{ padding: '.18rem .45rem', borderRadius: '4px', fontSize: '.7rem', fontWeight: '600', fontFamily: 'DM Sans', background: a === 'BUY' ? '#00ff8822' : '#ef444422', color: a === 'BUY' ? '#00ff88' : '#ef4444' }}>{a}</span>
                    <span style={{ color: '#00ff88', fontSize: '.8rem', fontFamily: 'DM Sans', fontWeight: '600' }}>{pr}</span>
                    <span style={{ color: '#475569', fontSize: '.72rem', fontFamily: 'DM Sans' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#020c1b', borderTop: '1px solid #0f2040', borderBottom: '1px solid #0f2040', padding: '2.8rem 0' }}>
        <div className="sin" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="sgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {[['2,400+', 'Active Investors', '👥'], ['$4.2M+', 'Volume Traded', '📈'], ['99.9%', 'Platform Uptime', '⚡'], ['35%', 'Max ROI/Cycle', '💰']].map(([v, l, ic], i) => (
              <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '.3rem' }}>{ic}</div>
                <div style={{ color: '#f1f5f9', fontSize: '1.7rem', fontWeight: '800', letterSpacing: '-.03em' }}>{v}</div>
                <div style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.8rem', marginTop: '.25rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="spads" style={{ padding: '6rem 0', background: '#020817' }}>
        <div className="sin" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="agrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
            <div>
              <div style={tag}>The Technology</div>
              <h2 className="stitle" style={{ ...secTitle, fontSize: '2.1rem' }}>
                Not Your Average<br />
                <span style={gradText}>Investment Platform</span>
              </h2>
              <p style={{ color: '#64748b', fontFamily: 'DM Sans', fontSize: '.9rem', lineHeight: 1.8, marginBottom: '1rem' }}>
                Most platforms ask you to trade yourself — study charts, time the market, manage risk. We believe that's the wrong approach.
              </p>
              <p style={{ color: '#64748b', fontFamily: 'DM Sans', fontSize: '.9rem', lineHeight: 1.8, marginBottom: '1.4rem' }}>
                CryptoVest's AI runs 24/7, executing hundreds of trades across major pairs — reading sentiment, technical patterns, and on-chain data simultaneously. You invest and collect.
              </p>
              {['Sentiment analysis across 50+ data sources', 'Automated risk management & stop-loss', 'Real-time rebalancing across crypto pairs', 'Zero manual effort required from you'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.65rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00d4ff', flexShrink: 0 }} />
                  <span style={{ color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '.88rem' }}>{f}</span>
                </div>
              ))}
            </div>
            {/* AI orb — hidden on mobile */}
            <div className="aorb" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '260px', height: '260px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="rot" style={{ position: 'absolute', inset: '10px', border: '1px dashed #00d4ff33', borderRadius: '50%' }} />
                <div className="rot2" style={{ position: 'absolute', inset: '38px', border: '1px dashed #00ff8822', borderRadius: '50%' }} />
                <div style={{ width: '100px', height: '100px', background: 'radial-gradient(circle,#00d4ff22,#020817)', border: '1px solid #00d4ff44', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                  <span style={{ color: '#00d4ff', fontSize: '1.5rem', fontWeight: '800' }}>AI</span>
                  <span style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.72rem' }}>Engine</span>
                </div>
                {[['Sentiment', { top: '4%', left: '50%' }], ['On-chain', { top: '50%', left: '2%' }], ['Technical', { top: '92%', left: '50%' }], ['Volume', { top: '50%', left: '82%' }]].map(([l, pos], i) => (
                  <div key={i} style={{ position: 'absolute', ...pos, transform: 'translate(-50%,-50%)', background: '#020c1b', border: '1px solid #0f2a4a', color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '.7rem', padding: '.22rem .55rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>{l}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="spads" style={{ padding: '6rem 0', background: '#020c1b' }}>
        <div className="sin" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={tag}>Simple Process</div>
            <h2 className="stitle" style={{ ...secTitle, fontSize: '2.1rem' }}>
              Four Steps to <span style={gradText}>Passive Income</span>
            </h2>
          </div>
          <div className="stepgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.1rem' }}>
            {steps.map((st, i) => (
              <div key={i} className="sc" style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ color: '#00d4ff', fontSize: '1.7rem', fontWeight: '800', marginBottom: '.7rem', opacity: .5 }}>{st.n}</div>
                <h3 style={{ color: '#f1f5f9', fontSize: '.92rem', fontWeight: '700', marginBottom: '.45rem' }}>{st.title}</h3>
                <p style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.82rem', lineHeight: 1.7 }}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="spads" style={{ padding: '6rem 0', background: '#020817' }}>
        <div className="sin" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={tag}>Investment Plans</div>
            <h2 className="stitle" style={{ ...secTitle, fontSize: '2.1rem' }}>
              Choose Your <span style={gradText}>Growth Path</span>
            </h2>
          </div>
          <div className="pgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.1rem' }}>
            {plans.map((plan, i) => (
              <div key={i} className="pc" style={{ background: plan.featured ? '#020c1b' : '#030e1f', border: `1px solid ${plan.featured ? plan.color + '55' : '#0f2040'}`, borderRadius: '14px', padding: '1.5rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '.45rem', boxShadow: plan.featured ? `0 0 36px ${plan.color}15` : 'none' }}>
                {plan.featured && <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#00d4ff,#00ff88)', color: '#020817', fontSize: '.68rem', fontWeight: '700', padding: '.2rem .75rem', borderRadius: '99px', whiteSpace: 'nowrap' }}>Most Popular</div>}
                <div style={{ color: plan.color, fontSize: '2rem', fontWeight: '800', letterSpacing: '-.03em' }}>{plan.roi}</div>
                <div style={{ color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '.86rem', marginBottom: '.2rem' }}>{plan.name}</div>
                <div style={{ height: '1px', background: '#0f2040', margin: '.2rem 0' }} />
                {[['Duration', plan.duration, false], ['Min. Deposit', plan.min, false], ['Capital Return', '✓ Included', true]].map(([l, v, green], j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.78rem' }}>{l}</span>
                    <span style={{ color: green ? '#00ff88' : '#cbd5e1', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: '500' }}>{v}</span>
                  </div>
                ))}
                <a href="#auth" onClick={() => setActiveTab('register')}
                  style={{ marginTop: '.7rem', display: 'block', textAlign: 'center', border: `1px solid ${plan.color}44`, borderRadius: '8px', padding: '.62rem', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: '600', color: plan.color }}>
                  Start with {plan.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="spads" style={{ padding: '6rem 0', background: '#020c1b' }}>
        <div className="sin" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={tag}>Investor Reviews</div>
            <h2 className="stitle" style={{ ...secTitle, fontSize: '2.1rem' }}>
              Real People. <span style={gradText}>Real Returns.</span>
            </h2>
          </div>
          <div className="tgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.1rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: '#030e1f', border: '1px solid #0f2040', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ color: '#00ff88', fontWeight: '700', fontSize: '1.05rem', marginBottom: '.7rem' }}>{t.roi} ROI</div>
                <p style={{ color: '#64748b', fontFamily: 'DM Sans', fontSize: '.86rem', lineHeight: 1.8, marginBottom: '1.1rem' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff22,#00ff8822)', border: '1px solid #00d4ff44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: '700', fontSize: '.85rem', flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '.83rem', fontWeight: '500' }}>{t.name}</div>
                    <div style={{ color: '#475569', fontFamily: 'DM Sans', fontSize: '.76rem' }}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTH */}
      <section id="auth" className="spads" style={{ padding: '6rem 0', background: '#020817' }}>
        <div className="sin" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
          <div className="authgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 410px', gap: '5rem', alignItems: 'center' }}>

            {/* Left — hidden on mobile */}
            <div className="authleft">
              <div style={tag}>Join CryptoVest</div>
              <h2 className="stitle" style={{ ...secTitle, fontSize: '2.1rem' }}>
                Start Earning<br /><span style={gradText}>In Minutes</span>
              </h2>
              <p style={{ color: '#64748b', fontFamily: 'DM Sans', fontSize: '.9rem', lineHeight: 1.8, marginBottom: '1.4rem' }}>
                Create your account, deposit crypto, pick a plan. The AI takes it from there. No trading knowledge needed.
              </p>
              {['No trading experience needed', 'Capital returned after plan completes', 'Withdraw earnings anytime', 'KYC verified & secure'].map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'center', marginBottom: '.65rem' }}>
                  <span style={{ color: '#00d4ff', fontWeight: '700' }}>✓</span>
                  <span style={{ color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '.88rem' }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Auth card */}
            <div className="authcard" style={{ background: '#030e1f', border: '1px solid #0f2a4a', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '.85rem', width: '100%' }}>
              {/* Mobile heading */}
              <div style={{ display: 'none' }} className="mobile-auth-heading">
                <h2 style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '1.4rem', marginBottom: '.3rem' }}>
                  {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p style={{ color: '#64748b', fontFamily: 'DM Sans', fontSize: '.85rem' }}>
                  {activeTab === 'login' ? 'Login to your investment account' : 'Start earning with AI trading'}
                </p>
              </div>
              <div style={{ display: 'flex', background: '#020c1b', borderRadius: '8px', padding: '4px' }}>
                {['login', 'register'].map(tab => (
                  <button key={tab} onClick={() => { setActiveTab(tab); setMsg({ text: '', type: '' }) }}
                    style={{ flex: 1, padding: '.58rem', border: 'none', background: activeTab === tab ? '#0f2a4a' : 'transparent', color: activeTab === tab ? '#00d4ff' : '#475569', fontFamily: 'Syne', fontWeight: '600', fontSize: '.86rem', cursor: 'pointer', borderRadius: '6px', transition: 'all .2s' }}>
                    {tab === 'login' ? 'Login' : 'Register'}
                  </button>
                ))}
              </div>
              {activeTab === 'register' && (
                <input className="ai" style={{ width: '100%', padding: '.82rem 1rem', background: '#020c1b', border: '1px solid #0f2a4a', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '.88rem' }}
                  placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              )}
              <input className="ai" style={{ width: '100%', padding: '.82rem 1rem', background: '#020c1b', border: '1px solid #0f2a4a', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '.88rem' }}
                type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="ai" style={{ width: '100%', padding: '.82rem 1rem', background: '#020c1b', border: '1px solid #0f2a4a', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '.88rem' }}
                type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              {msg.text && (
                <div style={{ padding: '.72rem 1rem', borderRadius: '8px', border: '1px solid', background: msg.type === 'error' ? '#ef444422' : '#00ff8822', borderColor: msg.type === 'error' ? '#ef444444' : '#00ff8844', color: msg.type === 'error' ? '#ef4444' : '#00ff88', fontFamily: 'DM Sans', fontSize: '.83rem' }}>
                  {msg.text}
                </div>
              )}
              <button onClick={handleAuth} disabled={loading} className="gb"
                style={{ width: '100%', padding: '.88rem', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', color: '#020817', border: 'none', borderRadius: '10px', fontFamily: 'Syne', fontWeight: '700', fontSize: '.93rem', cursor: 'pointer', opacity: loading ? .7 : 1 }}>
                {loading ? 'Please wait...' : activeTab === 'login' ? 'Login to Dashboard' : 'Create Free Account'}
              </button>
              <p style={{ textAlign: 'center', color: '#475569', fontFamily: 'DM Sans', fontSize: '.83rem', margin: 0 }}>
                {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <span onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); setMsg({ text: '', type: '' }) }}
                  style={{ color: '#00d4ff', cursor: 'pointer' }}>
                  {activeTab === 'login' ? 'Register' : 'Login'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#020c1b', borderTop: '1px solid #0f2040', padding: '1.6rem 0' }}>
        <div className="footer-row sin" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem' }}>
            <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '.8rem', color: '#020817' }}>₿</div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '.92rem' }}>CryptoVest</span>
          </div>
          <p style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.73rem', textAlign: 'center', flex: 1, minWidth: '180px' }}>
            © 2025 CryptoVest. All rights reserved. Crypto investments carry risk.
          </p>
          <div className="footer-links" style={{ display: 'flex', gap: '1.4rem' }}>
            {['Privacy', 'Terms', 'Support'].map(l => (
              <a key={l} href="#" style={{ color: '#334155', fontFamily: 'DM Sans', fontSize: '.78rem', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* Mobile auth heading show */}
      <style>{`
        @media(max-width:960px){
          .mobile-auth-heading{display:block!important}
          .authcard{max-width:460px;margin:0 auto}
        }
      `}</style>
    </div>
  )
}