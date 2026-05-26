import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-logo">
          Smart<span>Booking</span>
        </span>
        <span className="footer-copy">
          © {new Date().getFullYear()} — Plateforme de réservation de spectacles
        </span>
        <a href="http://localhost:8080/rss/representations.xml" target="_blank" rel="noopener noreferrer">
          Flux RSS
        </a>
      </div>
    </footer>
  )
}