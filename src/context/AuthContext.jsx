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

    // Diagnostic: show every field available on the auth user metadata objects
    console.log('FULL AUTH USER METADATA', {
      user_metadata: authUser.user_metadata,
      app_metadata:  authUser.app_metadata,
      id:            authUser.id,
      email:         authUser.email,
    })

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

    // Try user_metadata first (maps to raw_user_meta_data in auth.users),
    // then app_metadata as a secondary fallback
    const fallbackType =
      authUser.user_metadata?.user_type ??
      authUser.app_metadata?.user_type ??
      null
    console.log('[AuthContext] user_type from JWT metadata:', fallbackType,
      '| user_metadata.user_type:', authUser.user_metadata?.user_type,
      '| app_metadata.user_type:',  authUser.app_metadata?.user_type)
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
    firstName, lastName, sectors, markets, specialisms, ...rest
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

    // Give the handle_new_user trigger time to insert into public.users
    // before profile inserts that FK-reference it run.
    await new Promise(resolve => setTimeout(resolve, 500))

    if (type === 'recruiter') {
      try {
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
            availability_status:        rest.availability_status ?? 'available',
            bio:                        rest.bio ?? null,
            recent_track_record:        rest.recent_track_record ?? null,
          })
          .select('id')
          .single()
        if (rpError) {
          console.error('[signup] recruiter_profiles insert FULL ERROR:', {
            message: rpError.message,
            code:    rpError.code,
            details: rpError.details,
            hint:    rpError.hint,
            full:    rpError,
          })
        } else {
          const profileId = rpData.id
          if (sectors?.length > 0) {
            const { error: secErr } = await supabase.from('recruiter_sectors').insert(
              sectors.map(sector_name => ({ recruiter_profile_id: profileId, sector_name }))
            )
            if (secErr) console.error('[AuthContext] recruiter_sectors insert failed:', secErr)
          }
          if (markets?.length > 0) {
            const { error: locErr } = await supabase.from('recruiter_locations').insert(
              markets.map(country => ({ recruiter_profile_id: profileId, country }))
            )
            if (locErr) console.error('[AuthContext] recruiter_locations insert failed:', locErr)
          }
          if (specialisms?.length > 0) {
            const { error: spErr } = await supabase.from('recruiter_specialisms').insert(
              specialisms.map(specialism_category_id => ({
                recruiter_profile_id: profileId,
                specialism_category_id,
              }))
            )
            if (spErr) console.error('[AuthContext] recruiter_specialisms insert failed:', spErr)
          }
          try {
            await supabase.functions.invoke('send-email', {
              body: {
                to:      'notifications@vettedta.com',
                subject: `New recruiter application: ${firstName ?? ''} ${lastName ?? ''}`.trim(),
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
                  <h1 style="font-size:20px;font-weight:700;margin-bottom:24px">New recruiter application</h1>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;width:140px;vertical-align:top">Name</td>
                      <td style="font-size:14px;font-weight:600;color:#111827;padding:8px 0">${firstName ?? ''} ${lastName ?? ''}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">Email</td>
                      <td style="font-size:14px;font-weight:600;color:#111827;padding:8px 0">${email}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">LinkedIn</td>
                      <td style="font-size:14px;color:#111827;padding:8px 0">${rest.linkedin_url ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">Years experience</td>
                      <td style="font-size:14px;color:#111827;padding:8px 0">${rest.years_experience ?? '—'}</td>
                    </tr>
                  </table>
                  <a href="https://www.vettedta.com/admin/vetting"
                     style="display:inline-block;background:#4f46e5;color:#ffffff;padding:13px 26px;
                            border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
                    Review in Vetting Panel →
                  </a>
                  <p style="margin-top:40px;font-size:13px;color:#6b7280">Vetted TA</p>
                </div>`,
              },
            })
          } catch (e) {
            console.error('[AuthContext] recruiter admin notification email failed:', e)
          }
        }
      } catch (e) {
        console.error('[AuthContext] recruiter profile creation error:', e)
      }
    } else if (type === 'hiring_manager') {
      try {
        const { error: hcpError } = await supabase.from('hiring_company_profiles').insert({
          user_id:        userId,
          company_name:   rest.companyName ?? '',
          company_domain: rest.companyDomain ?? null,
          website:        rest.website ?? null,
          industry:       rest.industry ?? null,
          company_size:   rest.companySize ?? null,
          country:        rest.country ?? null,
          trust_tier:     'new',
        })
        if (hcpError) {
          console.error('[AuthContext] hiring_company_profiles insert failed:', hcpError)
        } else {
          try {
            await supabase.functions.invoke('send-email', {
              body: {
                to:      'notifications@vettedta.com',
                subject: `New hiring company signup: ${rest.companyName ?? ''}`.trim(),
                html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
                  <h1 style="font-size:20px;font-weight:700;margin-bottom:24px">New hiring company signup</h1>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;width:140px;vertical-align:top">Company</td>
                      <td style="font-size:14px;font-weight:600;color:#111827;padding:8px 0">${rest.companyName ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">Email</td>
                      <td style="font-size:14px;font-weight:600;color:#111827;padding:8px 0">${email}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">Domain</td>
                      <td style="font-size:14px;color:#111827;padding:8px 0">${rest.companyDomain ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">Industry</td>
                      <td style="font-size:14px;color:#111827;padding:8px 0">${rest.industry ?? '—'}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">Country</td>
                      <td style="font-size:14px;color:#111827;padding:8px 0">${rest.country ?? '—'}</td>
                    </tr>
                  </table>
                  <p style="margin-top:40px;font-size:13px;color:#6b7280">Vetted TA</p>
                </div>`,
              },
            })
          } catch (e) {
            console.error('[AuthContext] hiring manager admin notification email failed:', e)
          }
        }
      } catch (e) {
        console.error('[AuthContext] hiring company profile creation error:', e)
      }
    }

    return authData
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    if (data.user) {
      console.log('FULL AUTH USER METADATA (login)', {
        user_metadata: data.user.user_metadata,
        app_metadata:  data.user.app_metadata,
        id:            data.user.id,
        email:         data.user.email,
      })

      // Seed resolvedUserType from JWT before attempting DB — ensures it is
      // always defined even if the DB query times out
      let resolvedUserType =
        data.user.user_metadata?.user_type ??
        data.user.app_metadata?.user_type ??
        null

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
        console.log('[AuthContext] login — resolvedUserType from JWT:', resolvedUserType,
          '| user_metadata.user_type:', data.user.user_metadata?.user_type,
          '| app_metadata.user_type:',  data.user.app_metadata?.user_type)
        setUserType(resolvedUserType)
      }

      if (resolvedUserType === 'recruiter') {
        supabase
          .from('recruiter_profiles')
          .update({ last_active_at: new Date().toISOString() })
          .eq('user_id', data.user.id)
          .then(() => {})
      }

      return { ...data, resolvedUserType }
    }

    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const value = { user, userType, dbUser, loading, signup, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
