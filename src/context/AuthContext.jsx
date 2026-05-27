import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null) // 'recruiter' | 'hiring_manager' | 'admin'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setUserType(session?.user?.user_metadata?.user_type ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setUserType(session?.user?.user_metadata?.user_type ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signup({ email, password, userType: type, ...metadata }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { user_type: type, ...metadata },
      },
    })
    if (error) throw error
    return data
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = { user, userType, loading, signup, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
