import { Link } from 'react-router-dom'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

const SECTIONS = [
  {
    title: '1. Who We Are',
    body: 'Vetted TA is operated by Vetted TA (Ireland). We are the data controller for personal data collected through the Vetted TA platform. Contact us at privacy@vettedta.com for any privacy-related enquiries.',
  },
  {
    title: '2. What Data We Collect',
    body: 'We collect the following categories of personal data. Account data including name, email address, and password when you register. Profile data including professional background, LinkedIn URL, employment history, and specialisms for recruiters, and company information for hiring managers. Usage data including how you interact with the platform, messages sent, jobs posted, and actions taken. Payment data processed by Stripe — we do not store card numbers or bank account details directly. Communication data including messages sent through the platform between recruiters and hiring managers.',
  },
  {
    title: '3. What We Do Not Collect or Store',
    body: 'We do not store candidate CVs. CVs are transmitted directly between recruiters and hiring managers via email and are never stored on Vetted TA infrastructure. Recruiters are the data controllers for all candidate personal data they collect and process.',
  },
  {
    title: '4. How We Use Your Data',
    body: 'We use your data to operate the platform and facilitate connections between recruiters and hiring companies. To process payments through Stripe. To send transactional notifications about your account and active engagements. To verify recruiter applications and maintain platform quality. To comply with our legal obligations.',
  },
  {
    title: '5. Data Retention',
    body: 'We retain active account data for the duration of your account plus two years after closure. Payment records are retained for seven years for tax compliance purposes. Platform messages are retained for three years for dispute resolution purposes. Candidate profile records logged on the platform are deleted 12 months after the related job is completed unless a dispute is ongoing.',
  },
  {
    title: '6. Third Party Processors',
    body: 'We share data with the following third party processors. Stripe for payment processing — see stripe.com/privacy. Supabase for database and infrastructure hosting. Resend for transactional email delivery. Vercel for application hosting. All processors are bound by data processing agreements and operate under GDPR-compliant frameworks.',
  },
  {
    title: '7. Your Rights Under GDPR',
    body: 'As a data subject you have the following rights. The right to access your personal data. The right to correct inaccurate data. The right to request deletion of your data. The right to restrict processing. The right to data portability. The right to object to processing. To exercise any of these rights contact privacy@vettedta.com. We will respond within 30 days.',
  },
  {
    title: '8. Cookies',
    body: 'Vetted TA uses essential cookies only. These are necessary for the platform to function and cannot be disabled. We do not use advertising or tracking cookies. We do not share cookie data with third parties.',
  },
  {
    title: '9. Data Breaches',
    body: 'In the event of a personal data breach affecting your data we will notify you and the Irish Data Protection Commission within 72 hours as required by GDPR.',
  },
  {
    title: '10. Contact',
    body: 'For privacy-related enquiries contact privacy@vettedta.com. To make a complaint contact the Irish Data Protection Commission at dataprotection.ie.',
  },
]

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo dark />
          </Link>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-blue-300 text-sm mt-2">Last updated: June 2026</p>
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {SECTIONS.map((s, i) => (
            <div key={i} className="px-8 py-6">
              <h2 className="text-base font-bold text-slate-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
