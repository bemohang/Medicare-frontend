import { useState, useEffect, useCallback } from "react";
import ProfilePage from "./ProfilePage";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar         from "../components/Sidebar";
import Topbar          from "../components/Topbar";
import AppointmentCard, { isLate } from "../components/AppointmentCard";
import BookingModal    from "../components/BookingModal";
import StatsCard       from "../components/StatsCard";
import Spinner         from "../components/Spinner";

const TAB_TITLES = {
  overview:     "Overview",
  book:         "Book Appointment",
  appointments: "My Appointments",
  profile:      "My Profile",
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [tab,          setTab]          = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [showBooking,  setShowBooking]  = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search,       setSearch]       = useState("");

  const fetchAppts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get("/api/appointments");
      setAppointments(data);
    } catch { setError("Failed to load appointments."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAppts(); }, [fetchAppts]);

  const handleCancel = async (id, reason) => {
    try {
      const { data } = await axios.put(`/api/appointments/${id}/cancel`, { cancelReason: reason });
      setAppointments((prev) => prev.map((a) => a._id === id ? data : a));
    } catch (err) { alert(err.response?.data?.message || "Failed to cancel."); }
  };

  const handleBooked = (appt) => {
    setAppointments((prev) => [appt, ...prev]);
    setTab("appointments");
  };

  const stats = {
    total:     appointments.length,
    pending:   appointments.filter((a) => a.status === "PENDING").length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
    late:      appointments.filter((a) => isLate(a)).length,
  };

  const filtered = appointments.filter((a) => {
    const matchStatus = filterStatus === "ALL" || filterStatus === "LATE"
      ? filterStatus === "LATE" ? isLate(a) : true
      : a.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q
      || a.doctor?.firstName?.toLowerCase().includes(q)
      || a.doctor?.lastName?.toLowerCase().includes(q)
      || a.reason?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const upcoming = appointments
    .filter((a) => ["PENDING", "CONFIRMED"].includes(a.status) && !isLate(a))
    .sort((x, y) => new Date(x.appointmentDate) - new Date(y.appointmentDate))
    .slice(0, 3);

  return (
    <div className="dashboard-shell">
      <Sidebar activeTab={tab} onTabChange={setTab} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Topbar title={TAB_TITLES[tab]} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content">

          {tab === "overview" && (
            <>
              <div className="page-header">
                <h2>Welcome, {user?.firstName}</h2>
                <p>Here is a summary of your appointments.</p>
              </div>
              <div className="stats-grid">
                <StatsCard value={stats.total}     label="Total Appointments"  color="navy"   />
                <StatsCard value={stats.pending}   label="Pending"             color="orange" />
                <StatsCard value={stats.confirmed} label="Confirmed"           color="teal"   />
                <StatsCard value={stats.completed} label="Completed"           color="green"  />
                <StatsCard value={stats.late}      label="Missed / Late"       color="red"    />
              </div>

              <div className="card" style={{ marginBottom: 22 }}>
                <div className="card-body" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={() => setShowBooking(true)}>Book New Appointment</button>
                  <button className="btn btn-outline" onClick={() => setTab("appointments")}>View All Appointments</button>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Upcoming Appointments</h3>
                  {upcoming.length > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("appointments")}>View all</button>
                  )}
                </div>
                <div className="card-body">
                  {loading ? <Spinner /> : upcoming.length === 0 ? (
                    <div className="empty-state">
                      <h4>No upcoming appointments</h4>
                      <p>Book your first appointment to get started.</p>
                      <button className="btn btn-primary" onClick={() => setShowBooking(true)}>Book Now</button>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {upcoming.map((a) => (
                        <AppointmentCard key={a._id} appt={a} role="PATIENT" onCancel={handleCancel} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{ marginTop: 22 }}>
                <div className="card-header"><h3>My Profile</h3></div>
                <div className="card-body">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16 }}>
                    {[
                      ["Full Name",   `${user?.firstName} ${user?.lastName}`],
                      ["Email",       user?.email],
                      ["Blood Group", user?.bloodGroup || "Not set"],
                      ["Phone",       user?.phone      || "Not set"],
                      ["Gender",      user?.gender     || "Not set"],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 4 }}>{l}</div>
                        <div style={{ fontWeight: 600, color: "var(--navy)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "book" && (
            <>
              <div className="page-header">
                <h2>Book an Appointment</h2>
                <p>Submit your preferred date and time and our team will confirm your appointment.</p>
              </div>
              <div className="card">
                <div className="card-body" style={{ textAlign: "center", padding: "48px 24px" }}>
                  <h3 style={{ marginBottom: 12 }}>Ready to book?</h3>
                  <p style={{ color: "var(--muted)", marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>
                    Choose your preferred date, time, and optionally request a specific doctor.
                    Administration will assign and confirm your appointment.
                  </p>
                  <button className="btn btn-primary" onClick={() => setShowBooking(true)}>
                    Open Booking Form
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "appointments" && (
            <>
              <div className="page-header">
                <h2>My Appointments</h2>
                <p>View and manage all your appointments.</p>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="filters-bar">
                <div className="search-wrap">
                  <span className="search-icon">&#x2315;</span>
                  <input type="text" placeholder="Search by doctor or reason" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="LATE">Late / Missed</option>
                </select>
                <button className="btn btn-primary" onClick={() => setShowBooking(true)}>+ Book New</button>
              </div>
              {loading ? <Spinner /> : filtered.length === 0 ? (
                <div className="empty-state">
                  <h4>No appointments found</h4>
                  <p>{appointments.length === 0 ? "You have not booked any appointments yet." : "No appointments match your filter."}</p>
                  {appointments.length === 0 && (
                    <button className="btn btn-primary" onClick={() => setShowBooking(true)}>Book Your First Appointment</button>
                  )}
                </div>
              ) : (
                <div className="appointments-list">
                  {filtered.map((a) => (
                    <AppointmentCard key={a._id} appt={a} role="PATIENT" onCancel={handleCancel} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <ProfilePage />
          )}

        </main>
      </div>
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} onBooked={handleBooked} />}
    </div>
  );
}
