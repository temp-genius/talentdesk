import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { setOutreachStatus } from '../../lib/api'
import { OUTREACH_STATUSES } from '../../lib/constants'

const OUTREACH_BADGE_STYLES = {
  new: 'bg-navy-100 text-navy-700',
  connection_sent: 'bg-accent-100 text-accent-700',
  connected: 'bg-emerald-100 text-emerald-700',
  follow_up_1_sent: 'bg-amber-100 text-amber-700',
  follow_up_2_sent: 'bg-amber-100 text-amber-700',
  replied: 'bg-teal-100 text-teal-700',
  call_booked: 'bg-purple-100 text-purple-700',
  active_client: 'bg-emerald-200 text-emerald-800',
  not_now: 'bg-gray-100 text-gray-600',
  dead: 'bg-red-100 text-red-700',
}

export { OUTREACH_BADGE_STYLES }

export default function OutreachStatusSelect({ companyId, initialStatus, onChanged, className = '' }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(initialStatus ?? 'new')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = async (e) => {
    const newStatus = e.target.value
    const previous = status
    setStatus(newStatus)
    setSaving(true)
    setError(null)
    try {
      await setOutreachStatus({ companyId, userId: user.id, status: newStatus })
      onChanged?.(newStatus)
    } catch (err) {
      setStatus(previous)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <select
        value={status}
        onChange={handleChange}
        disabled={saving}
        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent-500 ${
          OUTREACH_BADGE_STYLES[status]
        } ${className}`}
      >
        {OUTREACH_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
