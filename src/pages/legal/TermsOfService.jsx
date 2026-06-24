import { Link } from 'react-router-dom'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

const SECTIONS = [
  {
    title: '1. About Vetted TA',
    body: 'Vetted TA is a B2B marketplace operated by Vetted TA (Ireland) that connects independent recruitment professionals with hiring companies. Vetted TA is not a recruitment agency. We provide a platform that facilitates commercial engagements between independent recruiters and businesses seeking to hire.',
  },
  {
    title: '2. Eligibility',
    body: 'To use Vetted TA as a hiring company you must register using a valid company domain email address. Personal email addresses from providers including Gmail, Hotmail, Outlook, and Yahoo are not accepted. To use Vetted TA as a recruiter you must apply and be approved through our vetting process. Approval is at Vetted TA\'s sole discretion.',
  },
  {
    title: '3. The Engagement Model',
    body: 'All recruitment engagements facilitated through Vetted TA are retained engagements. Hiring companies pay in three milestone stages — 20 percent on commencement, 30 percent on shortlist approval, and 50 percent on interview confirmation. Payments are held securely via Stripe and released to recruiters as milestones are completed. Vetted TA deducts a platform fee of 15 percent from each milestone payment before releasing funds to recruiters.',
  },
  {
    title: '4. Exclusivity',
    body: 'Each role posted on Vetted TA is assigned to one recruiter exclusively. Hiring companies agree not to engage multiple recruiters simultaneously on the same role through Vetted TA.',
  },
  {
    title: '5. Hiring Company Obligations',
    body: 'Hiring companies agree to provide accurate and complete information about each role posted on Vetted TA, including genuine salary range, location, and role requirements. Hiring companies agree to review and respond to submitted candidates within a reasonable timeframe, and to communicate promptly with the assigned recruiter regarding the status of a role. Hiring companies agree to treat all candidate information shared by a recruiter as confidential, and to use such information solely for the purpose of evaluating that candidate for the relevant role. Hiring companies agree not to contact a candidate introduced through Vetted TA for any role other than the one for which they were introduced, without the involvement of the introducing recruiter.',
  },
  {
    title: '6. Non-Circumvention',
    body: 'By using Vetted TA both recruiters and hiring companies agree that any candidate introduction made through the platform creates a protected relationship for 24 months from the date of introduction. If a hiring company engages a candidate introduced through Vetted TA outside the platform within this period the full placement fee becomes immediately due. If a recruiter accepts direct payment from a hiring company introduced through Vetted TA within this period their account will be permanently suspended.',
  },
  {
    title: '7. No Rebate Policy',
    body: 'The recruiter\'s contractual obligation ends at offer acceptance confirmed through the Vetted TA platform. No refund or rebate applies after this point regardless of subsequent employment outcomes including candidate resignation or termination.',
  },
  {
    title: '8. Milestone Payments and Refunds',
    body: 'If a hiring company cancels a role before any CVs are submitted they receive a full refund minus the Vetted TA platform fee. If a hiring company cancels after CVs have been approved all milestone payments already released to the recruiter are non-refundable. Remaining unearned milestones are refunded to the hiring company. If a recruiter withdraws from a role before submitting CVs the hiring company receives a full refund including the platform fee. If a recruiter withdraws after CVs have been submitted milestone payments already released are retained by the recruiter. Any remaining unearned milestones for that role are refunded to the hiring company in full, minus the Vetted TA platform fee already deducted from milestones already released. The hiring company is not charged for any milestone stage that has not been triggered at the time of withdrawal.',
  },
  {
    title: '9. Dispute Resolution',
    body: 'Disputes between recruiters and hiring companies are resolved through Vetted TA\'s three-tier dispute process. Vetted TA\'s decision at the final tier is binding on both parties. Where evidence is genuinely ambiguous Vetted TA may apply a 50-50 split of the disputed milestone amount. Vetted TA\'s liability to any user is limited to the platform fees paid by that user in the preceding 12 months.',
  },
  {
    title: '10. Disclaimer of Warranties',
    body: 'The Vetted TA platform is provided on an \'as is\' and \'as available\' basis. Vetted TA makes no warranties, express or implied, regarding the platform\'s availability, accuracy, or fitness for a particular purpose, beyond what is required by applicable law.',
  },
  {
    title: '11. Limitation of Liability',
    body: 'Vetted TA is not liable for the quality of placements made through the platform, the conduct of recruiters or hiring companies, employment outcomes following placement, or any losses arising from the use of the platform beyond the limitations stated in these terms.',
  },
  {
    title: '12. Indemnification',
    body: 'Each party agrees to indemnify and hold harmless Vetted TA, its officers, and operators from and against any claims, damages, losses, or expenses (including reasonable legal fees) arising from that party\'s breach of these terms, misrepresentation, fraudulent conduct, or violation of applicable law in connection with their use of the platform.',
  },
  {
    title: '13. Force Majeure',
    body: 'Neither party shall be liable for any failure or delay in performance under these terms resulting from circumstances beyond their reasonable control, including but not limited to acts of God, internet or infrastructure outages, or government action.',
  },
  {
    title: '14. Governing Law',
    body: 'These terms are governed by the laws of Ireland. Any disputes arising under these terms are subject to the exclusive jurisdiction of the Irish courts.',
  },
  {
    title: '15. Changes to These Terms',
    body: 'Vetted TA reserves the right to update these terms at any time. Material changes will be communicated to registered users by email. Continued use of the platform after notification constitutes acceptance of the updated terms.',
  },
  {
    title: '16. Contact',
    body: 'For questions about these terms contact hello@vettedta.com',
  },
]

export default function TermsOfService() {
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
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
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
