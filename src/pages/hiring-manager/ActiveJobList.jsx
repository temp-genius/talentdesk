import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/layout/Logo'

const MS_STATUS_LABELS = {
  pending:       'Shortlist Pending',
  review_window: 'Shortlist In Review',
  approved:      'Shortlist Approved',
  released:      'M1 Released',
  disputed:      'Disputed',
}

function currentMilestoneLabel(milestones) {
  if (!milestones || milestones.length === 0) return null
  const sorted = [...milestones].sort((a, b) => a.milestone_number - b.milestone_number)
  const active = sorted.find(m => m.status !== 'released')
  if (!active) return 'All Milestones Complete'
  return MS_STATUS_LABELS[active.status] ?? active.status
}

function AssignmentRow({ a }) {
  const label = currentMilestoneLabel(a.milestones)
  const recruiter = a.recruiter_profiles
  const recruiterName = recruiter
    ? `${recruiter.first_name ?? ''} ${recruiter.last_name ?? ''}`.trim() || 'Recruiter'
    : 'Recruiter'

  return (
    <Link
      to={`/job/${a.id}`}
      className="card flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow gap-2 sm:gap-4 no-underline"
    >
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 truncate">{a.jobs?.title}</p>
        <p className="text-sm text-gray-500 mt-0.5">
          {recruiterName}
          {label && <> · <span className="text-gray-400">{label}</span></>}
        </p>
      </div>
      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function ActiveJobList() {
  const { user, logout } = useAuth()
  const [assignments,    setAssignments]    = useState([])
  const [openJobs,       setOpenJobs]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    async function load() {
      const { data: profile } = await supabase
        .from('hiring_company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) { setLoading(false); return }

      const [{ data: rows }, { data: open }] = await Promise.all([
        // Existing: assignments with recruiter + milestone data
        supabase
          .from('job_recruiter_assignments')
          .select(`
            id, status, assigned_at,
            jobs!inner(id, title, hiring_company_id),
            recruiter_profiles(first_name, last_name),
            milestones(milestone_number, status)
          `)
          .eq('jobs.hiring_company_id', profile.id)
          .order('assigned_at', { ascending: false }),

        // New: jobs awaiting proposals (no assignment yet)
        supabase
          .from('jobs')
          .select('id, title, sector, created_at')
          .eq('hiring_company_id', profile.id)
          .eq('status', 'open_for_proposals')
          .order('created_at', { ascending: false }),
      ])

      setAssignments(rows ?? [])
      setOpenJobs(open ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const active    = assignments.filter(a => a.status === 'assigned')
  const completed = assignments.filter(a => a.status === 'completed')
  const cancelled = assignments.filter(a => a.status === 'cancelled')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/hiring-manager/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/messages" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Messages
            </Link>
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
            <Link to="/hiring-manager/dashboard" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/messages" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(false)}>Messages</Link>
            <button className="text-left text-sm text-gray-700 hover:text-gray-900 transition-colors"
              onClick={logout}>Sign out</button>
          </div>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">
            {assignments.length} total assignment{assignments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="space-y-10">

            {/* Awaiting Proposals */}
            {openJobs.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Awaiting Proposals ({openJobs.length})
                </h2>
                <div className="space-y-3">
                  {openJobs.map(job => (
                    <div key={job.id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{job.title}</p>
                        {job.sector && (
                          <p className="text-sm text-gray-500 mt-0.5">{job.sector}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full font-medium">
                          Open for proposals
                        </span>
                        <Link
                          to={`/jobs/${job.id}`}
                          className="text-sm text-primary-600 hover:underline font-medium"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Active ({active.length})
              </h2>
              {active.length === 0 ? (
                <div className="card text-center py-10">
                  <p className="text-sm font-medium text-gray-600 mb-1">No active assignments</p>
                  <p className="text-xs text-gray-400 mb-4">Start a job agreement from a recruiter's profile</p>
                  <Link to="/browse-recruiters" className="btn-primary text-sm">Browse Recruiters</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {active.map(a => <AssignmentRow key={a.id} a={a} />)}
                </div>
              )}
            </section>

            {/* Completed */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Completed ({completed.length})
                </h2>
                <div className="space-y-3">
                  {completed.map(a => (
                    <Link
                      key={a.id}
                      to={`/job/${a.id}`}
                      className="card flex flex-col sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow gap-2 sm:gap-4 no-underline"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{a.jobs?.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {a.recruiter_profiles
                            ? `${a.recruiter_profiles.first_name ?? ''} ${a.recruiter_profiles.last_name ?? ''}`.trim()
                            : 'Recruiter'}
                        </p>
                      </div>
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        Completed
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled */}
            {cancelled.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Cancelled ({cancelled.length})
                </h2>
                <div className="space-y-3">
                  {cancelled.map(a => (
                    <div key={a.id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 opacity-60">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{a.jobs?.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {a.recruiter_profiles
                            ? `${a.recruiter_profiles.first_name ?? ''} ${a.recruiter_profiles.last_name ?? ''}`.trim()
                            : 'Recruiter'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        Cancelled
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {assignments.length === 0 && (
              <div className="card text-center py-14">
                <p className="font-medium text-gray-600 mb-2">No job assignments yet</p>
                <p className="text-sm text-gray-400 mb-6">
                  Browse our network of specialist recruiters to get started
                </p>
                <Link to="/browse-recruiters" className="btn-primary text-sm">Browse Recruiters</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
