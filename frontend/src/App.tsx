import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import ShowDetailPage from './pages/ShowDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

// Placeholder pages — will be filled in next steps
const BookingsPage    = () => <div className="container" style={{padding:'3rem 0'}}><h2>Mes réservations (étape 12)</h2></div>
const ReservationPage = () => <div className="container" style={{padding:'3rem 0'}}><h2>Réservation (étape 12)</h2></div>
const AdminPage       = () => <div className="container" style={{padding:'3rem 0'}}><h2>Administration (étape 13)</h2></div>
const NotFound        = () => <div className="container" style={{padding:'3rem 0', textAlign:'center'}}><h2>404 — Page introuvable</h2></div>

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1, padding: '2rem 0' }}>
            <Routes>
              <Route path="/"                    element={<HomePage />} />
              <Route path="/shows/:slug"         element={<ShowDetailPage />} />
              <Route path="/login"               element={<LoginPage />} />
              <Route path="/register"            element={<RegisterPage />} />
              <Route path="/profile"             element={<ProfilePage />} />
              <Route path="/my-bookings"         element={<BookingsPage />} />
              <Route path="/reservation/:repId"  element={<ReservationPage />} />
              <Route path="/admin/*"             element={<AdminPage />} />
              <Route path="*"                    element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
