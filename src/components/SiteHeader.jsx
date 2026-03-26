import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand */}
        <Link to="/" className="header-brand">
          <img src="/images/logo.jpg" alt="MediCare Logo" className="header-logo" />
          <div className="header-brand-text">
            <span className="header-brand-name">MediCare</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav">
          <NavLink to="/"         className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Home</NavLink>
          <NavLink to="/about"    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>About</NavLink>
          <NavLink to="/services" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Services</NavLink>
          <NavLink to="/contact"  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Contact</NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="header-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline btn-sm">Dashboard</Link>
              <button className="btn btn-navy btn-sm" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

      </div>
     </header>
  );
}
