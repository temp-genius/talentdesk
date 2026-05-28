import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const withTimeout = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
])

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null)
  const [userType, setUserType] = useState(null)
  const [dbUser,   setDbUser]   = useState(null)
  const [loading,  setLoading]  = useState(true)

  async function loadDbUser(authUser) {
    if (!authUser) {
      setDbUser(null)
      setUserType(null)
      return
    }

    try {
      const { data } = await withTimeout(
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        2000
      )
      if (data) {
        console.log('[AuthContext] user_type from DB:', data.user_type)
        setDbUser(data)
        setUserType(data.user_type)
        return
      }
    } catch (e) {
      console.log('[AuthContext] DB query timed out or failed, using JWT fallback:', e.message)
    }

    const fallbackType = authUser.user_metadata?.user_type ?? null
    console.log('[AuthContext] user_type from JWT metadata:', fallbackType)
    setDbUser(null)
    setUserType(fallbackType)
  }

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!mounted) return
        if (error) console.error('[AuthContext] getSession error:', error)
        setUser(session?.user ?? null)
        try {
          await loadDbUser(session?.user ?? null)
        } catch (e) {
          console.error('[AuthContext] loadDbUser error during init:', e)
        }
      } catch (e) {
        console.error('[AuthContext] initAuth error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        try {
          setUser(session?.user ?? null)
          try {
            await loadDbUser(session?.user ?? null)
          } catch (e) {
            console.error('[AuthContext] loadDbUser error in listener:', e)
          }
        } finally {
          if (mounted) setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signup({
    email, password, userType: type,
    firstName, lastName, sectors, markets, ...rest
  }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { user_type: type } },
    })
    if (authError) throw authError

    const userId = authData.user?.id
    if (!userId) throw new Error('Signup failed — no user ID returned')

    if (!authData.session) {
      return { ...authData, emailConfirmationRequired: true }
    }

    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      email,
      user_type: type,
      email_verified: false,
      status: 'pending',
    })
    if (userError) throw userError

    if (type === 'recruiter') {
      const { data: rpData, error: rpError } = await supabase
        .from('recruiter_profiles')
        .insert({
          user_id:                    userId,
          first_name:                 firstName ?? null,
          last_name:                  lastName ?? null,
          status:                     'pending',
          years_experience:           rest.years_experience ?? null,
          linkedin_url:               rest.linkedin_url ?? null,
          linkedin_network_size_tier: rest.linkedin_network_size_tier || null,
          preferred_fee_percentage:   rest.preferred_fee_percentage ?? null,
          availability_status:        rest.availability_status ?? 'available',
          bio:                        rest.bio ?? null,
        })
        .select('id')
        .single()
      if (rpError) throw rpError

      const profileId = rpData.id

      if (sectors?.length > 0) {
        const { error: secErr } = await supabase.from('recruiter_sectors').insert(
          sectors.map(sector_name => ({ recruiter_profile_id: profileId, sector_name }))
        )
        if (secErr) throw secErr
      }

      if (markets?.length > 0) {
        const { error: locErr } = await supabase.from('recruiter_locations').insert(
          markets.map(country => ({ recruiter_profile_id: profileId, country }))
        )
        if (locErr) throw locErr
      }
    } else if (type === 'hiring_manager') {
      const { error: hcpError } = await supabase.from('hiring_company_profiles').insert({
        user_id:      userId,
        company_name: rest.companyName ?? '',
        company_domain: rest.companyDomain ?? null,
        website:      rest.website ?? null,
        industry:     rest.industry ?? null,
        company_size: rest.companySize ?? null,
        country:      rest.country ?? null,
      })
      if (hcpError) throw hcpError
    }

    return authData
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    if (data.user) {
      let resolvedUserType = data.user.user_metadata?.user_type ?? null

      try {
        const { data: row } = await withTimeout(
          supabase.from('users').select('*').eq('id', data.user.id).single(),
          2000
        )
        if (row) {
          console.log('[AuthContext] login — user_type from DB:', row.user_type)
          setDbUser(row)
          setUserType(row.user_type)
          resolvedUserType = row.user_type
        }
      } catch (e) {
        console.log('[AuthContext] login — DB query timed out or failed, using JWT fallback:', e.message)
        console.log('[AuthContext] login — user_type from JWT metadata:', resolvedUserType)
        setUserType(resolvedUserType)
      }

      return { ...data, resolvedUserType }
    }

    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setDbUser(null)
    setUserType(null)
  }

  const value = { user, userType, dbUser, loading, signup, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
