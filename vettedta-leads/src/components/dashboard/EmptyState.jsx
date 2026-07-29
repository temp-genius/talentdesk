import { Link } from 'react-router-dom'

export default function EmptyState({ hasFilters, onClearFilters, onAddCompany }) {
  if (hasFilters) {
    return (
      <div className="card flex flex-col items-center justify-center gap-3 p-16 text-center">
        <h3 className="text-lg font-semibold text-navy-900">No companies match these filters</h3>
        <p className="max-w-sm text-sm text-navy-500">
          Try widening the date range or clearing a filter.
        </p>
        <button onClick={onClearFilters} className="btn-secondary mt-2">
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <div className="card flex flex-col items-center justify-center gap-3 p-16 text-center">
      <h3 className="text-lg font-semibold text-navy-900">No companies yet</h3>
      <p className="max-w-sm text-sm text-navy-500">
        Run an RSS scan from <Link to="/settings" className="font-semibold text-accent-600 hover:text-accent-700">Settings</Link> to
        pull in fresh hiring signals, or add a company you've spotted manually.
      </p>
      <button onClick={onAddCompany} className="btn-primary mt-2">
        Add company manually
      </button>
    </div>
  )
}
