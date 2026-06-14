import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useTheme, tokens } from '../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'

const REFERRERS = {
  'ty75ghb':  { name:'Elon Musk',          avatar:'👨‍💼' },
  'k9x4mzt':  { name:'Nicholas Galitzine', avatar:'👨‍💻' },
  'q2v8rpl':  { name:'Timothée Chalamet',  avatar:'👨‍🎨' },
  'grace77q': { name:'Grace Okafor',        avatar:'👩‍💻' },
  'james4rt': { name:'James Oluwole',       avatar:'👨‍🦱' },
  'lucy55wx': { name:'Lucy Chen',           avatar:'👩‍🦰' },
  'soph55wx': { name:'Sophie Cunningham',   avatar:'👩‍🦰' },
  'nic088lp': { name:'Nicole Denali walker', avatar:'🧟' },
  'dan001zz': { name:'Daniel Musa',         avatar:'👨‍🦳' },
  'emma88kk': { name:'Emma Williams',       avatar:'👩‍🦳' },
  'tony12pp': { name:'Tony Adeyemi',        avatar:'🧑‍💼' },
  'rose99vv': { name:'Rose Obi',            avatar:'👩‍🌾' },
}
const SEX_AVATARS = { male:'👨', female:'👩', neutral:'🧑' }

export default function Register() {
  const { theme, toggleTheme, isDark } = useTheme()
  const t = tokens(theme)
  const [step, setStep] = useState(1)
  const [countries, setCountries] = useState([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [form, setForm] = useState({ full_name:'',email:'',dob:'',sex:'',country:'',phone_code:'+1',phone_cca2:'US',phone:'',password:'',confirm_password:'',ref_code:'' })
  const [loading, setLoading] = useState(false)
  const [showCodePicker, setShowCodePicker] = useState(false)
  const [codeSearch, setCodeSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(location.hash.replace('#',''))
    setForm(f=>({...f,full_name:params.get('name')||f.full_name,email:params.get('email')||f.email,ref_code:params.get('ref')||hashParams.get('ref')||f.ref_code}))
  }, [location])

  useEffect(() => {
    // Hardcoded countries list — no external API needed, loads instantly
    const COUNTRIES = [
      {cca2:'AF',name:'Afghanistan',flag:'🇦🇫',code:'+93'},
      {cca2:'AL',name:'Albania',flag:'🇦🇱',code:'+355'},
      {cca2:'DZ',name:'Algeria',flag:'🇩🇿',code:'+213'},
      {cca2:'AD',name:'Andorra',flag:'🇦🇩',code:'+376'},
      {cca2:'AO',name:'Angola',flag:'🇦🇴',code:'+244'},
      {cca2:'AG',name:'Antigua and Barbuda',flag:'🇦🇬',code:'+1268'},
      {cca2:'AR',name:'Argentina',flag:'🇦🇷',code:'+54'},
      {cca2:'AM',name:'Armenia',flag:'🇦🇲',code:'+374'},
      {cca2:'AU',name:'Australia',flag:'🇦🇺',code:'+61'},
      {cca2:'AT',name:'Austria',flag:'🇦🇹',code:'+43'},
      {cca2:'AZ',name:'Azerbaijan',flag:'🇦🇿',code:'+994'},
      {cca2:'BS',name:'Bahamas',flag:'🇧🇸',code:'+1242'},
      {cca2:'BH',name:'Bahrain',flag:'🇧🇭',code:'+973'},
      {cca2:'BD',name:'Bangladesh',flag:'🇧🇩',code:'+880'},
      {cca2:'BB',name:'Barbados',flag:'🇧🇧',code:'+1246'},
      {cca2:'BY',name:'Belarus',flag:'🇧🇾',code:'+375'},
      {cca2:'BE',name:'Belgium',flag:'🇧🇪',code:'+32'},
      {cca2:'BZ',name:'Belize',flag:'🇧🇿',code:'+501'},
      {cca2:'BJ',name:'Benin',flag:'🇧🇯',code:'+229'},
      {cca2:'BT',name:'Bhutan',flag:'🇧🇹',code:'+975'},
      {cca2:'BO',name:'Bolivia',flag:'🇧🇴',code:'+591'},
      {cca2:'BA',name:'Bosnia and Herzegovina',flag:'🇧🇦',code:'+387'},
      {cca2:'BW',name:'Botswana',flag:'🇧🇼',code:'+267'},
      {cca2:'BR',name:'Brazil',flag:'🇧🇷',code:'+55'},
      {cca2:'BN',name:'Brunei',flag:'🇧🇳',code:'+673'},
      {cca2:'BG',name:'Bulgaria',flag:'🇧🇬',code:'+359'},
      {cca2:'BF',name:'Burkina Faso',flag:'🇧🇫',code:'+226'},
      {cca2:'BI',name:'Burundi',flag:'🇧🇮',code:'+257'},
      {cca2:'CV',name:'Cabo Verde',flag:'🇨🇻',code:'+238'},
      {cca2:'KH',name:'Cambodia',flag:'🇰🇭',code:'+855'},
      {cca2:'CM',name:'Cameroon',flag:'🇨🇲',code:'+237'},
      {cca2:'CA',name:'Canada',flag:'🇨🇦',code:'+1'},
      {cca2:'CF',name:'Central African Republic',flag:'🇨🇫',code:'+236'},
      {cca2:'TD',name:'Chad',flag:'🇹🇩',code:'+235'},
      {cca2:'CL',name:'Chile',flag:'🇨🇱',code:'+56'},
      {cca2:'CN',name:'China',flag:'🇨🇳',code:'+86'},
      {cca2:'CO',name:'Colombia',flag:'🇨🇴',code:'+57'},
      {cca2:'KM',name:'Comoros',flag:'🇰🇲',code:'+269'},
      {cca2:'CG',name:'Congo',flag:'🇨🇬',code:'+242'},
      {cca2:'CD',name:'Congo (DRC)',flag:'🇨🇩',code:'+243'},
      {cca2:'CR',name:'Costa Rica',flag:'🇨🇷',code:'+506'},
      {cca2:'CI',name:"Côte d'Ivoire",flag:'🇨🇮',code:'+225'},
      {cca2:'HR',name:'Croatia',flag:'🇭🇷',code:'+385'},
      {cca2:'CU',name:'Cuba',flag:'🇨🇺',code:'+53'},
      {cca2:'CY',name:'Cyprus',flag:'🇨🇾',code:'+357'},
      {cca2:'CZ',name:'Czech Republic',flag:'🇨🇿',code:'+420'},
      {cca2:'DK',name:'Denmark',flag:'🇩🇰',code:'+45'},
      {cca2:'DJ',name:'Djibouti',flag:'🇩🇯',code:'+253'},
      {cca2:'DM',name:'Dominica',flag:'🇩🇲',code:'+1767'},
      {cca2:'DO',name:'Dominican Republic',flag:'🇩🇴',code:'+1809'},
      {cca2:'EC',name:'Ecuador',flag:'🇪🇨',code:'+593'},
      {cca2:'EG',name:'Egypt',flag:'🇪🇬',code:'+20'},
      {cca2:'SV',name:'El Salvador',flag:'🇸🇻',code:'+503'},
      {cca2:'GQ',name:'Equatorial Guinea',flag:'🇬🇶',code:'+240'},
      {cca2:'ER',name:'Eritrea',flag:'🇪🇷',code:'+291'},
      {cca2:'EE',name:'Estonia',flag:'🇪🇪',code:'+372'},
      {cca2:'SZ',name:'Eswatini',flag:'🇸🇿',code:'+268'},
      {cca2:'ET',name:'Ethiopia',flag:'🇪🇹',code:'+251'},
      {cca2:'FJ',name:'Fiji',flag:'🇫🇯',code:'+679'},
      {cca2:'FI',name:'Finland',flag:'🇫🇮',code:'+358'},
      {cca2:'FR',name:'France',flag:'🇫🇷',code:'+33'},
      {cca2:'GA',name:'Gabon',flag:'🇬🇦',code:'+241'},
      {cca2:'GM',name:'Gambia',flag:'🇬🇲',code:'+220'},
      {cca2:'GE',name:'Georgia',flag:'🇬🇪',code:'+995'},
      {cca2:'DE',name:'Germany',flag:'🇩🇪',code:'+49'},
      {cca2:'GH',name:'Ghana',flag:'🇬🇭',code:'+233'},
      {cca2:'GR',name:'Greece',flag:'🇬🇷',code:'+30'},
      {cca2:'GD',name:'Grenada',flag:'🇬🇩',code:'+1473'},
      {cca2:'GT',name:'Guatemala',flag:'🇬🇹',code:'+502'},
      {cca2:'GN',name:'Guinea',flag:'🇬🇳',code:'+224'},
      {cca2:'GW',name:'Guinea-Bissau',flag:'🇬🇼',code:'+245'},
      {cca2:'GY',name:'Guyana',flag:'🇬🇾',code:'+592'},
      {cca2:'HT',name:'Haiti',flag:'🇭🇹',code:'+509'},
      {cca2:'HN',name:'Honduras',flag:'🇭🇳',code:'+504'},
      {cca2:'HU',name:'Hungary',flag:'🇭🇺',code:'+36'},
      {cca2:'IS',name:'Iceland',flag:'🇮🇸',code:'+354'},
      {cca2:'IN',name:'India',flag:'🇮🇳',code:'+91'},
      {cca2:'ID',name:'Indonesia',flag:'🇮🇩',code:'+62'},
      {cca2:'IR',name:'Iran',flag:'🇮🇷',code:'+98'},
      {cca2:'IQ',name:'Iraq',flag:'🇮🇶',code:'+964'},
      {cca2:'IE',name:'Ireland',flag:'🇮🇪',code:'+353'},
      {cca2:'IL',name:'Israel',flag:'🇮🇱',code:'+972'},
      {cca2:'IT',name:'Italy',flag:'🇮🇹',code:'+39'},
      {cca2:'JM',name:'Jamaica',flag:'🇯🇲',code:'+1876'},
      {cca2:'JP',name:'Japan',flag:'🇯🇵',code:'+81'},
      {cca2:'JO',name:'Jordan',flag:'🇯🇴',code:'+962'},
      {cca2:'KZ',name:'Kazakhstan',flag:'🇰🇿',code:'+7'},
      {cca2:'KE',name:'Kenya',flag:'🇰🇪',code:'+254'},
      {cca2:'KI',name:'Kiribati',flag:'🇰🇮',code:'+686'},
      {cca2:'KW',name:'Kuwait',flag:'🇰🇼',code:'+965'},
      {cca2:'KG',name:'Kyrgyzstan',flag:'🇰🇬',code:'+996'},
      {cca2:'LA',name:'Laos',flag:'🇱🇦',code:'+856'},
      {cca2:'LV',name:'Latvia',flag:'🇱🇻',code:'+371'},
      {cca2:'LB',name:'Lebanon',flag:'🇱🇧',code:'+961'},
      {cca2:'LS',name:'Lesotho',flag:'🇱🇸',code:'+266'},
      {cca2:'LR',name:'Liberia',flag:'🇱🇷',code:'+231'},
      {cca2:'LY',name:'Libya',flag:'🇱🇾',code:'+218'},
      {cca2:'LI',name:'Liechtenstein',flag:'🇱🇮',code:'+423'},
      {cca2:'LT',name:'Lithuania',flag:'🇱🇹',code:'+370'},
      {cca2:'LU',name:'Luxembourg',flag:'🇱🇺',code:'+352'},
      {cca2:'MG',name:'Madagascar',flag:'🇲🇬',code:'+261'},
      {cca2:'MW',name:'Malawi',flag:'🇲🇼',code:'+265'},
      {cca2:'MY',name:'Malaysia',flag:'🇲🇾',code:'+60'},
      {cca2:'MV',name:'Maldives',flag:'🇲🇻',code:'+960'},
      {cca2:'ML',name:'Mali',flag:'🇲🇱',code:'+223'},
      {cca2:'MT',name:'Malta',flag:'🇲🇹',code:'+356'},
      {cca2:'MH',name:'Marshall Islands',flag:'🇲🇭',code:'+692'},
      {cca2:'MR',name:'Mauritania',flag:'🇲🇷',code:'+222'},
      {cca2:'MU',name:'Mauritius',flag:'🇲🇺',code:'+230'},
      {cca2:'MX',name:'Mexico',flag:'🇲🇽',code:'+52'},
      {cca2:'FM',name:'Micronesia',flag:'🇫🇲',code:'+691'},
      {cca2:'MD',name:'Moldova',flag:'🇲🇩',code:'+373'},
      {cca2:'MC',name:'Monaco',flag:'🇲🇨',code:'+377'},
      {cca2:'MN',name:'Mongolia',flag:'🇲🇳',code:'+976'},
      {cca2:'ME',name:'Montenegro',flag:'🇲🇪',code:'+382'},
      {cca2:'MA',name:'Morocco',flag:'🇲🇦',code:'+212'},
      {cca2:'MZ',name:'Mozambique',flag:'🇲🇿',code:'+258'},
      {cca2:'MM',name:'Myanmar',flag:'🇲🇲',code:'+95'},
      {cca2:'NA',name:'Namibia',flag:'🇳🇦',code:'+264'},
      {cca2:'NR',name:'Nauru',flag:'🇳🇷',code:'+674'},
      {cca2:'NP',name:'Nepal',flag:'🇳🇵',code:'+977'},
      {cca2:'NL',name:'Netherlands',flag:'🇳🇱',code:'+31'},
      {cca2:'NZ',name:'New Zealand',flag:'🇳🇿',code:'+64'},
      {cca2:'NI',name:'Nicaragua',flag:'🇳🇮',code:'+505'},
      {cca2:'NE',name:'Niger',flag:'🇳🇪',code:'+227'},
      {cca2:'NG',name:'Nigeria',flag:'🇳🇬',code:'+234'},
      {cca2:'NO',name:'Norway',flag:'🇳🇴',code:'+47'},
      {cca2:'OM',name:'Oman',flag:'🇴🇲',code:'+968'},
      {cca2:'PK',name:'Pakistan',flag:'🇵🇰',code:'+92'},
      {cca2:'PW',name:'Palau',flag:'🇵🇼',code:'+680'},
      {cca2:'PA',name:'Panama',flag:'🇵🇦',code:'+507'},
      {cca2:'PG',name:'Papua New Guinea',flag:'🇵🇬',code:'+675'},
      {cca2:'PY',name:'Paraguay',flag:'🇵🇾',code:'+595'},
      {cca2:'PE',name:'Peru',flag:'🇵🇪',code:'+51'},
      {cca2:'PH',name:'Philippines',flag:'🇵🇭',code:'+63'},
      {cca2:'PL',name:'Poland',flag:'🇵🇱',code:'+48'},
      {cca2:'PT',name:'Portugal',flag:'🇵🇹',code:'+351'},
      {cca2:'QA',name:'Qatar',flag:'🇶🇦',code:'+974'},
      {cca2:'RO',name:'Romania',flag:'🇷🇴',code:'+40'},
      {cca2:'RU',name:'Russia',flag:'🇷🇺',code:'+7'},
      {cca2:'RW',name:'Rwanda',flag:'🇷🇼',code:'+250'},
      {cca2:'KN',name:'Saint Kitts and Nevis',flag:'🇰🇳',code:'+1869'},
      {cca2:'LC',name:'Saint Lucia',flag:'🇱🇨',code:'+1758'},
      {cca2:'VC',name:'Saint Vincent and the Grenadines',flag:'🇻🇨',code:'+1784'},
      {cca2:'WS',name:'Samoa',flag:'🇼🇸',code:'+685'},
      {cca2:'SM',name:'San Marino',flag:'🇸🇲',code:'+378'},
      {cca2:'ST',name:'Sao Tome and Principe',flag:'🇸🇹',code:'+239'},
      {cca2:'SA',name:'Saudi Arabia',flag:'🇸🇦',code:'+966'},
      {cca2:'SN',name:'Senegal',flag:'🇸🇳',code:'+221'},
      {cca2:'RS',name:'Serbia',flag:'🇷🇸',code:'+381'},
      {cca2:'SC',name:'Seychelles',flag:'🇸🇨',code:'+248'},
      {cca2:'SL',name:'Sierra Leone',flag:'🇸🇱',code:'+232'},
      {cca2:'SG',name:'Singapore',flag:'🇸🇬',code:'+65'},
      {cca2:'SK',name:'Slovakia',flag:'🇸🇰',code:'+421'},
      {cca2:'SI',name:'Slovenia',flag:'🇸🇮',code:'+386'},
      {cca2:'SB',name:'Solomon Islands',flag:'🇸🇧',code:'+677'},
      {cca2:'SO',name:'Somalia',flag:'🇸🇴',code:'+252'},
      {cca2:'ZA',name:'South Africa',flag:'🇿🇦',code:'+27'},
      {cca2:'SS',name:'South Sudan',flag:'🇸🇸',code:'+211'},
      {cca2:'ES',name:'Spain',flag:'🇪🇸',code:'+34'},
      {cca2:'LK',name:'Sri Lanka',flag:'🇱🇰',code:'+94'},
      {cca2:'SD',name:'Sudan',flag:'🇸🇩',code:'+249'},
      {cca2:'SR',name:'Suriname',flag:'🇸🇷',code:'+597'},
      {cca2:'SE',name:'Sweden',flag:'🇸🇪',code:'+46'},
      {cca2:'CH',name:'Switzerland',flag:'🇨🇭',code:'+41'},
      {cca2:'SY',name:'Syria',flag:'🇸🇾',code:'+963'},
      {cca2:'TW',name:'Taiwan',flag:'🇹🇼',code:'+886'},
      {cca2:'TJ',name:'Tajikistan',flag:'🇹🇯',code:'+992'},
      {cca2:'TZ',name:'Tanzania',flag:'🇹🇿',code:'+255'},
      {cca2:'TH',name:'Thailand',flag:'🇹🇭',code:'+66'},
      {cca2:'TL',name:'Timor-Leste',flag:'🇹🇱',code:'+670'},
      {cca2:'TG',name:'Togo',flag:'🇹🇬',code:'+228'},
      {cca2:'TO',name:'Tonga',flag:'🇹🇴',code:'+676'},
      {cca2:'TT',name:'Trinidad and Tobago',flag:'🇹🇹',code:'+1868'},
      {cca2:'TN',name:'Tunisia',flag:'🇹🇳',code:'+216'},
      {cca2:'TR',name:'Turkey',flag:'🇹🇷',code:'+90'},
      {cca2:'TM',name:'Turkmenistan',flag:'🇹🇲',code:'+993'},
      {cca2:'TV',name:'Tuvalu',flag:'🇹🇻',code:'+688'},
      {cca2:'UG',name:'Uganda',flag:'🇺🇬',code:'+256'},
      {cca2:'UA',name:'Ukraine',flag:'🇺🇦',code:'+380'},
      {cca2:'AE',name:'United Arab Emirates',flag:'🇦🇪',code:'+971'},
      {cca2:'GB',name:'United Kingdom',flag:'🇬🇧',code:'+44'},
      {cca2:'US',name:'United States',flag:'🇺🇸',code:'+1'},
      {cca2:'UY',name:'Uruguay',flag:'🇺🇾',code:'+598'},
      {cca2:'UZ',name:'Uzbekistan',flag:'🇺🇿',code:'+998'},
      {cca2:'VU',name:'Vanuatu',flag:'🇻🇺',code:'+678'},
      {cca2:'VE',name:'Venezuela',flag:'🇻🇪',code:'+58'},
      {cca2:'VN',name:'Vietnam',flag:'🇻🇳',code:'+84'},
      {cca2:'YE',name:'Yemen',flag:'🇾🇪',code:'+967'},
      {cca2:'ZM',name:'Zambia',flag:'🇿🇲',code:'+260'},
      {cca2:'ZW',name:'Zimbabwe',flag:'🇿🇼',code:'+263'},
    ]
    setCountries(COUNTRIES)
    setLoadingCountries(false)
    // Auto-detect country from IP
    fetch('https://ipapi.co/json/')
      .then(r=>r.json())
      .then(loc=>{
        const detected=COUNTRIES.find(c=>c.cca2===loc.country_code)
        const fallback=COUNTRIES.find(c=>c.cca2==='NG')
        const match=detected||fallback
        if(match) setForm(f=>({...f,phone_code:match.code,phone_cca2:match.cca2}))
      })
      .catch(()=>{ setForm(f=>({...f,phone_code:'+234',phone_cca2:'NG'})) })
  }, [])

  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const filteredCodes=countries.filter(c=>c.name.toLowerCase().includes(codeSearch.toLowerCase())||c.code.includes(codeSearch)).slice(0,80)
  const selectedCountry=countries.find(c=>c.cca2===form.phone_cca2)||countries.find(c=>c.code===form.phone_code)

  const validateStep1=()=>{
    if(!form.full_name.trim()) return 'Full name is required'
    if(!form.email.trim()) return 'Email is required'
    if(!form.dob) return 'Date of birth is required'
    const age=Math.floor((Date.now()-new Date(form.dob))/(365.25*24*60*60*1000))
    if(age<18) return 'You must be at least 18 years old'
    if(!form.sex) return 'Please select your sex'
    if(!form.country) return 'Select your country'
    if(!form.phone.trim()) return 'Phone number is required'
    return null
  }
  const validateStep2=()=>{
    if(!form.password) return 'Password is required'
    if(form.password.length<8) return 'Password must be at least 8 characters'
    if(!/[A-Z]/.test(form.password)) return 'Password must contain an uppercase letter'
    if(!/[0-9]/.test(form.password)) return 'Password must contain a number'
    if(form.password!==form.confirm_password) return 'Passwords do not match'
    return null
  }
  const handleNext=()=>{ const e=validateStep1(); if(e){toast.error(e);return}; setStep(2) }
  const handleSubmit=async()=>{
    const e=validateStep2(); if(e){toast.error(e);return}
    setLoading(true)
    const { error }=await supabase.auth.signUp({ email:form.email,password:form.password,
      options:{ data:{ full_name:form.full_name,dob:form.dob,sex:form.sex,nationality:form.country,phone:`${form.phone_code}${form.phone}`,ref_code:form.ref_code||null } }
    })
    if(error) toast.error(error.message)
    else { toast.success('Account created! Check your email to confirm.'); setTimeout(()=>navigate('/login'),3000) }
    setLoading(false)
  }

  const pwStrength=()=>{
    const p=form.password; if(!p) return {score:0,label:'',color:t.cardBorder}
    let s=0; if(p.length>=8)s++; if(p.length>=12)s++; if(/[A-Z]/.test(p))s++; if(/[0-9]/.test(p))s++; if(/[^A-Za-z0-9]/.test(p))s++
    if(s<=1) return {score:s,label:'Weak',color:t.red}; if(s<=3) return {score:s,label:'Fair',color:t.yellow}; return {score:s,label:'Strong',color:t.green}
  }
  const strength=pwStrength()
  const referrer=REFERRERS[form.ref_code?.toLowerCase()]
  const avatarEmoji=SEX_AVATARS[form.sex]||'🧑'
  const inp={ width:'100%',padding:'.82rem 1rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.text,fontFamily:'DM Sans',fontSize:'.9rem',outline:'none',boxSizing:'border-box' }
  const lbl={ color:t.textSub,fontFamily:'DM Sans',fontSize:'.72rem',fontWeight:'500',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:'.4rem' }

  return (
    <div style={{ minHeight:'100vh',background:t.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}.ri:focus{border-color:#00d4ff66!important;outline:none}.ri::placeholder{color:${t.textMuted}}select.ri{appearance:none;cursor:pointer}.code-opt:hover{background:${t.hover}!important;cursor:pointer}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${t.input}}::-webkit-scrollbar-thumb{background:${t.cardBorder};border-radius:2px}`}</style>
      <Toaster position="top-center"/>
      <button onClick={toggleTheme} style={{ position:'fixed',top:'1rem',right:'1rem',background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'8px',cursor:'pointer',padding:'.5rem .7rem',color:t.textSub,display:'flex',alignItems:'center',gap:'.3rem',fontFamily:'DM Sans',fontSize:'.8rem' }}>
        {isDark?<Sun size={15}/>:<Moon size={15}/>}
      </button>
      <div style={{ width:'100%',maxWidth:'500px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'.6rem',justifyContent:'center',marginBottom:'2rem' }}>
          <div style={{ width:'36px',height:'36px',background:'linear-gradient(135deg,#00d4ff,#00ff88)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'.85rem',color:'#020817',letterSpacing:'-.03em' }}>ST</div>
          <span style={{ color:t.text,fontWeight:'800',fontSize:'1.15rem',letterSpacing:'-.03em' }}>SentientTrade</span>
        </div>
        <div style={{ background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'18px',padding:'2rem',boxShadow:t.shadow }}>
          <div style={{ display:'flex',alignItems:'center',gap:'.8rem',marginBottom:'1.4rem' }}>
            <span style={{ fontSize:'1.8rem' }}>{avatarEmoji}</span>
            <div>
              <h2 style={{ color:t.text,fontWeight:'800',fontSize:'1.4rem',letterSpacing:'-.02em',margin:0 }}>{step===1?'Create Account':'Set Password'}</h2>
              <p style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.82rem',margin:'.15rem 0 0' }}>Step {step} of 2 — {step===1?'Personal Information':'Account Security'}</p>
            </div>
          </div>
          <div style={{ display:'flex',gap:'.4rem',marginBottom:'1.8rem' }}>
            {[1,2].map(s=><div key={s} style={{ flex:1,height:'3px',borderRadius:'99px',background:s<=step?'linear-gradient(90deg,#00d4ff,#00ff88)':t.cardBorder,transition:'background .4s' }}/>)}
          </div>

          {step===1 && (
            <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
              <div><label style={lbl}>Full Name</label><input className="ri" style={inp} placeholder="e.g. John Smith" value={form.full_name} onChange={e=>set('full_name',e.target.value)}/></div>
              <div><label style={lbl}>Email Address</label><input className="ri" style={inp} type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.7rem' }}>
                <div><label style={lbl}>Date of Birth</label><input className="ri" style={{...inp,colorScheme:isDark?'dark':'light'}} type="date" max={new Date(Date.now()-18*365.25*24*60*60*1000).toISOString().split('T')[0]} value={form.dob} onChange={e=>set('dob',e.target.value)}/></div>
                <div><label style={lbl}>Sex</label><select className="ri" style={{...inp,background:t.input}} value={form.sex} onChange={e=>set('sex',e.target.value)}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="neutral">Prefer not to say</option></select></div>
              </div>
              <div><label style={lbl}>Country</label><select className="ri" style={{...inp,background:t.input}} value={form.country} onChange={e=>set('country',e.target.value)} disabled={loadingCountries}><option value="">{loadingCountries?'Loading countries...':'Select your country'}</option>{countries.map(c=><option key={c.cca2} value={c.name}>{c.flag} {c.name}</option>)}</select></div>
              <div>
                <label style={lbl}>Phone Number</label>
                <div style={{ display:'flex',gap:'.5rem' }}>
                  <div style={{ position:'relative',flexShrink:0 }}>
                    <button type="button" onClick={()=>setShowCodePicker(o=>!o)} style={{ display:'flex',alignItems:'center',gap:'.4rem',padding:'.82rem .9rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'8px',color:t.text,fontFamily:'DM Sans',fontSize:'.86rem',cursor:'pointer',whiteSpace:'nowrap' }}>
                      <span>{selectedCountry?.flag||'🌍'}</span><span>{form.phone_code}</span>
                      <span style={{ color:t.textMuted,fontSize:'.68rem',display:'inline-block',transition:'transform .2s',transform:showCodePicker?'rotate(180deg)':'rotate(0)' }}>▼</span>
                    </button>
                    {showCodePicker && (
                      <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,background:t.card,border:`1px solid ${t.cardBorder}`,borderRadius:'10px',padding:'.4rem',zIndex:50,maxHeight:'240px',overflowY:'auto',minWidth:'230px',boxShadow:t.shadow }}>
                        <input style={{ width:'100%',padding:'.5rem .7rem',background:t.input,border:`1px solid ${t.inputBorder}`,borderRadius:'6px',color:t.text,fontFamily:'DM Sans',fontSize:'.8rem',outline:'none',marginBottom:'.4rem',boxSizing:'border-box' }} placeholder="Search country..." value={codeSearch} onChange={e=>setCodeSearch(e.target.value)}/>
                        {filteredCodes.map((c,i)=>(
                          <div key={i} className="code-opt" onClick={()=>{ setForm(f=>({...f,phone_code:c.code,phone_cca2:c.cca2})); setShowCodePicker(false); setCodeSearch('') }} style={{ display:'flex',alignItems:'center',gap:'.6rem',padding:'.5rem .7rem',borderRadius:'6px',transition:'background .15s' }}>
                            <span>{c.flag}</span><span style={{ color:t.text,fontFamily:'DM Sans',fontSize:'.8rem',flex:1 }}>{c.name}</span><span style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.76rem' }}>{c.code}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input className="ri" style={{...inp,flex:1}} type="tel" placeholder="555-123-4567" value={form.phone} onChange={e=>set('phone',e.target.value.replace(/\D/g,''))}/>
                </div>
              </div>
              <div>
                <label style={lbl}>Referral Code <span style={{ color:t.textMuted,textTransform:'none',letterSpacing:0 }}>(optional)</span></label>
                <input className="ri" style={{...inp,borderColor:referrer?t.green+'44':t.inputBorder}} placeholder="e.g. ty75ghb" value={form.ref_code} onChange={e=>set('ref_code',e.target.value)}/>
                {referrer && <div style={{ display:'flex',alignItems:'center',gap:'.6rem',marginTop:'.5rem',background:t.green+'08',border:`1px solid ${t.green}22`,borderRadius:'8px',padding:'.5rem .8rem' }}><span style={{ fontSize:'1.2rem' }}>{referrer.avatar}</span><span style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.8rem' }}>Invited by <strong>{referrer.name}</strong></span></div>}
                {form.ref_code&&!referrer&&form.ref_code.length>=4&&<p style={{ color:t.red,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>Invalid referral code</p>}
              </div>
              <button onClick={handleNext} style={{ width:'100%',padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',marginTop:'.2rem' }}>Continue →</button>
            </div>
          )}

          {step===2 && (
            <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
              <div>
                <label style={lbl}>Password</label>
                <input className="ri" style={inp} type="password" placeholder="Min. 8 characters" value={form.password} onChange={e=>set('password',e.target.value)}/>
                {form.password && (
                  <div style={{ marginTop:'.5rem' }}>
                    <div style={{ display:'flex',gap:'.3rem',marginBottom:'.22rem' }}>{[1,2,3,4,5].map(i=><div key={i} style={{ flex:1,height:'3px',borderRadius:'99px',background:i<=strength.score?strength.color:t.cardBorder,transition:'background .3s' }}/>)}</div>
                    <div style={{ display:'flex',justifyContent:'space-between' }}><span style={{ color:t.textSub,fontFamily:'DM Sans',fontSize:'.7rem' }}>Strength</span><span style={{ color:strength.color,fontFamily:'DM Sans',fontSize:'.7rem',fontWeight:'600' }}>{strength.label}</span></div>
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Confirm Password</label>
                <input className="ri" style={{...inp,borderColor:form.confirm_password&&form.confirm_password!==form.password?t.red+'66':t.inputBorder}} type="password" placeholder="Re-enter password" value={form.confirm_password} onChange={e=>set('confirm_password',e.target.value)}/>
                {form.confirm_password&&form.confirm_password!==form.password&&<p style={{ color:t.red,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>Passwords do not match</p>}
                {form.confirm_password&&form.confirm_password===form.password&&<p style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.72rem',marginTop:'.3rem' }}>✓ Passwords match</p>}
              </div>
              <div style={{ background:t.input,borderRadius:'8px',padding:'.85rem 1rem',border:`1px solid ${t.cardBorder}` }}>
                <p style={{ color:t.textMuted,fontFamily:'DM Sans',fontSize:'.7rem',marginBottom:'.4rem',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.05em' }}>Requirements</p>
                {[[form.password.length>=8,'At least 8 characters'],[/[A-Z]/.test(form.password),'One uppercase letter'],[/[0-9]/.test(form.password),'One number'],[form.password===form.confirm_password&&!!form.confirm_password,'Passwords match']].map(([met,label],i)=>(
                  <div key={i} style={{ display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.25rem' }}>
                    <span style={{ color:met?t.green:t.textMuted,fontSize:'.75rem' }}>{met?'✓':'○'}</span>
                    <span style={{ color:met?t.text:t.textMuted,fontFamily:'DM Sans',fontSize:'.75rem' }}>{label}</span>
                  </div>
                ))}
              </div>
              {referrer && <div style={{ display:'flex',alignItems:'center',gap:'.6rem',background:t.green+'08',border:`1px solid ${t.green}22`,borderRadius:'8px',padding:'.5rem .8rem' }}><span style={{ fontSize:'1.2rem' }}>{referrer.avatar}</span><span style={{ color:t.green,fontFamily:'DM Sans',fontSize:'.8rem' }}>Invited by <strong>{referrer.name}</strong></span></div>}
              <div style={{ display:'flex',gap:'.7rem' }}>
                <button onClick={()=>setStep(1)} style={{ flex:1,padding:'.9rem',background:'transparent',border:`1px solid ${t.cardBorder}`,color:t.textSub,borderRadius:'10px',fontFamily:'Syne',fontWeight:'600',fontSize:'.9rem',cursor:'pointer' }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading} style={{ flex:2,padding:'.9rem',background:'linear-gradient(135deg,#00d4ff,#00ff88)',color:'#020817',border:'none',borderRadius:'10px',fontFamily:'Syne',fontWeight:'700',fontSize:'.95rem',cursor:'pointer',opacity:loading?.7:1 }}>
                  {loading?'Creating...':'Create Account'}
                </button>
              </div>
            </div>
          )}
          <p style={{ textAlign:'center',color:t.textMuted,fontFamily:'DM Sans',fontSize:'.82rem',marginTop:'1.3rem',marginBottom:0 }}>
            Already have an account? <Link to="/login" style={{ color:t.cyan,textDecoration:'none' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
