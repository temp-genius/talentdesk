import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import OnboardingModal from '../../components/onboarding/OnboardingModal'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

const MS_STATUS_LABELS = {
  pending:       'Shortlist Pending',
  review_window: 'Shortlist In Review',
  approved:      'Shortlist Approved',
  released:      'M1 Released',
}

function activeLabel(milestones) {
  if (!milestones || milestones.length === 0) return null
  const sorted = [...milestones].sort((a, b) => a.milestone_number - b.milestone_number)
  const active = sorted.find(m => m.status !== 'released')
  return active ? MS_STATUS_LABELS[active.status] ?? active.status : 'Complete'
}

export default function HiringManagerDashboard() {
  const { user, logout } = useAuth()
  const [profile,       setProfile]      = useState(null)
  const [loadingProfile, setLoadingPro]  = useState(true)
  const [activeJobs,    setActiveJobs]   = useState([])
  const [loadingJobs,   setLoadingJobs]  = useState(false)
  const [openJobs,      setOpenJobs]     = useState([])
  const [unreadCount,   setUnreadCount]  = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_user_id', user.id)
      .is('read_at', null)
      .then(({ count }) => { if (count != null) setUnreadCount(count) })
  }, [user])

  // Load company profile (with id)
  useEffect(() => {
    if (!user) return
    supabase
      .from('hiring_company_profiles')
      .select('id, company_name, industry, country, trust_tier')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoadingPro(false)
      })
  }, [user])

  // Load open roles with proposal counts once profile id is available
  useEffect(() => {
    if (!profile?.id) return
    supabase
      .from('jobs')
      .select('id, title, job_proposals(status)')
      .eq('hiring_company_id', profile.id)
      .eq('status', 'open_for_proposals')
      .then(({ data }) => { setOpenJobs(data ?? []) })
  }, [profile])

  // Load active assignments once profile id is available
  useEffect(() => {
    if (!profile?.id) return
    setLoadingJobs(true)
    supabase
      .from('job_recruiter_assignments')
      .select(`
        id, status,
        jobs!inner(id, title, hiring_company_id),
        recruiter_profiles(first_name, last_name),
        milestones(milestone_number, status)
      `)
      .eq('jobs.hiring_company_id', profile.id)
      .eq('status', 'assigned')
      .order('assigned_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setActiveJobs(data ?? [])
        setLoadingJobs(false)
      })
  }, [profile])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/jobs"     className="text-sm text-gray-500 hover:text-gray-900 transition-colors">My Jobs</Link>
            <Link to="/messages" className="relative inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Messages
              {unreadCount > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
              )}
            </Link>
            <Link to="/browse-recruiters" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Browse</Link>
            <Link to="/post-job" className="btn-primary text-sm">Post a Role</Link>
            <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
          </div>
          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/post-job" className="btn-primary text-sm">Post a Role</Link>
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 px-6 py-4 flex flex-col gap-3 bg-white">
            <Link to="/jobs" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}>My Jobs</Link>
            <Link to="/messages" className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}>
              Messages
              {unreadCount > 0 && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
            </Link>
            <Link to="/browse-recruiters" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}>Browse</Link>
            <button className="text-left text-sm text-gray-700 hover:text-gray-900 transition-colors"
              onClick={logout}>Sign out</button>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loadingProfile ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">{user?.email}</p>
            </div>

            {/* Browse CTA */}
            <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-xl p-6 mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Find your next specialist recruiter</h2>
                <p className="text-primary-100 text-sm mt-0.5">
                  Browse our curated network of vetted independent recruiters
                </p>
              </div>
              <Link
                to="/browse-recruiters"
                className="flex-shrink-0 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5
                           rounded-lg hover:bg-primary-50 transition-colors shadow-sm"
              >
                Browse Recruiters →
              </Link>
            </div>

            {/* Dashboard grid */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Company profile */}
              <div className="card">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Company Profile
                </h3>
                {profile ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Company</dt>
                      <dd className="font-medium text-gray-900">{profile.company_name}</dd>
                    </div>
                    {profile.industry && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Industry</dt>
                        <dd className="font-medium text-gray-900">{profile.industry}</dd>
                      </div>
                    )}
                    {profile.country && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Country</dt>
                        <dd className="font-medium text-gray-900">{profile.country}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Trust tier</dt>
                      <dd className="font-medium text-gray-900 capitalize">{profile.trust_tier ?? 'New'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-400">Company profile not found.</p>
                )}
              </div>

              {/* My Active Jobs */}
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    My Active Jobs
                  </h3>
                  <div className="flex items-center gap-2">
                    <Link to="/jobs" className="text-xs text-primary-600 hover:underline">View all</Link>
                    <Link to="/post-job" className="btn-primary text-xs px-3 py-1.5">Post a Role</Link>
                  </div>
                </div>

                {loadingJobs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                  </div>
                ) : activeJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">No active jobs yet</p>
                    <p className="text-xs text-gray-400 mt-1">Post your first role to start receiving CV submissions</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeJobs.map(a => (
                      <Link
                        key={a.id}
                        to={`/job/${a.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50
                                   hover:bg-gray-100 transition-colors no-underline"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{a.jobs?.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {a.recruiter_profiles
                              ? `${a.recruiter_profiles.first_name ?? ''} ${a.recruiter_profiles.last_name ?? ''}`.trim()
                              : 'Recruiter'}
                            {a.milestones?.length > 0 && (
                              <> · {activeLabel(a.milestones)}</>
                            )}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Open Roles */}
              <div className="card lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Open Roles
                  </h3>
                  <Link to="/post-job" className="text-xs text-primary-600 hover:underline">+ Post a Role</Link>
                </div>

                {openJobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-600">No open roles right now</p>
                    <p className="text-xs text-gray-400 mt-1">
                      <Link to="/post-job" className="text-primary-600 hover:underline">Post a role</Link>
                      {' '}to start receiving proposals from recruiters
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {openJobs.map(job => {
                      const total       = job.job_proposals?.length ?? 0
                      const shortlisted = job.job_proposals?.filter(p => p.status === 'shortlisted').length ?? 0
                      return (
                        <Link
                          key={job.id}
                          to={`/jobs/${job.id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50
                                     hover:bg-gray-100 transition-colors no-underline"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate min-w-0 mr-3">{job.title}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {total} {total === 1 ? 'proposal' : 'proposals'}
                            </span>
                            {shortlisted > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                {shortlisted} shortlisted
                              </span>
                            )}
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
      <OnboardingModal userType="hiring_manager" />
    </div>
  )
}
