import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { Link } from "react-router-dom";

const DEPARTMENTS = [
  { name: "Cardiology",            desc: "Comprehensive diagnosis and treatment of heart and vascular diseases including ECG, echocardiography, and cardiac catheterization." },
  { name: "Neurology",             desc: "Expert care for disorders of the brain, spine, and nervous system including stroke, epilepsy, and multiple sclerosis." },
  { name: "Orthopedics",           desc: "Treatment of musculoskeletal conditions — fractures, joint replacements, sports injuries, and spinal surgery." },
  { name: "Pediatrics",            desc: "Full-spectrum healthcare for newborns, children, and teenagers in a friendly, purpose-built environment." },
  { name: "Oncology",              desc: "Evidence-based cancer diagnosis, chemotherapy, radiation therapy, and supportive care for all cancer types." },
  { name: "Obstetrics & Gynecology", desc: "Maternity care, labor and delivery, family planning, and women's health across all life stages." },
  { name: "Dermatology",           desc: "Medical and cosmetic treatment of skin, hair, and nail conditions including eczema, psoriasis, and skin cancer screening." },
  { name: "Psychiatry",            desc: "Mental health evaluation and treatment for depression, anxiety, bipolar disorder, and more — in a safe, confidential setting." },
  { name: "Gastroenterology",      desc: "Diagnosis and treatment of digestive system disorders including endoscopy, colonoscopy, and liver disease management." },
  { name: "Ophthalmology",         desc: "Complete eye care from routine vision checks to cataract surgery, glaucoma treatment, and retinal procedures." },
  { name: "Radiology",             desc: "Advanced imaging including MRI, CT, PET, and ultrasound with rapid result turnaround and specialist interpretation." },
  { name: "General Practice",      desc: "Your primary care team for routine check-ups, health screenings, immunizations, and chronic disease management." },
];

export default function ServicesPage() {
  return (
    <div className="public-page">
      <SiteHeader />
      <main className="public-main">

        <section style={{ background: "var(--navy)", padding: "72px 40px" }}>
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
            <div className="section-label" style={{ color: "var(--teal-mid)" }}>Our Services</div>
            <h1 style={{ color: "var(--white)", fontSize: "clamp(28px,3.5vw,44px)", maxWidth: 600 }}>
              18 Departments. One Destination.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, maxWidth: 560, marginTop: 16, lineHeight: 1.8 }}>
              Whatever your health need, MediCare has a team for that.
            </p>
          </div>
        </section>

        <section className="section" style={{ background: "var(--white)" }}>
          <div className="section-inner">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
              {DEPARTMENTS.map((d) => (
                <div className="feature-card" key={d.name}>
                  <div className="feature-icon">
                    <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </div>
                  <h3>{d.name}</h3>
                  <p>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Book a Consultation</h2>
          <p>
            Register as a patient and book your appointment online.
            Our scheduling team will match you with the right specialist.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="btn btn-primary btn-lg">Register Now</Link>
            <Link to="/contact"  className="btn btn-ghost btn-lg" style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.25)" }}>Contact Us</Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
