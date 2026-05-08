import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme, tokens } from '../context/ThemeContext'
import { X, Megaphone } from 'lucide-react'

export default function AnnouncementBanner() {
  const { theme } = useTheme()
  const t = tokens(theme)
  const [announcement, setAnnouncement] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetchAnnouncement()
  }, [])

  const fetchAnnouncement = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (data) {
      // Check if user dismissed this specific announcement
      const dismissedId = localStorage.getItem('st_dismissed_announcement')
      if (dismissedId !== data.id) setAnnouncement(data)
    }
  }

  const dismiss = () => {
    if (announcement) localStorage.setItem('st_dismissed_announcement', announcement.id)
    setDismissed(true)
  }

  if (!announcement || dismissed) return null

  const typeColors = {
    info:    { bg: '#00d4ff18', border: '#00d4ff44', text: '#00d4ff', icon: '#00d4ff' },
    warning: { bg: '#f59e0b18', border: '#f59e0b44', text: '#f59e0b', icon: '#f59e0b' },
    success: { bg: '#00ff8818', border: '#00ff8844', text: '#00ff88', icon: '#00ff88' },
    danger:  { bg: '#ef444418', border: '#ef444444', text: '#ef4444', icon: '#ef4444' },
  }
  const colors = typeColors[announcement.type] || typeColors.info

  return (
    <div style={{ background: colors.bg, borderBottom: `1px solid ${colors.border}`, padding: '.7rem 1.5rem', display: 'flex', alignItems: 'center', gap: '.9rem', fontFamily: 'DM Sans' }}>
      <Megaphone size={16} color={colors.icon} style={{ flexShrink: 0 }}/>
      <p style={{ color: colors.text, margin: 0, fontSize: '.85rem', flex: 1, lineHeight: 1.5 }}>
        <strong>{announcement.title}: </strong>{announcement.message}
      </p>
      {announcement.dismissible && (
        <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text, opacity: .7, flexShrink: 0, padding: '.2rem' }}>
          <X size={15}/>
        </button>
      )}
    </div>
  )
}