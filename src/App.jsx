import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

import HomePage from './pages/public/HomePage'

// Lazy-loaded placeholders — swap for real pages as they are built
import RecruiterSignup from './pages/recruiter/RecruiterSignup'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import HiringManagerSignup from './pages/hiring-manager/HiringManagerSignup'
import HiringManagerDashboard from './pages/hiring-manager/HiringManagerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/recruiter/signup" element={<RecruiterSignup />} />
          <Route path="/hiring-manager/signup" element={<HiringManagerSignup />} />

          {/* Recruiter — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['recruiter']} />}>
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          </Route>

          {/* Hiring manager — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['hiring_manager']} />}>
            <Route path="/hiring-manager/dashboard" element={<HiringManagerDashboard />} />
          </Route>

          {/* Admin — protected */}
          <Route element={<ProtectedRoute allowedUserTypes={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
