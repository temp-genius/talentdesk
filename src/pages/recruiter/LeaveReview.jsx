import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none p-0.5"
          aria-label={`${star} star`}
        >
          <svg
            className={`w-10 h-10 transition-colors ${
              star <= (hovered || value) ? 'text-yellow-400' : 'text-gray-200'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-500 self-center">{value} / 5</span>
      )}
    </div>
  )
}

export default function RecruiterLeaveReview() {
  const { assignmentId } = useParams()
  const { user }         = useAuth()
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formErr,    setFormErr]    = useState('')

  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')

  const load = useCallback(async () => {
    const { data: row, error: err } = await supabase
      .from('job_recruiter_assignments')
      .select('id, jobs(id, title)')
      .eq('id', assignmentId)
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    setData(row)
    setLoading(false)
  }, [assignmentId])

  useEffect(() => { if (user) load() }, [user, load])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormErr('')
    if (!rating) {
      setFormErr('Please select a rating before submitting.')
      return
    }
    setSubmitting(true)
    const { error: insertErr } = await supabase.from('reviews').insert({
      job_recruiter_assignment_id: assignmentId,
      reviewer_user_id:            user.id,
      reviewer_type:               'recruiter',
      overall_score:               rating,
      written_comment:             comment.trim() || null,
    })
    setSubmitting(false)
    if (insertErr) { setFormErr(insertErr.message); return }
    setSubmitted(true)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-red-600 font-medium">{error}</p>
        <Link to="/recruiter/dashboard" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          ← Dashboard
        </Link>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Thank you for your review!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your feedback helps great hiring companies stand out on TalentDesk.
        </p>
        <Link to="/recruiter/dashboard" className="btn-primary w-full block text-center">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )

  const jobTitle = data?.jobs?.title

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link
            to={`/recruiter/job/${assignmentId}`}
            className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0"
          >
            ← Job Overview
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">Leave a Review</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Rate this engagement</h1>
          {jobTitle && (
            <p className="text-sm text-gray-500 mt-1">How was the experience working on <strong>{jobTitle}</strong>?</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall rating *
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Written review{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="input resize-none"
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience — would you work with this company again?"
            />
          </div>

          {formErr && <p className="text-sm text-red-600">{formErr}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            <Link to={`/recruiter/job/${assignmentId}`} className="btn-secondary flex-1 text-center">
              Skip
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
