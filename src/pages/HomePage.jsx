import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const SERVICES = [
  { title: "Cardiology",       desc: "Advanced heart care with state-of-the-art diagnostics and treatment plans tailored to every patient." },
  { title: "Neurology",        desc: "Expert diagnosis and care for conditions of the brain, spine, and nervous system." },
  { title: "Orthopedics",      desc: "Comprehensive bone, joint, and muscle care from injury to recovery." },
  { title: "Pediatrics",       desc: "Dedicated care for infants, children, and adolescents in a safe, welcoming environment." },
  { title: "Oncology",         desc: "Compassionate cancer care backed by the latest research and treatment technologies." },
  { title: "General Practice", desc: "Your first stop for routine check-ups, preventive care, and health consultations." },
];

export default function HomePage() {
  return (
    <div className="public-page">
      <SiteHeader />
      <main className="public-main">

        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-text">
              <div className="hero-label">Trusted Healthcare Since 2024</div>
              <h1>
                Your Health Is Our Greatest Commitment
              </h1>
              <p className="hero-desc">
                MediCare brings together world class health service, advanced technology,
                and compassionate care all under one roof. Book your appointment
                online in minutes.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Book an Appointment
                </Link>
                <Link to="/services" className="btn btn-outline btn-lg" style={{ color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.35)" }}>
                  Our Services
                </Link>
              </div>
              </div>
            <div className="hero-image-side">
              <div className="hero-image-frame">
                <img src="/images/logo.jpg" alt="MediCare Hospital" />
              </div>
            </div>
          </div>
        </section>

        {/* Services overview */}
        <section className="section" style={{ background: "var(--white)" }}>
          <div className="section-inner">
            <div className="section-label">What We Offer</div>
            <h2 className="section-title"> Medical Services</h2>
           
            <div className="features-grid">
              {SERVICES.map((s) => (
                <div className="feature-card" key={s.title}>
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link to="/services" className="btn btn-navy">View All Services</Link>
            </div>
          </div>
        </section>

        
        {/* CTA */}
        <section className="cta-section">
          <h2>Ready to Take the First Step?</h2>
          <p>
            Register as a patient today and book your first appointment online.
            
            Our team is ready to assist you on your path to better health.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Patient Account</Link>
            <Link to="/contact"  className="btn btn-ghost btn-lg" style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.25)" }}>Contact Us</Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
