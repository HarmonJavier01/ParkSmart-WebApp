import { Routes, Route } from 'react-router-dom';

import LandingPage from './pages/public/LandingPage.jsx';
import ParkingSearchPage from './pages/public/ParkingSearchPage.jsx';
import LotDetailPage from './pages/public/LotDetailPage.jsx';
import ReservationPage from './pages/public/ReservationPage.jsx';
import TicketPage from './pages/public/TicketPage.jsx';
import AccountPage from './pages/public/AccountPage.jsx';
import VerifyEmailPage from './pages/public/VerifyEmailPage.jsx';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/public/ResetPasswordPage.jsx';

import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import DashboardPage from './pages/admin/DashboardPage.jsx';
import LotsManagementPage from './pages/admin/LotsManagementPage.jsx';
import MonitorPage from './pages/admin/MonitorPage.jsx';
import ReservationsAdminPage from './pages/admin/ReservationsAdminPage.jsx';
import UsersPage from './pages/admin/UsersPage.jsx';
import ReportsPage from './pages/admin/ReportsPage.jsx';
import SensorLogsPage from './pages/admin/SensorLogsPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';

import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import OnboardingTour from './components/common/OnboardingTour.jsx';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <OnboardingTour />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/parking" element={<ParkingSearchPage />} />
                  <Route path="/parking/:lotId" element={<LotDetailPage />} />
                  <Route path="/reserve/:slotId" element={<ReservationPage />} />
                  <Route path="/ticket/:reservationId" element={<TicketPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/lots" element={<LotsManagementPage />} />
                <Route path="/monitor" element={<MonitorPage />} />
                <Route path="/reservations" element={<ReservationsAdminPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/sensors" element={<SensorLogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

