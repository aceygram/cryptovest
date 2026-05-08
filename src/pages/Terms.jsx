import { Link } from 'react-router-dom'
import { useTheme, tokens } from '../context/ThemeContext'

export default function Terms() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const S = { background:t.bg,minHeight:'100vh',fontFamily:"'Syne',sans-serif",padding:'0 1rem' }
  const container = { maxWidth:'800px',margin:'0 auto',padding:'4rem 0 6rem' }
  const h1 = { color:t.text,fontWeight:'800',fontSize:'2rem',letterSpacing:'-.03em',marginBottom:'.5rem' }
  const h2 = { color:t.text,fontWeight:'700',fontSize:'1.1rem',margin:'2rem 0 .5rem' }
  const p = { color:t.textSub,fontFamily:'DM Sans',fontSize:'.92rem',lineHeight:1.8,margin:'0 0 1rem' }
  const divider = { height:'1px',background:t.cardBorder,margin:'2rem 0' }

  return (
    <div style={S}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
      <div style={container}>
        {/* Back link */}
        <Link to="/" style={{ color:'#00d4ff',fontFamily:'DM Sans',fontSize:'.85rem',textDecoration:'none',display:'inline-block',marginBottom:'2rem' }}>← Back to SentientTrade</Link>

        {/* Header */}
        <div style={{ display:'flex',alignItems:'center',gap:'.7rem',marginBottom:'.5rem' }}>
          <div style={{ width:'34px',height:'34px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.82rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
          <span style={{ color:t.text,fontWeight:'800',fontSize:'1.1rem',letterSpacing:'-.03em' }}>SentientTrade</span>
        </div>
        <h1 style={h1}>Terms of Service</h1>
        <p style={{ ...p,color:t.textMuted }}>Last updated: {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>

        <div style={divider}/>

        {[
          { title:'1. Acceptance of Terms', body:'By accessing or using SentientTrade ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these terms at any time, and your continued use constitutes acceptance of any changes.' },
          { title:'2. Eligibility', body:'You must be at least 18 years of age to use SentientTrade. By registering, you confirm that you meet this requirement and that the information you provide is accurate and complete. We reserve the right to terminate accounts found to have provided false information.' },
          { title:'3. Investment Risk Disclosure', body:'Cryptocurrency investments carry significant risk. Past performance of our AI trading engine does not guarantee future results. You may lose some or all of your invested capital. You should only invest what you can afford to lose. SentientTrade does not provide financial advice, and nothing on the Platform should be construed as such.' },
          { title:'4. AI Trading Engine', body:'Our proprietary AI trading engine operates autonomously. While we strive to maintain consistent performance, we cannot guarantee specific returns. ROI percentages displayed on investment plans are projected estimates based on historical performance and are not guaranteed.' },
          { title:'5. Deposits and Withdrawals', body:'All deposits are made in cryptocurrency. Once a deposit is confirmed on the blockchain, it is credited to your account in USD equivalent. Withdrawals are subject to a minimum of $10 and are processed within 24 hours subject to admin approval. We reserve the right to delay withdrawals pending identity verification.' },
          { title:'6. KYC and Identity Verification', body:'We are required to verify the identity of users making withdrawals. You agree to provide accurate identification documents when requested. Failure to complete KYC verification will restrict your ability to withdraw funds. We store your documents securely and do not share them with third parties except as required by law.' },
          { title:'7. Prohibited Activities', body:'You agree not to use the Platform for money laundering, fraud, or any illegal activity. You may not attempt to reverse-engineer, scrape, or interfere with the Platform\'s systems. Any attempt to manipulate account balances or exploit system vulnerabilities will result in immediate account termination.' },
          { title:'8. Account Security', body:'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. SentientTrade will not be liable for losses resulting from unauthorized account access caused by your failure to protect your credentials.' },
          { title:'9. Termination', body:'We reserve the right to suspend or terminate your account at any time for breach of these terms, suspicious activity, or at our discretion. Upon termination, any funds held in your account will be processed according to our withdrawal procedures after identity verification.' },
          { title:'10. Limitation of Liability', body:'To the maximum extent permitted by law, SentientTrade shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability in any matter shall not exceed the balance held in your account at the time of the claim.' },
          { title:'11. Governing Law', body:'These terms shall be governed by applicable law. Any disputes shall be resolved through binding arbitration rather than court proceedings, to the extent permitted by law.' },
          { title:'12. Contact', body:'For questions about these terms, contact us through the Support page.' },
        ].map((section,i)=>(
          <div key={i}>
            <h2 style={h2}>{section.title}</h2>
            <p style={p}>{section.body}</p>
          </div>
        ))}

        <div style={divider}/>
        <p style={{ ...p, color:t.textMuted, fontSize:'.82rem' }}>
          By using SentientTrade, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
        <div style={{ display:'flex',gap:'1.5rem',marginTop:'1.5rem' }}>
          <Link to="/privacy" style={{ color:'#00d4ff',fontFamily:'DM Sans',fontSize:'.85rem' }}>Privacy Policy</Link>
          <Link to="/support" style={{ color:'#00d4ff',fontFamily:'DM Sans',fontSize:'.85rem' }}>Support</Link>
        </div>
      </div>
    </div>
  )
}