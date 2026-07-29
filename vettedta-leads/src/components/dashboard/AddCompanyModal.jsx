import { useState } from 'react'
import { COUNTRIES, HEADCOUNT_BRACKETS, MANUAL_SIGNAL_TYPES, SPECIALISMS } from '../../lib/constants'
import { createCompany, triggerEnrichCompany } from '../../lib/api'

const initialForm = {
  name: '',
  domain: '',
  country: 'Ireland',
  headcountBracket: '',
  signalType: 'funding',
  signalHeadline: '',
  signalDate: new Date().toISOString().slice(0, 10),
  linkedinCompanyUrl: '',
  specialismBucket: [],
  notes: '',
}

export default function AddCompanyModal({ onClose, onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const toggleSpecialism = (value) => {
    setForm((f) => ({
      ...f,
      specialismBucket: f.specialismBucket.includes(value)
        ? f.specialismBucket.filter((s) => s !== value)
        : [...f.specialismBucket, value],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.domain.trim()) {
      setError('Company name and domain are required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const company = await createCompany({
        name: form.name.trim(),
        domain: form.domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
        country: form.country,
        headcountBracket: form.headcountBracket,
        linkedinCompanyUrl: form.linkedinCompanyUrl.trim(),
        specialismBucket: form.specialismBucket,
        notes: form.notes.trim(),
        signalType: form.signalType,
        signalHeadline: form.signalHeadline.trim() || `${form.name.trim()} — manually added lead`,
        signalDate: form.signalDate,
      })

      // Domain is required by the form, so kick off enrichment in the
      // background. If it fails, the company card's own "Enrich" button
      // lets Keith retry later — don't block the modal on it.
      triggerEnrichCompany(company.id).catch(() => {})

      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 px-4 py-8">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Add company</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-700" aria-label="Close">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-700">
                Company name <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={set('name')}
                placeholder="Acme Robotics"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-700">
                Domain <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="input-field"
                value={form.domain}
                onChange={set('domain')}
                placeholder="acmerobotics.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">Country</label>
              <select className="input-field" value={form.country} onChange={set('country')}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">Company size</label>
              <select className="input-field" value={form.headcountBracket} onChange={set('headcountBracket')}>
                <option value="">Unknown</option>
                {HEADCOUNT_BRACKETS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">Signal type</label>
              <select className="input-field" value={form.signalType} onChange={set('signalType')}>
                {MANUAL_SIGNAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">Signal date</label>
              <input
                type="date"
                className="input-field"
                value={form.signalDate}
                onChange={set('signalDate')}
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-700">Signal headline</label>
              <input
                className="input-field"
                value={form.signalHeadline}
                onChange={set('signalHeadline')}
                placeholder="Raised €2m seed round — January 2026"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-700">LinkedIn company URL</label>
              <input
                className="input-field"
                value={form.linkedinCompanyUrl}
                onChange={set('linkedinCompanyUrl')}
                placeholder="https://linkedin.com/company/acme-robotics"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium text-navy-700">Specialisms</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALISMS.map((s) => {
                  const active = form.specialismBucket.includes(s)
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSpecialism(s)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                        active
                          ? 'bg-navy-700 text-white ring-navy-700'
                          : 'bg-white text-navy-600 ring-navy-200 hover:bg-navy-50'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-navy-700">Notes</label>
              <textarea
                className="input-field"
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Spotted on Frontline VC's portfolio page…"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Adding…' : 'Add company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
