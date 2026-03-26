import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Sidebar         from "../components/Sidebar";
import Topbar          from "../components/Topbar";
import AppointmentCard, { isLate } from "../components/AppointmentCard";
import StatsCard       from "../components/StatsCard";
import Spinner         from "../components/Spinner";

const TAB_TITLES = { overview: "Overview", appointments: "My Appointments" };

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [tab,          setTab]          = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
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

  const handleComplete = async (id) => {
    try {
      const { data } = await axios.put(`/api/appointments/${id}/complete`);
      setAppointments((prev) => prev.map((a) => a._id === id ? data : a));
    } catch (err) { alert(err.response?.data?.message || "Failed to mark complete."); }
  };

  const handleCancel = async (id, reason) => {
    try {
      const { data } = await axios.put(`/api/appointments/${id}/cancel`, { cancelReason: reason });
      setAppointments((prev) => prev.map((a) => a._id === id ? data : a));
    } catch (err) { alert(err.response?.data?.message || "Failed to cancel."); }
  };

  const stats = {
    total:     appointments.length,
    today:     appointments.filter((a) => new Date(a.appointmentDate).toDateString() === new Date().toDateString() && ["PENDING","CONFIRMED"].includes(a.status)).length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    late:      appointments.filter((a) => isLate(a)).length,
  };

  const todayList = appointments
    .filter((a) => new Date(a.appointmentDate).toDateString() === new Date().toDateString() && ["PENDING","CONFIRMED"].includes(a.status))
    .sort((x, y) => x.appointmentTime.localeCompare(y.appointmentTime));

  const filtered = appointments.filter((a) => {
    const matchStatus = filterStatus === "ALL" ? true
      : filterStatus === "LATE" ? isLate(a)
      : a.status === filterStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q
      || a.patient?.firstName?.toLowerCase().includes(q)
      || a.patient?.lastName?.toLowerCase().includes(q)
      || a.reason?.toLowerCase().includes(q));
  });

  return (
    <div className="dashboard-shell">
      <Sidebar activeTab={tab} onTabChange={setTab} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Topbar title={TAB_TITLES[tab]} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content">

          {tab === "overview" && (
            <>
              <div className="page-header">
                <h2>Dr. {user?.firstName} {user?.lastName}</h2>
                <p>{user?.specialization ? `${user.specialization} — ` : ""}Your schedule is here.</p>
              </div>
              <div className="stats-grid">
                <StatsCard value={stats.total}     label="Total Appointments" color="navy"   />
                <StatsCard value={stats.today}     label="Today"             color="teal"   />
                <StatsCard value={stats.completed} label="Completed"         color="green"  />
                <StatsCard value={stats.late}      label="Missed / Late"     color="red"    />
              </div>

              <div className="card" style={{ marginBottom: 22 }}>
                <div className="card-header">
                  <h3>Today's Schedule</h3>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="card-body">
                  {loading ? <Spinner /> : todayList.length === 0 ? (
                    <div className="empty-state" style={{ padding: "28px 20px" }}>
                      <h4>No appointments today</h4>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {todayList.map((a) => (
                        <AppointmentCard key={a._id} appt={a} role="DOCTOR" onCancel={handleCancel} onComplete={handleComplete} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>My Profile</h3></div>
                <div className="card-body">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 16 }}>
                    {[
                      ["Name",           `Dr. ${user?.firstName} ${user?.lastName}`],
                      ["Email",          user?.email],
                      ["Specialization", user?.specialization || "Not set"],
                      ["Phone",          user?.phone || "Not set"],
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

          {tab === "appointments" && (
            <>
              <div className="page-header">
                <h2>My Appointments</h2>
                <p>View, complete, or cancel your assigned appointments.</p>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="filters-bar">
                <div className="search-wrap">
                  <span className="search-icon">&#x2315;</span>
                  <input type="text" placeholder="Search by patient name or reason" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="LATE">Late / Missed</option>
                </select>
              </div>
              {loading ? <Spinner /> : filtered.length === 0 ? (
                <div className="empty-state">
                  <h4>No appointments found</h4>
                  <p>{appointments.length === 0 ? "No appointments assigned yet." : "No appointments match your filter."}</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {filtered.map((a) => (
                    <AppointmentCard key={a._id} appt={a} role="DOCTOR" onCancel={handleCancel} onComplete={handleComplete} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
