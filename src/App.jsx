import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import { Analytics } from '@vercel/analytics/react'

import HomePage               from './pages/public/HomePage'
import Login                  from './pages/public/Login'
import RecruiterSignup        from './pages/recruiter/RecruiterSignup'
import RecruiterDashboard     from './pages/recruiter/RecruiterDashboard'
import RecruiterProfileSetup  from './pages/recruiter/RecruiterProfileSetup'
import RecruiterPublicProfile from './pages/recruiter/RecruiterPublicProfile'
import RecruiterMessages      from './pages/recruiter/RecruiterMessages'
import HiringManagerSignup    from './pages/hiring-manager/HiringManagerSignup'
import HiringManagerDashboard from './pages/hiring-manager/HiringManagerDashboard'
import BrowseRecruiters       from './pages/hiring-manager/BrowseRecruiters'
import PostJob                from './pages/hiring-manager/PostJob'
import Messages               from './pages/hiring-manager/Messages'
import StartJob               from './pages/hiring-manager/StartJob'
import ActiveJobList          from './pages/hiring-manager/ActiveJobList'
import HMActiveJob            from './pages/hiring-manager/ActiveJob'
import OfferFlow              from './pages/hiring-manager/OfferFlow'
import HMLeaveReview          from './pages/hiring-manager/LeaveReview'
import CancelJob              from './pages/hiring-manager/CancelJob'
import RecruiterActiveJob     from './pages/recruiter/ActiveJob'
import RecruiterLeaveReview   from './pages/recruiter/LeaveReview'
import WithdrawJob            from './pages/recruiter/WithdrawJob'
import EditProfile            from './pages/recruiter/EditProfile'
import StripeOnboarding       from './pages/recruiter/StripeOnboarding'
import OfferAcceptance        from './pages/public/OfferAcceptance'
import HowItWorks             from './pages/public/HowItWorks'
import Contact                from './pages/public/Contact'
import TermsOfService         from './pages/legal/TermsOfService'
import PrivacyPolicy          from './pages/legal/PrivacyPolicy'
import RecruiterAgreement     from './pages/legal/RecruiterAgreement'
import AdminDashboard         from './pages/admin/AdminDashboard'
import VettingPanel           from './pages/admin/VettingPanel'

const DASHBOARD_BY_TYPE = {
  recruiter:      '/recruiter/dashboard',
  hiring_manager: '/hiring-manager/dashboard',
  admin:          '/admin/dashboard',
}

function PublicRoute({ children }) {
  const { user, userType, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }
  if (user && userType) {
    return <Navigate to={DASHBOARD_BY_TYPE[userType] ?? '/'} replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login"                  element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/recruiter/signup"        element={<PublicRoute><RecruiterSignup /></PublicRoute>} />
          <Route path="/hiring-manager/signup"   element={<PublicRoute><HiringManagerSignup /></PublicRoute>} />

          {/* Public recruiter profile — viewable by anyone */}
          <Route path="/recruiter/profile/:id"   element={<RecruiterPublicProfile />} />
          <Route path="/how-it-works"            element={<HowItWorks />} />
          <Route path="/terms"                   element={<TermsOfService />} />
          <Route path="/privacy"                 element={<PrivacyPolicy />} />
          <Route path="/recruiter-agreement"     element={<RecruiterAgreement />} />
          <Route path="/contact"                 element={<Contact />} />

          {/* Public offer acceptance — no auth required */}
          <Route path="/offer/:token"            element={<OfferAcceptance />} />

          {/* Recruiter — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['recruiter']} />}>
            <Route path="/recruiter/dashboard"        element={<RecruiterDashboard />} />
            <Route path="/recruiter/pending"          element={<RecruiterProfileSetup />} />
            <Route path="/recruiter/messages"         element={<RecruiterMessages />} />
            <Route path="/recruiter/profile/edit"     element={<EditProfile />} />
            <Route path="/recruiter/stripe-onboarding" element={<StripeOnboarding />} />
          </Route>

          {/* Hiring manager — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['hiring_manager']} />}>
            <Route path="/hiring-manager/dashboard" element={<HiringManagerDashboard />} />
            <Route path="/browse-recruiters"         element={<BrowseRecruiters />} />
            <Route path="/post-job"                  element={<PostJob />} />
            <Route path="/messages"                  element={<Messages />} />
            <Route path="/start-job"                 element={<StartJob />} />
            <Route path="/jobs"                           element={<ActiveJobList />} />
            <Route path="/job/:assignmentId"              element={<HMActiveJob />} />
            <Route path="/job/:assignmentId/offer"        element={<OfferFlow />} />
            <Route path="/job/:assignmentId/review"       element={<HMLeaveReview />} />
            <Route path="/job/:assignmentId/cancel"       element={<CancelJob />} />
          </Route>

          {/* Recruiter — active job + review */}
          <Route element={<ProtectedRoute allowedUserTypes={['recruiter']} />}>
            <Route path="/recruiter/job/:assignmentId"          element={<RecruiterActiveJob />} />
            <Route path="/recruiter/review/:assignmentId"       element={<RecruiterLeaveReview />} />
            <Route path="/recruiter/job/:assignmentId/withdraw" element={<WithdrawJob />} />
          </Route>

          {/* Admin — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vetting"   element={<VettingPanel />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  )
}
