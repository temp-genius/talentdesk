import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function StripeOnboarding() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')

  const [connecting, setConnecting] = useState(false)
  const [error, setError]           = useState('')

  async function handleConnect() {
    if (!user) return
    setConnecting(true)
    setError('')

    const { data, error: fnErr } = await supabase.functions.invoke('stripe-connect-onboard', {
      body: {
        user_id:     user.id,
        return_url:  `${window.location.origin}/recruiter/stripe-onboarding?status=complete`,
        refresh_url: `${window.location.origin}/recruiter/stripe-onboarding?status=refresh`,
      },
    })

    setConnecting(false)

    if (fnErr || data?.error) {
      setError(fnErr?.message ?? data?.error ?? 'Failed to start onboarding. Please try again.')
      return
    }

    if (data?.url) {
      window.location.href = data.url
    }
  }

  if (status === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Bank Account Connected!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your Stripe account is set up. Payments will be transferred directly to your bank account when milestones are released.
          </p>
          <Link to="/recruiter/dashboard" className="btn-primary block text-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to="/recruiter/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            ← Dashboard
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">Connect Bank Account</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Connect Your Bank Account</h1>
            <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
              To receive milestone payments you need to connect your bank account via Stripe.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Milestone payments are held securely in escrow by TalentDesk</li>
              <li>• When a milestone is released, funds transfer directly to your bank</li>
              <li>• TalentDesk retains a 15% platform fee on each milestone</li>
              <li>• Payments typically arrive within 2–3 business days</li>
            </ul>
          </div>

          {status === 'refresh' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                Your onboarding link expired. Click below to generate a new one.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="btn-primary w-full py-3 text-base disabled:opacity-50"
          >
            {connecting ? 'Preparing…' : 'Connect with Stripe →'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            You'll be redirected to Stripe to complete identity verification and bank account setup.
          </p>
        </div>
      </div>
    </div>
  )
}
