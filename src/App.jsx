import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Support from './pages/Support'

import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import History from './pages/History'
import Profile from './pages/Profile'
import KYC from './pages/KYC'
import InvestmentHistory from './pages/InvestmentHistory'
import ReferralDashboard from './pages/ReferralDashboard'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminWithdrawals from './pages/admin/AdminWithdrawals'
import AdminKYC from './pages/admin/AdminKYC'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminSupport from './pages/admin/Adminsupport'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"               element={<Home />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms"          element={<Terms />} />
            <Route path="/privacy"        element={<Privacy />} />
            <Route path="/support"        element={<Support />} />

            {/* Protected user */}
            <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/plans"              element={<ProtectedRoute><Plans /></ProtectedRoute>} />
            <Route path="/deposit"            element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/withdraw"           element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/history"            element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/kyc"                element={<ProtectedRoute><KYC /></ProtectedRoute>} />
            <Route path="/investments"        element={<ProtectedRoute><InvestmentHistory /></ProtectedRoute>} />
            <Route path="/referrals"          element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin"                   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users"             element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/withdrawals"       element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
            <Route path="/admin/kyc"               element={<AdminRoute><AdminKYC /></AdminRoute>} />
            <Route path="/admin/announcements"     element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
            <Route path="/admin/support"           element={<AdminRoute><AdminSupport /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}