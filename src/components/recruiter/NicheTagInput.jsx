import { useState } from 'react'

const MAX_TAGS = 5

export default function NicheTagInput({ value = [], onChange }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const atMax = value.length >= MAX_TAGS

  function addTag() {
    const tag = input.trim()
    setError('')
    if (!tag) return
    if (tag.length < 2) { setError('Must be at least 2 characters.'); return }
    if (tag.length > 40) { setError('Must be 40 characters or fewer.'); return }
    if (value.some(t => t.toLowerCase() === tag.toLowerCase())) {
      setError('Already added.')
      return
    }
    onChange([...value, tag])
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  function removeTag(tag) {
    setError('')
    onChange(value.filter(t => t !== tag))
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-amber-600 hover:text-amber-900 ml-0.5 leading-none text-sm"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {atMax ? (
        <p className="text-xs text-gray-400 italic">5/5 — maximum reached</p>
      ) : (
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setError('') }}
          onKeyDown={handleKeyDown}
          placeholder="Type a niche and press Enter…"
          className="input w-full text-sm"
          maxLength={40}
        />
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <p className="text-xs text-gray-400 mt-1">
        {value.length}/{MAX_TAGS} tags{!atMax && ' — press Enter to add'}
      </p>
    </div>
  )
}
