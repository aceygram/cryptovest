import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [stats, setStats] = useState({ users: '2,400+', volume: '$4.2M+', uptime: '99.9%', roi: '35%' })
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user])

  // Animated grid canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w, h, nodes = [], edges = []

    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      nodes = Array.from({ length: 60 }, () => ({
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
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)'
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()
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
    { n: '01', title: 'Create Account', desc: 'Sign up in seconds. Verify your identity and you\'re ready to go.' },
    { n: '02', title: 'Deposit Crypto', desc: 'Fund your account with BTC, ETH, USDT and more. Instant confirmation.' },
    { n: '03', title: 'Choose a Plan', desc: 'Select an ROI plan that matches your goals. Our AI handles everything else.' },
    { n: '04', title: 'Earn & Withdraw', desc: 'Watch your earnings grow. Withdraw anytime once your plan matures.' },
  ]

  const testimonials = [
    { name: 'Marcus O.', location: 'Lagos, NG', text: 'I was skeptical at first but the returns have been consistent every single cycle. The bot genuinely works.', roi: '+18%' },
    { name: 'Priya K.', location: 'London, UK', text: 'Set it and forget it. I deposited, chose the Growth plan and my earnings were credited exactly on time.', roi: '+10%' },
    { name: 'David M.', location: 'Accra, GH', text: 'Customer support is responsive and the platform is smooth. Already on my third investment cycle.', roi: '+35%' },
  ]

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #020817; }
        ::-webkit-scrollbar-thumb { background: #00d4ff33; border-radius: 2px; }
        .nav-link { color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-family: 'DM Sans', sans-serif; transition: color 0.2s; }
        .nav-link:hover { color: #00d4ff; }
        .glow-btn { position: relative; overflow: hidden; }
        .glow-btn::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(0,212,255,0.3), transparent 70%); opacity: 0; transition: opacity 0.3s; }
        .glow-btn:hover::before { opacity: 1; }
        .plan-card { transition: transform 0.3s, box-shadow 0.3s; }
        .plan-card:hover { transform: translateY(-6px); }
        .step-card { transition: border-color 0.3s; }
        .step-card:hover { border-color: #00d4ff44 !important; }
        .fade-in { animation: fadeUp 0.7s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .ticker { animation: ticker 20s linear infinite; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .rotate { animation: rotate 8s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .testi-grid { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .hero-title { font-size: 2.6rem !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoMark}>₿</div>
            <span style={s.logoText}>CryptoVest</span>
          </div>
          <div className="nav-links" style={s.navLinks}>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#plans" className="nav-link">Plans</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <a href="#auth" style={s.navLoginBtn} className="nav-link">Login</a>
            <a href="#auth" style={s.navRegisterBtn} className="glow-btn" onClick={() => setActiveTab('register')}>
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* TICKER */}
      <div style={s.ticker}>
        <div className="ticker" style={s.tickerInner}>
          {['BTC $67,420 ▲2.4%', 'ETH $3,210 ▲1.8%', 'BNB $412 ▲0.9%', 'USDT $1.00', 'SOL $178 ▲3.2%', 'XRP $0.62 ▲1.1%', 'ADA $0.58 ▼0.4%', 'MATIC $0.91 ▲2.1%',
            'BTC $67,420 ▲2.4%', 'ETH $3,210 ▲1.8%', 'BNB $412 ▲0.9%', 'USDT $1.00', 'SOL $178 ▲3.2%', 'XRP $0.62 ▲1.1%', 'ADA $0.58 ▼0.4%', 'MATIC $0.91 ▲2.1%'].map((t, i) => (
            <span key={i} style={s.tickerItem}>{t}</span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section style={s.hero}>
        <canvas ref={canvasRef} style={s.canvas} />
        <div style={s.heroOverlay} />
        <div style={s.heroInner}>
          <div className="hero-grid" style={s.heroGrid}>
            <div style={s.heroLeft} className="fade-in">
              <div style={s.heroBadge}>
                <span style={s.heroBadgeDot} className="pulse" />
                AI Trading Bot — Live 24/7
              </div>
              <h1 className="hero-title" style={s.heroTitle}>
                Your Money.<br />
                <span style={s.heroAccent}>Working While</span><br />
                You Sleep.
              </h1>
              <p style={s.heroSub}>
                CryptoVest's proprietary AI trading engine analyzes thousands of market signals per second — so you don't have to. Deposit, choose a plan, and let the bot do the rest.
              </p>
              <div style={s.heroCtas}>
                <a href="#auth" style={s.heroCtaPrimary} className="glow-btn" onClick={() => setActiveTab('register')}>
                  Start Earning →
                </a>
                <a href="#how-it-works" style={s.heroCtaSecondary}>
                  See How It Works
                </a>
              </div>
              <div style={s.heroTrust}>
                <span style={s.trustItem}>🔒 Bank-grade Security</span>
                <span style={s.trustItem}>⚡ Instant Deposits</span>
                <span style={s.trustItem}>🤖 AI-Powered</span>
              </div>
            </div>

            {/* Bot visualization */}
            <div style={s.heroRight}>
              <div style={s.botCard}>
                <div style={s.botHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={s.botDot} className="pulse" />
                    <span style={{ color: '#00d4ff', fontSize: '0.82rem', fontFamily: 'DM Sans' }}>AI Engine Active</span>
                  </div>
                  <span style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'DM Sans' }}>LIVE</span>
                </div>
                <div style={s.botChart}>
                  <svg viewBox="0 0 300 100" style={{ width: '100%' }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,80 L30,70 L60,65 L90,50 L120,55 L150,35 L180,30 L210,20 L240,25 L270,10 L300,5" fill="none" stroke="#00d4ff" strokeWidth="2" />
                    <path d="M0,80 L30,70 L60,65 L90,50 L120,55 L150,35 L180,30 L210,20 L240,25 L270,10 L300,5 L300,100 L0,100Z" fill="url(#chartGrad)" />
                  </svg>
                </div>
                <div style={s.botStats}>
                  {[
                    { label: 'Today\'s Trades', value: '1,247' },
                    { label: 'Win Rate', value: '94.2%' },
                    { label: 'Active Users', value: '2,400' },
                  ].map((st, i) => (
                    <div key={i} style={s.botStat}>
                      <span style={s.botStatVal}>{st.value}</span>
                      <span style={s.botStatLabel}>{st.label}</span>
                    </div>
                  ))}
                </div>
                <div style={s.botTrades}>
                  {[
                    { pair: 'BTC/USDT', action: 'BUY', profit: '+$124', time: '2s ago' },
                    { pair: 'ETH/USDT', action: 'SELL', profit: '+$67', time: '8s ago' },
                    { pair: 'SOL/USDT', action: 'BUY', profit: '+$43', time: '15s ago' },
                  ].map((tr, i) => (
                    <div key={i} style={s.tradeRow}>
                      <span style={{ color: '#cbd5e1', fontSize: '0.82rem', fontFamily: 'DM Sans' }}>{tr.pair}</span>
                      <span style={{ ...s.tradeAction, background: tr.action === 'BUY' ? '#00ff8822' : '#ef444422', color: tr.action === 'BUY' ? '#00ff88' : '#ef4444' }}>
                        {tr.action}
                      </span>
                      <span style={{ color: '#00ff88', fontSize: '0.82rem', fontFamily: 'DM Sans', fontWeight: '600' }}>{tr.profit}</span>
                      <span style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'DM Sans' }}>{tr.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={s.statsSection}>
        <div style={s.sectionInner}>
          <div className="stats-grid" style={s.statsGrid}>
            {[
              { value: '2,400+', label: 'Active Investors', icon: '👥' },
              { value: '$4.2M+', label: 'Total Volume Traded', icon: '📈' },
              { value: '99.9%', label: 'Platform Uptime', icon: '⚡' },
              { value: '35%', label: 'Max ROI Per Cycle', icon: '💰' },
            ].map((st, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statIcon}>{st.icon}</div>
                <div style={s.statValue}>{st.value}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT / AI SECTION */}
      <section id="about" style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.aboutGrid}>
            <div style={s.aboutLeft}>
              <div style={s.sectionTag}>The Technology</div>
              <h2 style={s.sectionTitle}>Not Your Average<br /><span style={s.accent}>Investment Platform</span></h2>
              <p style={s.sectionBody}>
                Most investment platforms ask you to trade yourself — study charts, time the market, manage risk. We believe that's the wrong approach for most people.
              </p>
              <p style={s.sectionBody}>
                CryptoVest's AI engine runs 24 hours a day, 7 days a week, executing hundreds of trades across major crypto pairs. It reads market sentiment, technical patterns, and on-chain data simultaneously — and acts in milliseconds. You simply invest, and collect.
              </p>
              <div style={s.featureList}>
                {[
                  'Sentiment analysis across 50+ data sources',
                  'Automated risk management and stop-loss',
                  'Real-time rebalancing across crypto pairs',
                  'Zero manual effort required from you',
                ].map((f, i) => (
                  <div key={i} style={s.featureItem}>
                    <div style={s.featureDot} />
                    <span style={{ color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '0.92rem' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.aboutRight}>
              <div style={s.glowBox}>
                <div style={s.glowBoxInner}>
                  <div className="rotate" style={s.orbiter} />
                  <div style={s.glowCenter}>
                    <div style={s.glowCenterText}>AI</div>
                    <div style={s.glowCenterSub}>Engine</div>
                  </div>
                  {['Sentiment', 'On-chain', 'Technical', 'Volume'].map((label, i) => (
                    <div key={i} style={{
                      ...s.orbitLabel,
                      top: i === 0 ? '5%' : i === 1 ? '50%' : i === 2 ? '85%' : '50%',
                      left: i === 0 ? '50%' : i === 1 ? '5%' : i === 2 ? '50%' : '85%',
                      transform: 'translate(-50%, -50%)'
                    }}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ ...s.section, background: '#020c1b' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={s.sectionTag}>Simple Process</div>
            <h2 style={s.sectionTitle}>Four Steps to <span style={s.accent}>Passive Income</span></h2>
            <p style={{ ...s.sectionBody, maxWidth: '520px', margin: '1rem auto 0' }}>
              We removed every unnecessary step. Going from zero to earning takes less than 5 minutes.
            </p>
          </div>
          <div className="steps-grid" style={s.stepsGrid}>
            {steps.map((st, i) => (
              <div key={i} className="step-card" style={s.stepCard}>
                <div style={s.stepNumber}>{st.n}</div>
                <h3 style={s.stepTitle}>{st.title}</h3>
                <p style={s.stepDesc}>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" style={s.section}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={s.sectionTag}>Investment Plans</div>
            <h2 style={s.sectionTitle}>Choose Your <span style={s.accent}>Growth Path</span></h2>
            <p style={{ ...s.sectionBody, maxWidth: '480px', margin: '1rem auto 0' }}>
              Every plan runs on the same AI engine. Higher tiers unlock better allocation and priority execution.
            </p>
          </div>
          <div className="plans-grid" style={s.plansGrid}>
            {plans.map((plan, i) => (
              <div key={i} className="plan-card" style={{
                ...s.planCard,
                border: plan.featured ? `1px solid ${plan.color}66` : '1px solid #0f2040',
                background: plan.featured ? '#020c1b' : '#030e1f',
                boxShadow: plan.featured ? `0 0 40px ${plan.color}22` : 'none'
              }}>
                {plan.featured && <div style={s.planBadge}>Most Popular</div>}
                <div style={{ ...s.planRoi, color: plan.color }}>{plan.roi}</div>
                <div style={s.planName}>{plan.name}</div>
                <div style={s.planDivider} />
                <div style={s.planDetail}>
                  <span style={s.planDetailLabel}>Duration</span>
                  <span style={s.planDetailVal}>{plan.duration}</span>
                </div>
                <div style={s.planDetail}>
                  <span style={s.planDetailLabel}>Min. Deposit</span>
                  <span style={s.planDetailVal}>{plan.min}</span>
                </div>
                <div style={s.planDetail}>
                  <span style={s.planDetailLabel}>Capital Return</span>
                  <span style={{ ...s.planDetailVal, color: '#00ff88' }}>✓ Included</span>
                </div>
                <a href="#auth" style={{ ...s.planBtn, borderColor: plan.color + '66', color: plan.color }}
                  onClick={() => setActiveTab('register')}>
                  Start with {plan.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ ...s.section, background: '#020c1b' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={s.sectionTag}>Investor Reviews</div>
            <h2 style={s.sectionTitle}>Real People. <span style={s.accent}>Real Returns.</span></h2>
          </div>
          <div className="testi-grid" style={s.testiGrid}>
            {testimonials.map((t, i) => (
              <div key={i} style={s.testiCard}>
                <div style={s.testiRoi}>{t.roi} ROI</div>
                <p style={s.testiText}>"{t.text}"</p>
                <div style={s.testiAuthor}>
                  <div style={s.testiAvatar}>{t.name[0]}</div>
                  <div>
                    <div style={s.testiName}>{t.name}</div>
                    <div style={s.testiLocation}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTH SECTION */}
      <section id="auth" style={{ ...s.section, background: '#020817' }}>
        <div style={s.sectionInner}>
          <div style={s.authGrid}>
            <div style={s.authLeft}>
              <div style={s.sectionTag}>Join CryptoVest</div>
              <h2 style={s.sectionTitle}>Start Earning<br /><span style={s.accent}>In Minutes</span></h2>
              <p style={s.sectionBody}>
                Create your account, deposit crypto, pick a plan. The AI takes it from there. No trading knowledge needed.
              </p>
              <div style={s.authPerks}>
                {['No trading experience needed', 'Capital returned after plan completes', 'Withdraw earnings anytime', 'KYC verified & secure'].map((p, i) => (
                  <div key={i} style={s.authPerk}>
                    <span style={{ color: '#00d4ff' }}>✓</span>
                    <span style={{ color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '0.9rem' }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.authCard}>
              <div style={s.authTabs}>
                <button style={{ ...s.authTab, ...(activeTab === 'login' ? s.authTabActive : {}) }}
                  onClick={() => { setActiveTab('login'); setMsg({ text: '', type: '' }) }}>
                  Login
                </button>
                <button style={{ ...s.authTab, ...(activeTab === 'register' ? s.authTabActive : {}) }}
                  onClick={() => { setActiveTab('register'); setMsg({ text: '', type: '' }) }}>
                  Register
                </button>
              </div>

              {activeTab === 'register' && (
                <input style={s.authInput} placeholder="Full Name"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              )}
              <input style={s.authInput} placeholder="Email Address" type="email"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input style={s.authInput} placeholder="Password" type="password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

              {msg.text && (
                <div style={{ ...s.authMsg, background: msg.type === 'error' ? '#ef444422' : '#00ff8822', borderColor: msg.type === 'error' ? '#ef444444' : '#00ff8844', color: msg.type === 'error' ? '#ef4444' : '#00ff88' }}>
                  {msg.text}
                </div>
              )}

              <button style={{ ...s.authSubmit, opacity: loading ? 0.7 : 1 }}
                onClick={handleAuth} disabled={loading} className="glow-btn">
                {loading ? 'Please wait...' : activeTab === 'login' ? 'Login to Dashboard' : 'Create Free Account'}
              </button>

              <p style={s.authSwitch}>
                {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <span style={s.authSwitchLink} onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); setMsg({ text: '', type: '' }) }}>
                  {activeTab === 'login' ? 'Register' : 'Login'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.logo}>
            <div style={s.logoMark}>₿</div>
            <span style={s.logoText}>CryptoVest</span>
          </div>
          <p style={s.footerText}>
            © 2025 CryptoVest. All rights reserved. Crypto investments carry risk. Past performance is not indicative of future results.
          </p>
          <div style={s.footerLinks}>
            <a href="#" style={s.footerLink}>Privacy</a>
            <a href="#" style={s.footerLink}>Terms</a>
            <a href="#" style={s.footerLink}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const s = {
  root: { background: '#020817', minHeight: '100vh', fontFamily: "'Syne', sans-serif", overflowX: 'hidden' },

  // Nav
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #0f2040' },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  logoMark: { width: '32px', height: '32px', background: 'linear-gradient(135deg, #00d4ff, #00ff88)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1rem', color: '#020817' },
  logoText: { color: '#fff', fontWeight: '700', fontSize: '1.1rem', letterSpacing: '-0.02em' },
  navLinks: { display: 'flex', gap: '2rem', alignItems: 'center' },
  navLoginBtn: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'DM Sans' },
  navRegisterBtn: { background: 'linear-gradient(135deg, #00d4ff22, #00ff8822)', border: '1px solid #00d4ff44', color: '#00d4ff', padding: '0.5rem 1.2rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.88rem', fontFamily: 'DM Sans', fontWeight: '500' },

  // Ticker
  ticker: { marginTop: '65px', background: '#020c1b', borderBottom: '1px solid #0f2040', padding: '0.6rem 0', overflow: 'hidden' },
  tickerInner: { display: 'flex', whiteSpace: 'nowrap', width: 'max-content' },
  tickerItem: { color: '#00d4ff', fontFamily: 'DM Sans', fontSize: '0.82rem', marginRight: '3rem' },

  // Hero
  hero: { position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' },
  canvas: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, #00d4ff08 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #00ff8806 0%, transparent 50%)' },
  heroInner: { position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', width: '100%' },
  heroGrid: { display: 'grid', gridTemplateColumns: '1fr 480px', gap: '4rem', alignItems: 'center' },
  heroLeft: {},
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#00d4ff11', border: '1px solid #00d4ff33', color: '#00d4ff', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.82rem', fontFamily: 'DM Sans', marginBottom: '1.5rem' },
  heroBadgeDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#00d4ff' },
  heroTitle: { fontSize: '3.8rem', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.2rem' },
  heroAccent: { background: 'linear-gradient(90deg, #00d4ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { color: '#64748b', fontFamily: 'DM Sans', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '480px', marginBottom: '2rem' },
  heroCtas: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  heroCtaPrimary: { background: 'linear-gradient(135deg, #00d4ff, #00ff88)', color: '#020817', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem' },
  heroCtaSecondary: { background: 'transparent', border: '1px solid #1e3a5f', color: '#94a3b8', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '0.95rem' },
  heroTrust: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  trustItem: { color: '#475569', fontFamily: 'DM Sans', fontSize: '0.82rem' },

  // Bot card
  heroRight: {},
  botCard: { background: 'rgba(3,14,31,0.9)', border: '1px solid #0f2a4a', borderRadius: '16px', padding: '1.5rem', backdropFilter: 'blur(20px)' },
  botHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  botDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#00ff88' },
  botChart: { marginBottom: '1rem' },
  botStats: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' },
  botStat: { background: '#020c1b', borderRadius: '8px', padding: '0.7rem', textAlign: 'center' },
  botStatVal: { display: 'block', color: '#00d4ff', fontWeight: '700', fontSize: '1rem' },
  botStatLabel: { display: 'block', color: '#475569', fontFamily: 'DM Sans', fontSize: '0.72rem', marginTop: '0.2rem' },
  botTrades: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  tradeRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#020c1b', padding: '0.6rem 0.8rem', borderRadius: '6px' },
  tradeAction: { padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600', fontFamily: 'DM Sans' },

  // Stats
  statsSection: { background: '#020c1b', borderTop: '1px solid #0f2040', borderBottom: '1px solid #0f2040', padding: '3rem 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' },
  statCard: { textAlign: 'center', padding: '1.5rem' },
  statIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  statValue: { color: '#f1f5f9', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em' },
  statLabel: { color: '#475569', fontFamily: 'DM Sans', fontSize: '0.85rem', marginTop: '0.3rem' },

  // Sections
  section: { padding: '6rem 0', background: '#020817' },
  sectionInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' },
  sectionTag: { display: 'inline-block', color: '#00d4ff', fontFamily: 'DM Sans', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', background: '#00d4ff11', padding: '0.3rem 0.8rem', borderRadius: '4px' },
  sectionTitle: { color: '#f1f5f9', fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '1rem' },
  sectionBody: { color: '#64748b', fontFamily: 'DM Sans', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '1rem' },
  accent: { background: 'linear-gradient(90deg, #00d4ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },

  // About
  aboutGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' },
  aboutLeft: {},
  aboutRight: { display: 'flex', justifyContent: 'center' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  featureDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#00d4ff', flexShrink: 0 },
  glowBox: { width: '300px', height: '300px', position: 'relative' },
  glowBoxInner: { width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  orbiter: { position: 'absolute', inset: '10px', border: '1px dashed #00d4ff33', borderRadius: '50%' },
  glowCenter: { width: '100px', height: '100px', background: 'radial-gradient(circle, #00d4ff22, #020817)', border: '1px solid #00d4ff44', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  glowCenterText: { color: '#00d4ff', fontSize: '1.5rem', fontWeight: '800' },
  glowCenterSub: { color: '#475569', fontFamily: 'DM Sans', fontSize: '0.75rem' },
  orbitLabel: { position: 'absolute', background: '#020c1b', border: '1px solid #0f2a4a', color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '4px' },

  // Steps
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' },
  stepCard: { background: '#030e1f', border: '1px solid #0f2040', borderRadius: '12px', padding: '1.8rem' },
  stepNumber: { color: '#00d4ff', fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', opacity: 0.5 },
  stepTitle: { color: '#f1f5f9', fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem' },
  stepDesc: { color: '#475569', fontFamily: 'DM Sans', fontSize: '0.85rem', lineHeight: 1.7 },

  // Plans
  plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.2rem' },
  planCard: { borderRadius: '14px', padding: '1.8rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  planBadge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg, #00d4ff, #00ff88)', color: '#020817', fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.8rem', borderRadius: '99px', whiteSpace: 'nowrap' },
  planRoi: { fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em' },
  planName: { color: '#94a3b8', fontFamily: 'DM Sans', fontSize: '0.9rem', marginBottom: '0.5rem' },
  planDivider: { height: '1px', background: '#0f2040', margin: '0.5rem 0' },
  planDetail: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  planDetailLabel: { color: '#475569', fontFamily: 'DM Sans', fontSize: '0.82rem' },
  planDetailVal: { color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: '500' },
  planBtn: { marginTop: '1rem', display: 'block', textAlign: 'center', border: '1px solid', borderRadius: '8px', padding: '0.7rem', textDecoration: 'none', fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: '600', transition: 'background 0.2s' },

  // Testimonials
  testiGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' },
  testiCard: { background: '#030e1f', border: '1px solid #0f2040', borderRadius: '12px', padding: '1.8rem' },
  testiRoi: { color: '#00ff88', fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.8rem' },
  testiText: { color: '#64748b', fontFamily: 'DM Sans', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.2rem' },
  testiAuthor: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  testiAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #00d4ff22, #00ff8822)', border: '1px solid #00d4ff44', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00d4ff', fontWeight: '700', fontSize: '0.9rem' },
  testiName: { color: '#cbd5e1', fontFamily: 'DM Sans', fontSize: '0.85rem', fontWeight: '500' },
  testiLocation: { color: '#475569', fontFamily: 'DM Sans', fontSize: '0.78rem' },

  // Auth
  authGrid: { display: 'grid', gridTemplateColumns: '1fr 440px', gap: '5rem', alignItems: 'center' },
  authLeft: {},
  authPerks: { display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: '1.5rem' },
  authPerk: { display: 'flex', gap: '0.8rem', alignItems: 'center' },
  authCard: { background: '#030e1f', border: '1px solid #0f2a4a', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' },
  authTabs: { display: 'flex', background: '#020c1b', borderRadius: '8px', padding: '4px', marginBottom: '0.5rem' },
  authTab: { flex: 1, padding: '0.6rem', border: 'none', background: 'transparent', color: '#475569', fontFamily: 'Syne', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer', borderRadius: '6px' },
  authTabActive: { background: '#0f2a4a', color: '#00d4ff' },
  authInput: { width: '100%', padding: '0.85rem 1rem', background: '#020c1b', border: '1px solid #0f2a4a', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'DM Sans', fontSize: '0.9rem', outline: 'none' },
  authMsg: { padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid', fontFamily: 'DM Sans', fontSize: '0.85rem' },
  authSubmit: { width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #00d4ff, #00ff88)', color: '#020817', border: 'none', borderRadius: '10px', fontFamily: 'Syne', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' },
  authSwitch: { textAlign: 'center', color: '#475569', fontFamily: 'DM Sans', fontSize: '0.85rem' },
  authSwitchLink: { color: '#00d4ff', cursor: 'pointer' },

  // Footer
  footer: { background: '#020c1b', borderTop: '1px solid #0f2040', padding: '2rem 0' },
  footerInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' },
  footerText: { color: '#334155', fontFamily: 'DM Sans', fontSize: '0.78rem', flex: 1, textAlign: 'center' },
  footerLinks: { display: 'flex', gap: '1.5rem' },
  footerLink: { color: '#334155', fontFamily: 'DM Sans', fontSize: '0.82rem', textDecoration: 'none' },
}