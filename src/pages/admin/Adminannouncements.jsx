import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Navbar from '../../components/Navbar'
import { useTheme, tokens } from '../../context/ThemeContext'
import toast, { Toaster } from 'react-hot-toast'
import { Megaphone, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react'

export default function AdminAnnouncements() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', type: 'info', dismissible: true })

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements(data || []); setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error('Enter a title')
    if (!form.message.trim()) return toast.error('Enter a message')
    setCreating(true)
    const { error } = await supabase.from('announcements').insert({ ...form, active: true })
    if (error) toast.error('Failed to create')
    else { toast.success('Announcement created'); setForm({ title:'', message:'', type:'info', dismissible:true }); fetchAnnouncements() }
    setCreating(false)
  }

  const toggleActive = async (ann) => {
    await supabase.from('announcements').update({ active: !ann.active }).eq('id', ann.id)
    fetchAnnouncements()
  }

  const deleteAnn = async (id) => {
    await supabase.from('announcements').delete().eq('id', id)
    toast.success('Deleted'); fetchAnnouncements()
  }

  const typeColors = { info:'#00d4ff', warning:'#f59e0b', success:'#00ff88', danger:'#ef4444' }
  const inp = { width:'100%', padding:'.82rem 1rem', background:t.input, border:`1px solid ${t.inputBorder}`, borderRadius:'8px', color:t.text, fontFamily:'DM Sans', fontSize:'.9rem', outline:'none', boxSizing:'border-box' }

  return (
    <div style={{ background:t.bg, minHeight:'100vh', fontFamily:"'Syne',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box}@media(max-width:600px){.ann-row{flex-wrap:wrap!important;gap:.7rem!important}}`}</style>
      <Toaster/>
      <Navbar/>
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem 1.5rem' }}>
        <h2 style={{ color:t.text, margin:'0 0 .3rem', fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-.02em' }}>Announcements</h2>
        <p style={{ color:t.textSub, margin:'0 0 2rem', fontFamily:'DM Sans', fontSize:'.88rem' }}>Post banners visible to all logged-in users</p>

        {/* Create form */}
        <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'16px', padding:'1.6rem', marginBottom:'1.5rem' }}>
          <h3 style={{ color:t.text, margin:'0 0 1.2rem', fontWeight:'700', fontSize:'.95rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
            <Plus size={16}/> New Announcement
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div>
                <label style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.72rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:'.4rem' }}>Title</label>
                <input style={inp} placeholder="e.g. Scheduled Maintenance" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
              </div>
              <div>
                <label style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.72rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:'.4rem' }}>Type</label>
                <select style={{...inp, background:t.input, appearance:'none'}} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="info">ℹ️ Info (Blue)</option>
                  <option value="warning">⚠️ Warning (Yellow)</option>
                  <option value="success">✅ Success (Green)</option>
                  <option value="danger">🚨 Danger (Red)</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.72rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.06em', display:'block', marginBottom:'.4rem' }}>Message</label>
              <textarea style={{...inp, minHeight:'80px', resize:'vertical'}} placeholder="Write your announcement message..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'.6rem', cursor:'pointer' }}>
                <input type="checkbox" checked={form.dismissible} onChange={e=>setForm({...form,dismissible:e.target.checked})} style={{ width:'16px', height:'16px', accentColor:'#00d4ff' }}/>
                <span style={{ color:t.textSub, fontFamily:'DM Sans', fontSize:'.85rem' }}>Users can dismiss this banner</span>
              </label>
              <button onClick={handleCreate} disabled={creating}
                style={{ padding:'.82rem 2rem', background:'linear-gradient(135deg,#00d4ff,#00ff88)', color:'#020817', border:'none', borderRadius:'10px', fontFamily:'Syne', fontWeight:'700', fontSize:'.92rem', cursor:'pointer', opacity:creating?.7:1, display:'flex', alignItems:'center', gap:'.5rem' }}>
                <Megaphone size={15}/> {creating ? 'Posting...' : 'Post Announcement'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        {(form.title || form.message) && (
          <div style={{ background:typeColors[form.type]+'18', border:`1px solid ${typeColors[form.type]}44`, borderRadius:'10px', padding:'.7rem 1.2rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'.8rem' }}>
            <Megaphone size={15} color={typeColors[form.type]}/>
            <p style={{ color:typeColors[form.type], margin:0, fontFamily:'DM Sans', fontSize:'.85rem' }}>
              <strong>{form.title}{form.title && form.message ? ': ' : ''}</strong>{form.message}
            </p>
            <span style={{ color:typeColors[form.type], fontFamily:'DM Sans', fontSize:'.72rem', marginLeft:'auto', opacity:.7 }}>Preview</span>
          </div>
        )}

        {/* Existing announcements */}
        <div style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:'14px', padding:'1.2rem' }}>
          <h3 style={{ color:t.text, margin:'0 0 1rem', fontWeight:'700', fontSize:'.92rem' }}>All Announcements</h3>
          {loading ? (
            <p style={{ color:t.textSub, textAlign:'center', padding:'2rem', fontFamily:'DM Sans' }}>Loading...</p>
          ) : announcements.length === 0 ? (
            <p style={{ color:t.textMuted, textAlign:'center', padding:'2rem', fontFamily:'DM Sans' }}>No announcements yet.</p>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="ann-row" style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'.9rem', background:t.input, borderRadius:'10px', marginBottom:'.5rem', border:`1px solid ${t.cardBorder}`, opacity:ann.active?1:.5 }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:typeColors[ann.type]||t.cyan, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:t.text, margin:0, fontWeight:'700', fontFamily:'DM Sans', fontSize:'.88rem' }}>{ann.title}</p>
                  <p style={{ color:t.textSub, margin:'.15rem 0 0', fontFamily:'DM Sans', fontSize:'.78rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ann.message}</p>
                  <p style={{ color:t.textMuted, margin:'.1rem 0 0', fontFamily:'DM Sans', fontSize:'.72rem' }}>{new Date(ann.created_at).toLocaleDateString()} · {ann.dismissible ? 'Dismissible' : 'Permanent'}</p>
                </div>
                <span style={{ padding:'.22rem .65rem', borderRadius:'99px', fontSize:'.72rem', fontFamily:'DM Sans', fontWeight:'600', background:ann.active?t.green+'18':t.textMuted+'18', color:ann.active?t.green:t.textMuted, flexShrink:0 }}>
                  {ann.active ? 'Live' : 'Off'}
                </span>
                <button onClick={() => toggleActive(ann)} title={ann.active?'Deactivate':'Activate'}
                  style={{ background:'none', border:'none', cursor:'pointer', color:ann.active?t.green:t.textMuted, flexShrink:0 }}>
                  {ann.active ? <ToggleRight size={22}/> : <ToggleLeft size={22}/>}
                </button>
                <button onClick={() => deleteAnn(ann.id)} title="Delete"
                  style={{ background:'none', border:'none', cursor:'pointer', color:t.red, flexShrink:0, opacity:.7 }}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}