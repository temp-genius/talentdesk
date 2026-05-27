import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

import HomePage               from './pages/public/HomePage'
import Login                  from './pages/public/Login'
import RecruiterSignup        from './pages/recruiter/RecruiterSignup'
import RecruiterDashboard     from './pages/recruiter/RecruiterDashboard'
import RecruiterProfileSetup  from './pages/recruiter/RecruiterProfileSetup'
import RecruiterPublicProfile from './pages/recruiter/RecruiterPublicProfile'
import HiringManagerSignup    from './pages/hiring-manager/HiringManagerSignup'
import HiringManagerDashboard from './pages/hiring-manager/HiringManagerDashboard'
import BrowseRecruiters       from './pages/hiring-manager/BrowseRecruiters'
import AdminDashboard         from './pages/admin/AdminDashboard'

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
          <Route path="/login"                element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/recruiter/signup"     element={<PublicRoute><RecruiterSignup /></PublicRoute>} />
          <Route path="/hiring-manager/signup" element={<PublicRoute><HiringManagerSignup /></PublicRoute>} />

          {/* Public recruiter profile — viewable by anyone */}
          <Route path="/recruiter/profile/:id" element={<RecruiterPublicProfile />} />

          {/* Recruiter — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['recruiter']} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/pending"   element={<RecruiterProfileSetup />} />
          </Route>

          {/* Hiring manager — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['hiring_manager']} />}>
            <Route path="/hiring-manager/dashboard" element={<HiringManagerDashboard />} />
            <Route path="/browse-recruiters"        element={<BrowseRecruiters />} />
          </Route>

          {/* Admin — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
