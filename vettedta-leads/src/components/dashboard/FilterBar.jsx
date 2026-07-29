import {
  COUNTRIES,
  DATE_RANGES,
  HEADCOUNT_BRACKETS,
  OUTREACH_STATUSES,
  SIGNAL_TYPES,
  SPECIALISMS,
} from '../../lib/constants'

const EMPTY_FILTERS = {
  signalType: '',
  country: '',
  headcount: '',
  specialism: '',
  status: '',
  dateRange: '30',
}

export { EMPTY_FILTERS }

function Select({ label, value, onChange, options }) {
  return (
    <div className="min-w-[10rem] flex-1">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy-400">
        {label}
      </label>
      <select className="input-field" value={value} onChange={onChange}>
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function FilterBar({ filters, onChange }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  return (
    <div className="card flex flex-wrap items-end gap-4 p-4">
      <Select label="Signal type" value={filters.signalType} onChange={set('signalType')} options={SIGNAL_TYPES} />
      <Select label="Location" value={filters.country} onChange={set('country')} options={COUNTRIES} />
      <Select label="Company size" value={filters.headcount} onChange={set('headcount')} options={HEADCOUNT_BRACKETS} />
      <Select label="Specialism" value={filters.specialism} onChange={set('specialism')} options={SPECIALISMS} />
      <Select label="Status" value={filters.status} onChange={set('status')} options={OUTREACH_STATUSES} />
      <div className="min-w-[10rem] flex-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy-400">
          Date range
        </label>
        <select className="input-field" value={filters.dateRange} onChange={set('dateRange')}>
          {DATE_RANGES.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-secondary" onClick={() => onChange(EMPTY_FILTERS)}>
        Clear filters
      </button>
    </div>
  )
}
