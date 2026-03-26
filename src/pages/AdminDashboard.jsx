import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar         from "../components/Sidebar";
import Topbar          from "../components/Topbar";
import AppointmentCard, { isLate } from "../components/AppointmentCard";
import UserTable       from "../components/UserTable";
import StatsCard       from "../components/StatsCard";
import Spinner         from "../components/Spinner";

const TAB_TITLES = {
  overview:     "Admin Overview",
  appointments: "All Appointments",
  patients:     "Manage Patients",
  doctors:      "Manage Doctors",
  "add-doctor": "Add Doctor Account",
};

const SPECIALIZATIONS = [
  "General Practitioner","Cardiology","Dermatology","Endocrinology",
  "Gastroenterology","Neurology","Obstetrics & Gynecology","Oncology",
  "Ophthalmology","Orthopedics","Pediatrics","Psychiatry",
  "Pulmonology","Radiology","Surgery","Urology",
];

export default function AdminDashboard() {
  const [tab,          setTab]          = useState("overview");
  const [appointments, setAppointments] = useState([]);
  const [patients,     setPatients]     = useState([]);
  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error,        setError]        = useState("");
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [userSearch,   setUserSearch]   = useState("");

  // Add Doctor form state
  const [docForm, setDocForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    specialization: "", licenseNumber: "", phone: "",
  });
  const [docError,   setDocError]   = useState("");
  const [docSuccess, setDocSuccess] = useState("");
  const [docLoading, setDocLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get("/api/appointments");
      setAppointments(data);
    } catch { setError("Failed to load appointments."); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        axios.get("/api/users?role=PATIENT"),
        axios.get("/api/users?role=DOCTOR"),
      ]);
      setPatients(pRes.data);
      setDoctors(dRes.data);
    } catch { setError("Failed to load users."); }
    finally { setUsersLoading(false); }
  }, []);

  useEffect(() => { fetchAppointments(); fetchUsers(); }, [fetchAppointments, fetchUsers]);

  const handleCancel = async (id, reason) => {
    try {
      const { data } = await axios.put(`/api/appointments/${id}/cancel`, { cancelReason: reason });
      setAppointments((prev) => prev.map((a) => a._id === id ? data : a));
    } catch (err) { alert(err.response?.data?.message || "Failed to cancel."); }
  };

  const handleAssign = async (apptId, doctorId) => {
    try {
      const { data } = await axios.put(`/api/appointments/${apptId}/assign`, { doctorId });
      setAppointments((prev) => prev.map((a) => a._id === apptId ? data : a));
    } catch (err) { alert(err.response?.data?.message || "Failed to assign doctor."); }
  };

  const handleToggleBlock = async (userId, blocked) => {
    try {
      const { data } = await axios.put(`/api/users/${userId}/block`, { blocked });
      const u = data.user;
      setPatients((prev) => prev.map((p) => p._id === userId ? u : p));
      setDoctors((prev)  => prev.map((d) => d._id === userId ? u : d));
    } catch (err) { alert(err.response?.data?.message || "Failed to update user."); }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setDocError(""); setDocSuccess("");
    if (docForm.password.length < 6) { setDocError("Password must be at least 6 characters."); return; }
    setDocLoading(true);
    try {
      await axios.post("/api/auth/create-doctor", docForm);
      setDocSuccess(`Doctor account created for ${docForm.firstName} ${docForm.lastName}. They can now log in.`);
      setDocForm({ firstName: "", lastName: "", email: "", password: "", specialization: "", licenseNumber: "", phone: "" });
      fetchUsers(); // refresh doctors list
    } catch (err) {
      setDocError(err.response?.data?.message || "Failed to create doctor account.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleDocChange = (e) => setDocForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const stats = {
    total:      appointments.length,
    pending:    appointments.filter((a) => a.status === "PENDING").length,
    confirmed:  appointments.filter((a) => a.status === "CONFIRMED").length,
    completed:  appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled:  appointments.filter((a) => a.status === "CANCELLED").length,
    late:       appointments.filter((a) => isLate(a)).length,
    patients:   patients.length,
    doctors:    doctors.length,
    unassigned: appointments.filter((a) => !a.doctor && a.status === "PENDING").length,
  };

  const filteredAppts = appointments.filter((a) => {
    const matchStatus = filterStatus === "ALL" ? true
      : filterStatus === "LATE" ? isLate(a)
      : a.status === filterStatus;
    const q = search.toLowerCase();
    return matchStatus && (!q
      || a.patient?.firstName?.toLowerCase().includes(q)
      || a.patient?.lastName?.toLowerCase().includes(q)
      || a.doctor?.firstName?.toLowerCase().includes(q)
      || a.doctor?.lastName?.toLowerCase().includes(q)
      || a.reason?.toLowerCase().includes(q));
  });

  const filterUsers = (list) => {
    const q = userSearch.toLowerCase();
    return !q ? list : list.filter((u) =>
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)  ||
      u.email?.toLowerCase().includes(q)
    );
  };

  const unassignedAppts = appointments.filter((a) => !a.doctor && a.status === "PENDING");
  const recentAppts     = [...appointments].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="dashboard-shell">
      <Sidebar activeTab={tab} onTabChange={setTab} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Topbar title={TAB_TITLES[tab]} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <>
              <div className="page-header">
                <h2>Medicare Overview</h2>
                <p>Summary of appointments, patients, and doctors.</p>
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>APPOINTMENTS</p>
              <div className="stats-grid" style={{ marginBottom: 28 }}>
                <StatsCard value={stats.total}      label="Total"          color="navy"   />
                <StatsCard value={stats.pending}    label="Pending"        color="orange" />
                <StatsCard value={stats.confirmed}  label="Confirmed"      color="teal"   />
                <StatsCard value={stats.completed}  label="Completed"      color="green"  />
                <StatsCard value={stats.cancelled}  label="Cancelled"      color="red"    />
                <StatsCard value={stats.late}       label="Late / Missed"  color="red"    />
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>USERS</p>
              <div className="stats-grid" style={{ marginBottom: 28 }}>
                <StatsCard value={stats.patients}   label="Patients"       color="teal"   />
                <StatsCard value={stats.doctors}    label="Doctors"        color="navy"   />
                <StatsCard value={stats.unassigned} label="Unassigned"     color="orange" />
              </div>

              {/* Unassigned */}
              <div className="card" style={{ marginBottom: 22 }}>
                <div className="card-header">
                  <h3>
                    Unassigned Appointments
                    {stats.unassigned > 0 && (
                      <span className="badge badge-pending" style={{ marginLeft: 10 }}>{stats.unassigned}</span>
                    )}
                  </h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab("appointments")}>View all</button>
                </div>
                <div className="card-body">
                  {loading ? <Spinner /> : unassignedAppts.length === 0 ? (
                    <div className="empty-state" style={{ padding: "24px 20px" }}>
                      <h4>All appointments are assigned</h4>
                    </div>
                  ) : (
                    <div className="appointments-list">
                      {unassignedAppts.slice(0, 3).map((a) => (
                        <AppointmentCard key={a._id} appt={a} role="ADMIN" onCancel={handleCancel} onAssign={handleAssign} doctors={doctors} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent */}
              <div className="card">
                <div className="card-header">
                  <h3>Recent Appointments</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab("appointments")}>View all</button>
                </div>
                <div className="card-body">
                  {loading ? <Spinner /> : recentAppts.length === 0 ? (
                    <div className="empty-state" style={{ padding: "24px 20px" }}><h4>No appointments yet</h4></div>
                  ) : (
                    <div className="appointments-list">
                      {recentAppts.map((a) => (
                        <AppointmentCard key={a._id} appt={a} role="ADMIN" onCancel={handleCancel} onAssign={handleAssign} doctors={doctors} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ALL APPOINTMENTS */}
          {tab === "appointments" && (
            <>
              <div className="page-header">
                <h2>All Appointments</h2>
                <p>Manage every appointment — assign doctors, confirm, or cancel.</p>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="filters-bar">
                <div className="search-wrap">
                  <span className="search-icon">&#x2315;</span>
                  <input type="text" placeholder="Search by patient, doctor, or reason" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {loading ? <Spinner /> : filteredAppts.length === 0 ? (
                <div className="empty-state">
                  <h4>No appointments found</h4>
                  <p>{appointments.length === 0 ? "No appointments have been booked yet." : "No appointments match your filter."}</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {filteredAppts.map((a) => (
                    <AppointmentCard key={a._id} appt={a} role="ADMIN" onCancel={handleCancel} onAssign={handleAssign} doctors={doctors} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* PATIENTS */}
          {tab === "patients" && (
            <>
              <div className="page-header">
                <h2>Manage Patients</h2>
                <p>View all registered patients and control account access.</p>
              </div>
              <div className="filters-bar">
                <div className="search-wrap">
                  <span className="search-icon">&#x2315;</span>
                  <input type="text" placeholder="Search patients" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                </div>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>{patients.length} patient{patients.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="card">
                {usersLoading ? <Spinner /> : <UserTable users={filterUsers(patients)} onToggleBlock={handleToggleBlock} />}
              </div>
            </>
          )}

          {/* DOCTORS */}
          {tab === "doctors" && (
            <>
              <div className="page-header">
                <h2>Manage Doctors</h2>
                <p>View all doctor accounts and control access.</p>
              </div>
              <div className="filters-bar">
                <div className="search-wrap">
                  <span className="search-icon">&#x2315;</span>
                  <input type="text" placeholder="Search doctors" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setTab("add-doctor")}>+ Add Doctor</button>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>{doctors.length} doctor{doctors.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="card">
                {usersLoading ? <Spinner /> : <UserTable users={filterUsers(doctors)} onToggleBlock={handleToggleBlock} />}
              </div>
            </>
          )}

          {/* ADD DOCTOR */}
          {tab === "add-doctor" && (
            <>
              <div className="page-header">
                <h2>Add Doctor Account</h2>
                <p>Create login credentials for a new doctor. They will be able to log in immediately.</p>
              </div>
              <div className="card" style={{ maxWidth: 600 }}>
                <div className="card-header"><h3>New Doctor Details</h3></div>
                <div className="card-body">
                  {docError   && <div className="alert alert-error">{docError}</div>}
                  {docSuccess && <div className="alert alert-success">{docSuccess}</div>}
                  <form onSubmit={handleAddDoctor}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" name="firstName" placeholder="Jane" value={docForm.firstName} onChange={handleDocChange} required />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" name="lastName" placeholder="Smith" value={docForm.lastName} onChange={handleDocChange} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" name="email" placeholder="doctor@medicare.com" value={docForm.email} onChange={handleDocChange} required />
                    </div>
                    <div className="form-group">
                      <label> Password</label>
                      <input type="password" name="password" placeholder="Min. 6 characters" value={docForm.password} onChange={handleDocChange} required />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      <select name="specialization" value={docForm.specialization} onChange={handleDocChange} required>
                        <option value="">— Select specialization —</option>
                        {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>License Number</label>
                        <input type="text" name="licenseNumber" placeholder="MD-2024-001234" value={docForm.licenseNumber} onChange={handleDocChange} />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={docForm.phone} onChange={handleDocChange} />
                      </div>
                    </div>
                    <div className="alert alert-info" style={{ fontSize: 13, marginBottom: 18 }}>
                      The doctor will be able to log in immediately with these credentials.
                      Share the email and password with them securely.
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button type="submit" className="btn btn-primary" disabled={docLoading}>
                        {docLoading ? "Creating..." : "Create Doctor Account"}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setTab("doctors")}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
