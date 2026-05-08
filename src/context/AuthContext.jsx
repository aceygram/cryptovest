import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

const TIMEOUT_MS = 20 * 60 * 1000 // 20 minutes of inactivity

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (!error && data) setProfile(data)
  }

  const signOut = useCallback(async () => {
    clearTimeout(timerRef.current)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  // Reset the inactivity timer on any user interaction
  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      signOut()
      // Redirect to login with a message
      window.location.href = '/login?timeout=1'
    }, TIMEOUT_MS)
  }, [signOut])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) { fetchProfile(currentUser.id); resetTimer() }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) { fetchProfile(currentUser.id); resetTimer() }
      else clearTimeout(timerRef.current)
    })

    return () => { listener.subscription.unsubscribe(); clearTimeout(timerRef.current) }
  }, [resetTimer])

  // Attach activity listeners when user is logged in
  useEffect(() => {
    if (!user) return
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    return () => events.forEach(e => window.removeEventListener(e, resetTimer))
  }, [user, resetTimer])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)