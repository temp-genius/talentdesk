import {
  HEADCOUNT_BRACKETS,
  OUTREACH_STATUSES,
  SIGNAL_TYPES,
  SPECIALISMS,
} from '../../lib/dummyData'

function Select({ label, options }) {
  return (
    <div className="min-w-[10rem] flex-1">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy-400">
        {label}
      </label>
      <select className="input-field" defaultValue="">
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

export default function FilterBar() {
  return (
    <div className="card flex flex-wrap items-end gap-4 p-4">
      <Select label="Signal type" options={SIGNAL_TYPES} />
      <Select label="Location" options={['Ireland', 'UK', 'Other']} />
      <Select label="Company size" options={HEADCOUNT_BRACKETS} />
      <Select label="Specialism" options={SPECIALISMS} />
      <Select label="Status" options={OUTREACH_STATUSES} />
      <div className="min-w-[10rem] flex-1">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy-400">
          Date range
        </label>
        <select className="input-field" defaultValue="30">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      <button className="btn-secondary">Clear filters</button>
    </div>
  )
}
