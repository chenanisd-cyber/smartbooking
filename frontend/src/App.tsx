import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ShowDetailPage from './pages/ShowDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import MyBookingsPage from './pages/MyBookingsPage'
import ReservationPage from './pages/ReservationPage'
import NotFoundPage from './pages/NotFoundPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminShows from './pages/admin/AdminShows'
import AdminArtists from './pages/admin/AdminArtists'
import AdminLocations from './pages/admin/AdminLocations'
import AdminUsers from './pages/admin/AdminUsers'
import AdminReviews from './pages/admin/AdminReviews'
import ProducerStatsPage from './pages/ProducerStatsPage'
import ProducerReviewsPage from './pages/ProducerReviewsPage'

const AdminHome = () => <div style={{ color: 'var(--muted)' }}>Sélectionnez une section dans le menu.</div>

// Remonte en haut de page à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1, padding: '2rem 0' }}>
            <Routes>
              <Route path="/"                   element={<HomePage />} />
              <Route path="/shows/:slug"        element={<ShowDetailPage />} />
              <Route path="/login"              element={<LoginPage />} />
              <Route path="/register"           element={<RegisterPage />} />
              <Route path="/profile"            element={<ProfilePage />} />
              <Route path="/my-bookings"        element={<MyBookingsPage />} />
              <Route path="/reservation/:repId"  element={<ReservationPage />} />
              <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
              <Route path="/reset-password"      element={<ResetPasswordPage />} />
              <Route path="/producer/stats"      element={<ProducerStatsPage />} />
              <Route path="/producer/reviews"    element={<ProducerReviewsPage />} />

              <Route path="/admin" element={<AdminLayout />}>
                <Route index          element={<AdminHome />} />
                <Route path="shows"     element={<AdminShows />} />
                <Route path="artists"   element={<AdminArtists />} />
                <Route path="locations" element={<AdminLocations />} />
                <Route path="users"     element={<AdminUsers />} />
                <Route path="reviews"   element={<AdminReviews />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
