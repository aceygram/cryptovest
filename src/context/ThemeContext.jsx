import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({})

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('st-theme') || 'dark')

  useEffect(() => {
    localStorage.setItem('st-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export const tokens = (theme) => {
  const dark = theme === 'dark'
  return {
    bg:          dark ? '#020817'  : '#f0f4f8',
    bgSub:       dark ? '#020c1b'  : '#e2e8f0',
    card:        dark ? '#030e1f'  : '#ffffff',
    cardBorder:  dark ? '#0f2040'  : '#cbd5e1',
    input:       dark ? '#020c1b'  : '#f8fafc',
    inputBorder: dark ? '#0f2a4a'  : '#cbd5e1',
    hover:       dark ? '#0f2040'  : '#f1f5f9',
    text:        dark ? '#f1f5f9'  : '#0f172a',
    textSub:     dark ? '#475569'  : '#64748b',
    textMuted:   dark ? '#334155'  : '#94a3b8',
    nav:         dark ? 'rgba(2,8,23,.97)' : 'rgba(255,255,255,.97)',
    navBorder:   dark ? '#0f2040'  : '#e2e8f0',
    shadow:      dark ? '0 24px 60px rgba(0,0,0,.5)' : '0 24px 60px rgba(0,0,0,.08)',
    cyan:   '#00d4ff',
    green:  '#00ff88',
    red:    '#ef4444',
    yellow: '#f59e0b',
    blue:   '#3b82f6',
    purple: '#8b5cf6',
    grad:   'linear-gradient(135deg,#00d4ff,#00ff88)',
  }
}