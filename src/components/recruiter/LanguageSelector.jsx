import { useState } from 'react'

const LANGUAGES = [
  'French', 'German', 'Dutch', 'Spanish', 'Italian', 'Portuguese', 'Arabic',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Romanian', 'Czech',
  'Hungarian', 'Other',
]

const PROFICIENCY_OPTIONS = [
  { value: 'native',       label: 'Native'       },
  { value: 'fluent',       label: 'Fluent'       },
  { value: 'professional', label: 'Professional' },
]

const PROFICIENCY_LABELS = { native: 'Native', fluent: 'Fluent', professional: 'Professional' }

export default function LanguageSelector({ value = [], onChange }) {
  const [lang, setLang] = useState('')
  const [prof, setProf] = useState('fluent')

  const usedLanguages      = new Set(value.map(v => v.language))
  const availableLanguages = LANGUAGES.filter(l => !usedLanguages.has(l))

  function add() {
    if (!lang) return
    onChange([...value, { language: lang, proficiency: prof }])
    setLang('')
    setProf('fluent')
  }

  function remove(language) {
    onChange(value.filter(v => v.language !== language))
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Add languages you can conduct interviews and screen candidates in. English is assumed for all recruiters.
      </p>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(v => (
            <span key={v.language} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-800">
              {v.language} — {PROFICIENCY_LABELS[v.proficiency]}
              <button
                type="button"
                onClick={() => remove(v.language)}
                className="text-indigo-400 hover:text-indigo-700 transition-colors leading-none"
                aria-label={`Remove ${v.language}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {availableLanguages.length > 0 && (
        <div className="flex items-center gap-2">
          <select value={lang} onChange={e => setLang(e.target.value)} className="input text-sm flex-1">
            <option value="">Select language…</option>
            {availableLanguages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={prof} onChange={e => setProf(e.target.value)} className="input text-sm w-40">
            {PROFICIENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            type="button"
            onClick={add}
            disabled={!lang}
            className="btn-secondary text-sm px-4 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  )
}
