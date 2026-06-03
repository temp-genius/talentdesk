import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/layout/Logo'

function fmtCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

export default function OfferAcceptance() {
  const { token } = useParams()
  const [offer,    setOffer]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [result,   setResult]   = useState(null)  // 'accepted' | 'declined'
  const [working,  setWorking]  = useState(false)

  useEffect(() => {
    if (!token) { setError('Invalid link.'); setLoading(false); return }
    supabase
      .rpc('get_offer_by_token', { p_token: token })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return }
        if (!data || !data.id) { setError('Offer not found. This link may be invalid or expired.'); setLoading(false); return }
        setOffer(data)
        setLoading(false)
      })
  }, [token])

  async function respond(status) {
    setWorking(true)
    const { data, error: err } = await supabase.rpc('respond_to_offer', {
      p_token:  token,
      p_status: status,
      p_ip:     null,
    })
    setWorking(false)
    if (err || data?.error) {
      setError(err?.message ?? data?.error ?? 'Something went wrong. Please try again.')
      return
    }
    if (status === 'accepted' && offer?.id) {
      supabase.rpc('complete_placement', { p_offer_id: offer.id })
        .then(() => {
          // Release M3 to recruiter after placement is complete — fire-and-forget
          supabase.functions.invoke('stripe-release-milestone', {
            body: { offer_id: offer.id, milestone_number: 3 },
          }).catch(console.error)
        })
        .catch(console.error)
    }
    setResult(status)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Link Error</h1>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  )

  if (result === 'accepted') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Offer Accepted!</h1>
        <p className="text-gray-500 text-sm">
          Congratulations! Your acceptance has been recorded. The hiring team will be in touch shortly with next steps.
        </p>
      </div>
    </div>
  )

  if (result === 'declined') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Offer Declined</h1>
        <p className="text-gray-500 text-sm">
          We've recorded your decision. Thank you for letting us know.
        </p>
      </div>
    </div>
  )

  // Already responded
  if (offer.acceptance_status !== 'pending') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Already Responded</h1>
        <p className="text-gray-500 text-sm">
          This offer has already been {offer.acceptance_status}. No further action is needed.
        </p>
      </div>
    </div>
  )

  const roleLabel = [
    offer.seniority_level?.replace('_', '-'),
    offer.role_type,
    offer.location_type,
  ].filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · ')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 tracking-tight mb-2">
            <Logo />
          </p>
          <h1 className="text-2xl font-bold text-gray-900">You've received a job offer</h1>
          <p className="text-gray-500 text-sm mt-1">Please review the details below and accept or decline.</p>
        </div>

        {/* Offer details */}
        <div className="card space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Role</h2>
            <p className="text-xl font-bold text-gray-900">{offer.job_title}</p>
            {roleLabel && <p className="text-sm text-gray-500 mt-1">{roleLabel}</p>}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Offer Details</h2>
            <dl className="space-y-2 text-sm">
              {offer.agreed_salary && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Agreed salary</dt>
                  <dd className="font-bold text-gray-900 text-base">
                    {fmtCurrency(offer.agreed_salary, offer.currency ?? 'EUR')}
                  </dd>
                </div>
              )}
              {offer.start_date && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Start date</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(offer.start_date).toLocaleDateString('en-IE', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => respond('accepted')}
            disabled={working}
            className="btn-primary w-full py-3 text-base disabled:opacity-50"
          >
            {working ? 'Processing…' : 'Accept Offer'}
          </button>
          <button
            onClick={() => respond('declined')}
            disabled={working}
            className="btn-secondary w-full py-3 text-base disabled:opacity-50"
          >
            Decline Offer
          </button>
          <p className="text-center text-xs text-gray-400">
            By accepting you confirm your agreement to the offer terms above.
          </p>
        </div>
      </div>
    </div>
  )
}
