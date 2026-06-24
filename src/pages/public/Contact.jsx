import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'
import Seo from '../../components/Seo'

export default function Contact() {
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [message,     setMessage]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
      <h1 style="font-size:20px;font-weight:700;margin-bottom:24px">New contact form submission</h1>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td style="font-size:13px;color:#6b7280;padding:8px 0;width:100px;vertical-align:top">Name</td>
          <td style="font-size:14px;font-weight:600;color:#111827;padding:8px 0">${name}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#6b7280;padding:8px 0;vertical-align:top">Email</td>
          <td style="font-size:14px;font-weight:600;color:#111827;padding:8px 0">${email}</td>
        </tr>
      </table>
      <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px">
        <p style="font-size:13px;color:#6b7280;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Message</p>
        <p style="font-size:14px;line-height:1.7;color:#111827;margin:0;white-space:pre-line">${message}</p>
      </div>
      <p style="font-size:12px;color:#9ca3af">Sent via vettedta.com contact form</p>
    </div>`

    const { error: invokeErr } = await supabase.functions.invoke('send-email', {
      body: {
        to:      'hello@vettedta.com',
        subject: `New contact form submission from ${name}`,
        html,
        replyTo: email,
      },
    })

    if (invokeErr) {
      setError('Something went wrong — please try again or email us directly at hello@vettedta.com.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Seo
        title="Contact Us | Vetted TA"
        description="Get in touch with the Vetted TA team. Support for hiring companies and independent recruiters on the platform."
        path="/contact"
      />
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo dark /></Link>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="text-blue-300 text-sm mt-2">We'd love to hear from you</p>
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-8">
          {submitted ? (
            <p className="text-sm text-gray-700 leading-relaxed">
              Thanks — we'll be in touch soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="input resize-none"
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  placeholder="How can we help?"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Send Message'}
              </button>

              <p className="text-xs text-gray-400 pt-1">
                You can also reach us directly at{' '}
                <a href="mailto:hello@vettedta.com" className="underline hover:text-gray-600 transition-colors">
                  hello@vettedta.com
                </a>
              </p>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
