import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'cookie_consent'

export default function CookieBanner({ onConsent }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function choose(value) {
    localStorage.setItem(STORAGE_KEY, value)
    onConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-sm text-slate-300 flex-1 leading-relaxed">
          We use essential cookies to run the platform, and optional analytics cookies to
          understand usage.{' '}
          <Link to="/privacy" className="text-primary-400 hover:text-primary-300 underline">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => choose('accepted')}
            className="btn-primary text-sm px-5 py-2"
          >
            Accept
          </button>
          <button
            onClick={() => choose('declined')}
            className="text-sm px-5 py-2 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
