import { Link } from "react-router-dom";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src="/images/logo.jpg" alt="MediCare Logo" className="footer-logo" />
              <span className="footer-brand-name">MediCare</span>
            </div>
            <p className="footer-desc">
              Providing compassionate, healthcare to our community.
              Your health is our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/services">Services</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact</h4>
            <div className="footer-links">
              <span>12300 Brookdale Avenue</span>
              <span>Cornwall, ON K6H 000</span>
              <span>+1 800 000-0000</span>
              <span>info@medicare.com</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} MediCare Hospital. All rights reserved.</span>
          <span>Designed for patient care and excellence.</span>
        </div>
      </div>
    </footer>
  );
}
