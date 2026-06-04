import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import SpecialismSelector from '../../components/recruiter/SpecialismSelector'
import OnboardingModal from '../../components/onboarding/OnboardingModal'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

const STATUS_STYLES = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended:'bg-gray-100 text-gray-700',
}

const STATUS_LABELS = {
  pending:  'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended:'Suspended',
}

const MS_STATUS_LABELS = {
  pending:       'Shortlist Pending',
  review_window: 'In Review',
  approved:      'Shortlist Approved',
  released:      'M1 Released',
}

function currentMilestoneLabel(milestones) {
  if (!milestones || milestones.length === 0) return null
  const sorted = [...milestones].sort((a, b) => a.milestone_number - b.milestone_number)
  const active = sorted.find(m => m.status !== 'released')
  return active ? MS_STATUS_LABELS[active.status] ?? active.status : 'Complete'
}

export default function RecruiterDashboard() {
  const { user, logout } = useAuth()
  const [profile,        setProfile]       = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [assignments,    setAssignments]   = useState([])
  const [loadingJobs,    setLoadingJobs]   = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [stripeError,      setStripeError]      = useState('')

  // Specialism editing
  const [allCategories,      setAllCategories]      = useState([])
  const [currentSpecialisms, setCurrentSpecialisms] = useState([])
  const [editingSpecialisms, setEditingSpecialisms] = useState(false)
  const [draftSpecialisms,   setDraftSpecialisms]   = useState([])
  const [savingSpecialisms,  setSavingSpecialisms]  = useState(false)

  // Load recruiter profile — retry up to 3 times with 1500ms gaps to allow DB trigger to complete
  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function fetchWithRetry() {
      for (let attempt = 1; attempt <= 3; attempt++) {
        if (cancelled) return
        try {
          const { data, error } = await supabase
            .from('recruiter_profiles')
            .select('id, first_name, last_name, bio, headline, status, availability_status, total_placements, stripe_account_id')
            .eq('user_id', user.id)
            .maybeSingle()

          if (cancelled) return

          if (error) {
            console.warn('[RecruiterDashboard] profile fetch error:', error.message, error.code)
            setProfile(null)
            setLoadingProfile(false)
            return
          }

          if (data) {
            setProfile(data)
            setLoadingProfile(false)
            return
          }

          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1500))
          }
        } catch (err) {
          if (cancelled) return
          console.error('[RecruiterDashboard] profile fetch threw:', err)
          setProfile(null)
          setLoadingProfile(false)
          return
        }
      }

      if (!cancelled) {
        setProfile(null)
        setLoadingProfile(false)
      }
    }

    fetchWithRetry()
    return () => { cancelled = true }
  }, [user])

  // Load specialism categories + current specialisms once profile is approved
  useEffect(() => {
    if (!profile?.id || profile.status !== 'approved') return
    supabase
      .from('specialism_categories')
      .select('id, sector, specialism_name')
      .order('display_order')
      .then(({ data }) => { if (data) setAllCategories(data) })
    supabase
      .from('recruiter_specialisms')
      .select('specialism_category_id')
      .eq('recruiter_profile_id', profile.id)
      .then(({ data }) => {
        if (data) setCurrentSpecialisms(data.map(s => s.specialism_category_id))
      })
  }, [profile?.id, profile?.status])

  async function saveSpecialisms() {
    setSavingSpecialisms(true)
    await supabase
      .from('recruiter_specialisms')
      .delete()
      .eq('recruiter_profile_id', profile.id)
    if (draftSpecialisms.length > 0) {
      await supabase.from('recruiter_specialisms').insert(
        draftSpecialisms.map(specialism_category_id => ({
          recruiter_profile_id: profile.id,
          specialism_category_id,
        }))
      )
    }
    setCurrentSpecialisms(draftSpecialisms)
    setEditingSpecialisms(false)
    setSavingSpecialisms(false)
  }

  function startEditSpecialisms() {
    setDraftSpecialisms([...currentSpecialisms])
    setEditingSpecialisms(true)
  }

  // Load active assignments once profile id is available
  useEffect(() => {
    if (!profile?.id) return
    setLoadingJobs(true)
    supabase
      .from('job_recruiter_assignments')
      .select(`
        id, status, assigned_at,
        jobs(id, title, sector, location_country, location_type, seniority_level),
        milestones(milestone_number, status)
      `)
      .eq('recruiter_id', profile.id)
      .eq('status', 'assigned')
      .order('assigned_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setAssignments(data ?? [])
        setLoadingJobs(false)
      })
  }, [profile])

  async function connectStripe() {
    if (!user || !profile?.id) return
    setConnectingStripe(true)
    setStripeError('')
    const { data, error: fnErr } = await supabase.functions.invoke('stripe-connect-onboard', {
      body: {
        user_id: user.id,
        recruiter_profile_id: profile.id,
        return_url: 'https://www.vettedta.com/recruiter/stripe-onboarding?status=complete',
        refresh_url: 'https://www.vettedta.com/recruiter/stripe-onboarding?status=refresh',
      },
    })
    setConnectingStripe(false)
    if (fnErr || data?.error) {
      setStripeError(fnErr?.message ?? data?.error ?? 'Failed to start Stripe onboarding. Please try again.')
      return
    }
    if (data?.url) window.location.href = data.url
  }

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`
    : user?.email

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/recruiter/messages" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Messages
            </Link>
            <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loadingProfile ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your profile is being set up</h1>
            <p className="text-gray-500 text-sm max-w-sm">
              It can take a moment for your account to be ready. Please refresh the page in a few seconds.
            </p>
          </div>
        ) : (
          <>
            {/* Stripe Connect banner — approved but no bank account connected */}
            {profile.status === 'approved' && !profile.stripe_account_id && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-amber-900 mb-1">
                      Connect your bank account to receive payments
                    </h2>
                    <p className="text-sm text-amber-800 mb-4">
                      You need to connect your bank account through Stripe before any milestone payments can be released to you. This takes about 5 minutes and is required before you can receive money for completed work.
                    </p>
                    {stripeError && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
                        {stripeError}
                      </p>
                    )}
                    <button
                      onClick={connectStripe}
                      disabled={connectingStripe}
                      className="btn-primary disabled:opacity-50"
                    >
                      {connectingStripe ? 'Preparing…' : 'Connect with Stripe →'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stripe Connected badge */}
            {profile.status === 'approved' && profile.stripe_account_id && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-6">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Bank account connected.</span>{' '}
                  Payments will transfer within 2 business days of each milestone release.
                </p>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
              </h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Application status */}
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Application Status
                </h2>
                {profile ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${STATUS_STYLES[profile.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[profile.status] ?? profile.status}
                      </span>
                    </div>
                    {profile.status === 'pending' && (
                      <p className="text-sm text-gray-500 mt-3">
                        Your application is being reviewed. We'll notify you once assessed, usually within 2–3 business days.
                      </p>
                    )}
                    {profile.status === 'approved' && (
                      <p className="text-sm text-gray-500 mt-3">
                        Your profile is live. You can now be matched with exclusive roles.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Profile not found</p>
                )}
              </div>

              {/* Profile card */}
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Your Profile
                </h2>
                <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
                {profile?.headline && (
                  <p className="text-xs text-gray-500 mt-0.5 mb-2">{profile.headline}</p>
                )}
                {profile?.availability_status && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize
                    ${{ available: 'bg-green-100 text-green-700', limited: 'bg-amber-100 text-amber-700', unavailable: 'bg-gray-100 text-gray-500' }[profile.availability_status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {profile.availability_status}
                  </span>
                )}
                <Link to="/recruiter/profile/edit" className="btn-secondary text-xs w-full block text-center mt-3">
                  Edit Profile
                </Link>
              </div>

              {/* Stats card */}
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Stats
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total placements</dt>
                    <dd className="text-gray-900 font-medium">{profile?.total_placements ?? 0}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Active assignments</dt>
                    <dd className="text-gray-900 font-medium">{assignments.length}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Bio completeness warning */}
            {profile?.status === 'approved' && !profile?.bio && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-amber-800">
                  Your profile is incomplete. Add a bio and specialisms to appear in search results.
                </p>
                <Link to="/recruiter/profile/edit" className="text-sm font-medium text-amber-800 underline whitespace-nowrap ml-4">
                  Complete your profile
                </Link>
              </div>
            )}

            {/* Specialisms */}
            {profile?.status === 'approved' && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Specialisms</h2>
                  {!editingSpecialisms && (
                    <button onClick={startEditSpecialisms} className="text-xs text-primary-600 hover:underline">
                      {currentSpecialisms.length > 0 ? 'Edit' : 'Add Specialisms'}
                    </button>
                  )}
                </div>

                {editingSpecialisms ? (
                  <div className="space-y-4">
                    <SpecialismSelector
                      categories={allCategories}
                      selected={draftSpecialisms}
                      onChange={setDraftSpecialisms}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveSpecialisms}
                        disabled={savingSpecialisms}
                        className="btn-primary flex-1 text-sm"
                      >
                        {savingSpecialisms ? 'Saving…' : 'Save Specialisms'}
                      </button>
                      <button
                        onClick={() => setEditingSpecialisms(false)}
                        className="btn-secondary flex-1 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : currentSpecialisms.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    No specialisms added yet. Add them so hiring managers can find you.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(
                      allCategories
                        .filter(c => currentSpecialisms.includes(c.id))
                        .reduce((acc, c) => {
                          if (!acc[c.sector]) acc[c.sector] = []
                          acc[c.sector].push(c.specialism_name)
                          return acc
                        }, {})
                    ).map(([sector, specs]) => (
                      <div key={sector}>
                        <p className="text-xs font-semibold text-gray-500 mb-1">{sector}</p>
                        <div className="flex flex-wrap gap-1">
                          {specs.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active assignments */}
            {profile?.status === 'approved' && (
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Active Assignments
                </h2>

                {loadingJobs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                  </div>
                ) : assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">No active assignments</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Assignments appear here once a hiring manager starts a job with you
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignments.map(a => (
                      <Link
                        key={a.id}
                        to={`/recruiter/job/${a.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50
                                   hover:bg-gray-100 transition-colors no-underline"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.jobs?.title}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5">
                            {a.jobs?.sector && <span>{a.jobs.sector}</span>}
                            {a.jobs?.location_country && <span>{a.jobs.location_country}</span>}
                            {a.jobs?.location_type && <span className="capitalize">{a.jobs.location_type}</span>}
                            {a.milestones?.length > 0 && (
                              <span className="text-primary-600 font-medium">
                                · {currentMilestoneLabel(a.milestones)}
                              </span>
                            )}
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <OnboardingModal userType="recruiter" />
    </main>
  )
}
