import { useState } from 'react'

export default function SpecialismSelector({ categories, selected, onChange }) {
  const sectors = [...new Set(categories.map(c => c.sector))]
  const [expanded, setExpanded] = useState({})

  function toggleExpand(sector) {
    setExpanded(prev => ({ ...prev, [sector]: !prev[sector] }))
  }

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">
        <span className="font-semibold text-gray-800">{selected.length}</span>{' '}
        specialism{selected.length !== 1 ? 's' : ''} selected
      </p>
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
        {sectors.map(sector => {
          const specs = categories.filter(c => c.sector === sector)
          const isOpen = !!expanded[sector]
          const count = specs.filter(s => selected.includes(s.id)).length
          return (
            <div key={sector}>
              <button
                type="button"
                onClick={() => toggleExpand(sector)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-800">{sector}</span>
                <div className="flex items-center gap-2">
                  {count > 0 && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
                      {count}
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 bg-white">
                  {specs.map(spec => (
                    <label
                      key={spec.id}
                      className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(spec.id)}
                        onChange={() => toggle(spec.id)}
                        className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                      />
                      {spec.specialism_name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
