import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { Link } from "react-router-dom";

const TEAM_VALUES = [
  { title: "Patient-Centered Care",  desc: "Every decision we make starts with the patient. Your comfort, dignity, and recovery are our guiding principles." },
  { title: "Clinical Excellence",    desc: "Our physicians hold the highest credentials and participate in ongoing education to stay at the forefront of medicine." },
  { title: "Innovation",             desc: "We invest in advanced technology — from diagnostic imaging to digital records — to deliver faster, more accurate care." },
  { title: "Community Commitment",   desc: "MediCare is rooted in this community. We run free health clinics, outreach programs, and educational workshops year-round." },
];

export default function AboutPage() {
  return (
    <div className="public-page">
      <SiteHeader />
      <main className="public-main">

        {/* Page hero */}
        <section style={{ background: "var(--navy)", padding: "72px 40px" }}>
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
            <div className="section-label" style={{ color: "var(--teal-mid)" }}>About Us</div>
            <h1 style={{ color: "var(--white)", fontSize: "clamp(28px,3.5vw,44px)", maxWidth: 600 }}>
              5 Years of Healing, Learning, and Serving
            </h1>
          </div>
        </section>

        {/* Mission */}
        <section className="section" style={{ background: "var(--white)" }}>
          <div className="section-inner">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div>
                <div className="section-label">Our Mission</div>
                <h2 className="section-title">Healthcare With Heart</h2>
                <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.85, marginBottom: 20 }}>
                  Founded in 2024, MediCare has grown from a small community
                  clinic into a full-service regional medical center. We serve thousands
                  of patients each year across 18 specialized departments.
                </p>
                <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.85 }}>
                  Our mission has never changed: provide safe, effective, and compassionate
                  healthcare to every patient who walks through our doors  regardless of
                  background or circumstance.
                </p>
              </div>
              <div style={{ background: "var(--off-white)", borderRadius: "var(--r-lg)", padding: 40, border: "1px solid var(--border)" }}>
                <h3 style={{ marginBottom: 20 }}>By the Numbers</h3>
                {[
                  ["2024",   "Year Founded"],
                  ["50+",   "Specialist Doctors"],
                  ["18",     "Departments"],
                  ["3,000+","Annual Patients"],
                  ["94%",    "Satisfaction Rate"],
                ].map(([v, l]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--muted)", fontSize: 14 }}>{l}</span>
                    <span style={{ fontFamily: "Playfair Display, serif", color: "var(--navy)", fontSize: 20, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section">
          <div className="section-inner">
            <div className="section-label">Our Values</div>
            <h2 className="section-title">What Guides Everything We Do</h2>
            <div className="features-grid" style={{ marginTop: 40 }}>
              {TEAM_VALUES.map((v) => (
                <div className="feature-card" key={v.title}>
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2>Become a Patient Today</h2>
          <p>Register online and experience the MediCare difference .</p>
          <Link to="/register" className="btn btn-primary btn-lg">Get Started. Register Now</Link>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
