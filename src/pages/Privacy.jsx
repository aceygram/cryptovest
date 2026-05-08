import { Link } from 'react-router-dom'
import { useTheme, tokens } from '../context/ThemeContext'

export default function Privacy() {
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
        <Link to="/" style={{ color:'#00d4ff',fontFamily:'DM Sans',fontSize:'.85rem',textDecoration:'none',display:'inline-block',marginBottom:'2rem' }}>← Back to SentientTrade</Link>
        <div style={{ display:'flex',alignItems:'center',gap:'.7rem',marginBottom:'.5rem' }}>
          <div style={{ width:'34px',height:'34px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.82rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
          <span style={{ color:t.text,fontWeight:'800',fontSize:'1.1rem',letterSpacing:'-.03em' }}>SentientTrade</span>
        </div>
        <h1 style={h1}>Privacy Policy</h1>
        <p style={{ ...p,color:t.textMuted }}>Last updated: {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
        <div style={divider}/>

        {[
          { title:'1. Information We Collect', body:'We collect information you provide directly: full name, email address, date of birth, nationality, phone number, and sex when you register. We also collect identity documents (ID card and selfie) for KYC verification purposes. Transaction data including deposit addresses, amounts, and withdrawal requests are recorded.' },
          { title:'2. How We Use Your Information', body:'We use your personal information to operate your account, process transactions, verify your identity, send notifications about your account activity, and comply with legal obligations. We do not sell your personal data to third parties.' },
          { title:'3. KYC Documents', body:'Identity documents you upload for KYC verification are stored securely using encrypted cloud storage. These documents are only accessed by authorized SentientTrade administrators for verification purposes. Documents are retained for as long as your account is active and for a period required by applicable regulations after closure.' },
          { title:'4. Referral Data', body:'If you registered using a referral code, the referrer associated with that code may see that you joined the platform. No other personal information is shared with referrers.' },
          { title:'5. Cookies and Analytics', body:'We use minimal session cookies necessary for authentication. We do not use third-party advertising cookies or tracking pixels. Your theme preference (light/dark mode) is stored in your browser\'s local storage.' },
          { title:'6. Data Security', body:'We use industry-standard security measures including encryption in transit (TLS) and at rest. Access to user data is restricted to authorized personnel. However, no security system is impenetrable, and we cannot guarantee absolute security.' },
          { title:'7. Data Retention', body:'We retain your account data for as long as your account is active. If you close your account, we will retain transaction records as required by law. You may request deletion of your personal data by contacting support, subject to legal retention requirements.' },
          { title:'8. Your Rights', body:'You have the right to access the personal data we hold about you, request corrections to inaccurate data, request deletion of your data (subject to legal requirements), and withdraw consent for processing where applicable. Contact us through the Support page to exercise these rights.' },
          { title:'9. Third-Party Services', body:'We use the following third-party services: Supabase (database and authentication), NOWPayments (cryptocurrency payment processing), and Brevo (email delivery). Each service has its own privacy policy governing their use of data.' },
          { title:'10. Changes to This Policy', body:'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the Platform. Your continued use after changes constitutes acceptance.' },
          { title:'11. Contact Us', body:'For privacy-related questions or to exercise your rights, please contact us through the Support page on our platform.' },
        ].map((section,i)=>(
          <div key={i}>
            <h2 style={h2}>{section.title}</h2>
            <p style={p}>{section.body}</p>
          </div>
        ))}

        <div style={divider}/>
        <div style={{ display:'flex',gap:'1.5rem',marginTop:'1.5rem' }}>
          <Link to="/terms" style={{ color:'#00d4ff',fontFamily:'DM Sans',fontSize:'.85rem' }}>Terms of Service</Link>
          <Link to="/support" style={{ color:'#00d4ff',fontFamily:'DM Sans',fontSize:'.85rem' }}>Support</Link>
        </div>
      </div>
    </div>
  )
}