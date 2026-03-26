import { useState } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div className="public-page">
      <SiteHeader />
      <main className="public-main">

        <section style={{ background: "var(--navy)", padding: "72px 40px" }}>
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
            <div className="section-label" style={{ color: "var(--teal-mid)" }}>Contact Us</div>
            <h1 style={{ color: "var(--white)", fontSize: "clamp(28px,3.5vw,44px)" }}>
              We Are Here to Help
            </h1>
          </div>
        </section>

        <section className="section" style={{ background: "var(--white)" }}>
          <div className="section-inner">
            <div className="contact-grid">

              {/* Info */}
              <div className="contact-info">
                <div>
                  <h3 style={{ marginBottom: 24 }}>Get in Touch</h3>
                  <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8 }}>
                    Our team is available Monday through Friday, 8am – 6pm.
                    For medical emergencies please call 911.
                  </p>
                </div>
                {[
                  { label: "Address",    value: "12300 Brookdale Avenue Cornwall, ON K6H 000" },
                  { label: "Phone",      value: "+1 800 000-0000" },
                  { label: "Email",      value: "info@medicare.com" },
                  { label: "Contact Number",  value: "+1 800 000-0000 " },
                  { label: "Hours",      value: "Mon – Fri: 8:00 AM – 6:00 PM" },
                ].map((item) => (
                  <div className="contact-info-item" key={item.label}>
                    <h4>{item.label}</h4>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div>
                {sent ? (
                  <div className="card">
                    <div className="card-body" style={{ textAlign: "center", padding: "48px 24px" }}>
                      <h3 style={{ marginBottom: 12 }}>Message Sent</h3>
                      <p style={{ color: "var(--muted)" }}>
                        Thank you for reaching out. A member of our team will respond.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-header"><h3>Send Us a Message</h3></div>
                    <div className="card-body">
                      <form onSubmit={handleSubmit}>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Your Name</label>
                            <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                          </div>
                          <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Subject</label>
                          <input type="text" name="subject" placeholder="How can we help?" value={form.subject} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                          <label>Message</label>
                          <textarea name="message" rows={5} placeholder="Please describe your inquiry in detail..." value={form.message} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full">Send Message</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
