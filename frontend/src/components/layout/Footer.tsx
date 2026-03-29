import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-logo">Smart<span>Booking</span></span>
        <span className="footer-copy">© {new Date().getFullYear()} — Plateforme de réservation de spectacles</span>
      </div>
    </footer>
  )
}
