import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

// Column definitions — statuses that belong in each column
const COLUMNS = [
  { key: 'submitted',    label: 'Submitted',      statuses: ['none'],                   milestoneNum: null },
  { key: 'cv_approved',  label: 'CV Approved',    statuses: ['selected'],               milestoneNum: 1    },
  { key: 'interviewing', label: 'Interviewing',   statuses: ['scheduled', 'completed'], milestoneNum: 2    },
  { key: 'offer',        label: 'Offer Extended', statuses: ['offer_made'],             milestoneNum: null },
  { key: 'hired',        label: 'Hired',          statuses: ['accepted'],               milestoneNum: 3    },
]

// Recruiter move options — all possible target statuses
const MOVE_OPTIONS = [
  { value: 'none',       label: 'Submitted'       },
  { value: 'selected',   label: 'CV Approved'     },
  { value: 'scheduled',  label: 'Interviewing'    },
  { value: 'offer_made', label: 'Offer Extended'  },
  { value: 'accepted',   label: 'Hired'           },
  { value: 'declined',   label: 'Pass / Declined' },
]

function getInitials(c) {
  return (
    (c.candidate_first_name?.[0] ?? '') +
    (c.candidate_last_name?.[0]  ?? '')
  ).toUpperCase() || '?'
}

function getDisplayName(c) {
  const first = c.candidate_first_name
  const last  = c.candidate_last_name
  if (!first && !last) return 'Unknown'
  if (!last) return first
  return `${first} ${last[0]}.`
}

function MilestoneBadge({ milestoneNum, milestones }) {
  if (!milestoneNum) return null
  const m = (milestones ?? []).find(ms => ms.milestone_number === milestoneNum)
  if (!m) return null

  const cfg = {
    review_window: { label: `M${milestoneNum} — pending approval`, cls: 'bg-yellow-100 text-yellow-700' },
    approved:      { label: `M${milestoneNum} — releasing`,        cls: 'bg-blue-100 text-blue-700'     },
    released:      { label: `M${milestoneNum} — paid`,             cls: 'bg-green-100 text-green-700'   },
  }[m.status]

  if (!cfg) return null

  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1.5 ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function CandidateCard({ candidate, columnKey, userType, onMove }) {
  const [busy, setBusy] = useState(false)

  const currentStatuses = COLUMNS.find(c => c.key === columnKey)?.statuses ?? []
  const moveOptions     = MOVE_OPTIONS.filter(o => !currentStatuses.includes(o.value))

  async function move(newStatus) {
    setBusy(true)
    await onMove(candidate.id, newStatus)
    setBusy(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      {/* Avatar + name */}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs
                        flex items-center justify-center flex-shrink-0 select-none">
          {getInitials(candidate)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {getDisplayName(candidate)}
          </p>
          {candidate.current_job_title && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{candidate.current_job_title}</p>
          )}
        </div>
      </div>

      {/* Recruiter notes — small muted italic text */}
      {candidate.recruiter_notes && (
        <p className="text-xs text-gray-400 italic mt-2 line-clamp-2 leading-relaxed">
          "{candidate.recruiter_notes}"
        </p>
      )}

      {/* Actions */}
      {busy ? (
        <div className="flex justify-center mt-2.5">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600" />
        </div>
      ) : userType === 'hiring_manager' ? (
        /* HM: Approve CV / Pass only on Submitted column; all others are read-only */
        columnKey === 'submitted' && (
          <div className="flex gap-1.5 mt-3">
            <button
              onClick={() => move('selected')}
              className="flex-1 text-xs py-1.5 px-2 rounded-md bg-primary-600 text-white font-medium
                         hover:bg-primary-700 transition-colors"
            >
              Approve CV
            </button>
            <button
              onClick={() => move('declined')}
              className="flex-1 text-xs py-1.5 px-2 rounded-md border border-gray-200 text-gray-500
                         hover:bg-gray-50 transition-colors"
            >
              Pass
            </button>
          </div>
        )
      ) : (
        /* Recruiter: free move via select */
        <select
          value=""
          onChange={e => { if (e.target.value) move(e.target.value) }}
          className="w-full mt-2.5 text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white
                     text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
        >
          <option value="">Move to…</option>
          {moveOptions.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </div>
  )
}

export default function PipelineTab({ assignmentId, userType, milestones }) {
  const [candidates, setCandidates] = useState([])
  const [loading,    setLoading]    = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('candidate_profiles')
      .select('id, candidate_first_name, candidate_last_name, current_job_title, recruiter_notes, interview_status, created_at')
      .eq('job_recruiter_assignment_id', assignmentId)
      .neq('interview_status', 'declined')
      .order('created_at', { ascending: true })
    setCandidates(data ?? [])
    setLoading(false)
  }, [assignmentId])

  useEffect(() => { load() }, [load])

  async function onMove(candidateId, newStatus) {
    const { error } = await supabase
      .from('candidate_profiles')
      .update({ interview_status: newStatus })
      .eq('id', candidateId)
    if (error) { console.error('[PipelineTab] update failed:', error); return }
    setCandidates(prev =>
      newStatus === 'declined'
        ? prev.filter(c => c.id !== candidateId)
        : prev.map(c => c.id === candidateId ? { ...c, interview_status: newStatus } : c)
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-medium text-gray-500">No candidates in the pipeline yet.</p>
        {userType === 'recruiter' && (
          <p className="text-xs text-gray-400 mt-1">Log candidates from the Overview tab to populate the pipeline.</p>
        )}
      </div>
    )
  }

  return (
    <div>
      {userType === 'hiring_manager' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 text-sm text-blue-700">
          Your recruiter manages the candidate pipeline. Approve CVs here to confirm candidates for the interview stage.
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(col => {
            const colCandidates = candidates.filter(c => col.statuses.includes(c.interview_status))
            return (
              <div key={col.key} className="w-56 flex-shrink-0">
                {/* Column header */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {col.label}
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 font-medium
                                   leading-none min-w-[1.25rem] text-center">
                    {colCandidates.length}
                  </span>
                </div>
                <MilestoneBadge milestoneNum={col.milestoneNum} milestones={milestones} />

                {/* Cards */}
                <div className={`space-y-2.5 ${col.milestoneNum ? 'mt-2' : 'mt-3'}`}>
                  {colCandidates.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg h-20
                                    flex items-center justify-center">
                      <span className="text-xs text-gray-300">Empty</span>
                    </div>
                  ) : (
                    colCandidates.map(c => (
                      <CandidateCard
                        key={c.id}
                        candidate={c}
                        columnKey={col.key}
                        userType={userType}
                        onMove={onMove}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
