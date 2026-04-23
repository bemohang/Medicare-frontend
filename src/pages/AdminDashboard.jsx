import { useState, useEffect, useCallback } from "react";
import ProfilePage from "./ProfilePage";
import axios from "axios";
import Sidebar         from "../components/Sidebar";
import Topbar          from "../components/Topbar";
import AppointmentCard, { isLate } from "../components/AppointmentCard";
import UserTable       from "../components/UserTable";
import StatsCard       from "../components/StatsCard";
import Spinner         from "../components/Spinner";

const TAB_TITLES = {
  overview:          "Admin Overview",
  appointments:      "All Appointments",
  patients:          "Manage Patients",
  doctors:           "Manage Doctors",
  "add-doctor":      "Add Doctor Account",
  specializations:   "Manage Specializations",
  "add-admin":       "Add Admin Account",
  profile:           "My Profile",
};

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

  // ── Add Admin form state ─────────────────────────────────────
  const [adminForm,    setAdminForm]    = useState({
    firstName: "", lastName: "", email: "", password: "",
  });
  const [adminError,   setAdminError]   = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // ── Specializations state ─────────────────────────────────────
  const [specs,        setSpecs]        = useState([]);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [newSpecName,  setNewSpecName]  = useState("");
  const [specError,    setSpecError]    = useState("");
  const [specSuccess,  setSpecSuccess]  = useState("");
  const [editingSpec,  setEditingSpec]  = useState(null); // { _id, name }
  const [editName,     setEditName]     = useState("");

  // ── Add Doctor form state ─────────────────────────────────────
  const [docForm, setDocForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    specialization: "", licenseNumber: "", phone: "",
  });
  const [docError,   setDocError]   = useState("");
  const [docSuccess, setDocSuccess] = useState("");
  const [docLoading, setDocLoading] = useState(false);

  // ── Fetch functions ───────────────────────────────────────────
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

  const fetchSpecs = useCallback(async () => {
    setSpecsLoading(true);
    try {
      const { data } = await axios.get("/api/specializations");
      setSpecs(data);
    } catch { setSpecError("Failed to load specializations."); }
    finally { setSpecsLoading(false); }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
    fetchSpecs();
  }, [fetchAppointments, fetchUsers, fetchSpecs]);

  // ── Appointment handlers ──────────────────────────────────────
  const handleCancel = async (id, reason) => {
    try {
      const { data } = await axios.put(`/api/appointments/${id}/cancel`, { cancelReason: reason });
      setAppointments((prev) => prev.map((a) => a._id === id ? data : a));
    } catch (err) { alert(err.response?.data?.message || "Failed to cancel."); }
  };

  const handleAssign = async (apptId, doctorId, appointmentTime) => {
    try {
      const { data } = await axios.put(`/api/appointments/${apptId}/assign`, { doctorId, appointmentTime });
      setAppointments((prev) => prev.map((a) => a._id === apptId ? data : a));
    } catch (err) { alert(err.response?.data?.message || "Failed to assign doctor."); }
  };

  // ── User handlers ─────────────────────────────────────────────
  const handleToggleBlock = async (userId, blocked) => {
    try {
      const { data } = await axios.put(`/api/users/${userId}/block`, { blocked });
      const u = data.user;
      setPatients((prev) => prev.map((p) => p._id === userId ? u : p));
      setDoctors((prev)  => prev.map((d) => d._id === userId ? u : d));
    } catch (err) { alert(err.response?.data?.message || "Failed to update user."); }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}`);
      setPatients((prev) => prev.filter((p) => p._id !== userId));
      setDoctors((prev)  => prev.filter((d) => d._id !== userId));
    } catch (err) { alert(err.response?.data?.message || "Failed to delete user."); }
  };

  // ── Add Admin ─────────────────────────────────────────────────
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminError(""); setAdminSuccess("");
    if (adminForm.password.length < 6) {
      setAdminError("Password must be at least 6 characters."); return;
    }
    setAdminLoading(true);
    try {
      await axios.post("/api/auth/create-admin", adminForm);
      setAdminSuccess(`Admin account created for ${adminForm.firstName} ${adminForm.lastName}. They can now log in immediately.`);
      setAdminForm({ firstName: "", lastName: "", email: "", password: "" });
    } catch (err) {
      setAdminError(err.response?.data?.message || "Failed to create admin account.");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminChange = (e) => setAdminForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Add Doctor ────────────────────────────────────────────────
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setDocError(""); setDocSuccess("");
    if (docForm.password.length < 6) { setDocError("Password must be at least 6 characters."); return; }
    setDocLoading(true);
    try {
      await axios.post("/api/auth/create-doctor", docForm);
      setDocSuccess(`Doctor account created for ${docForm.firstName} ${docForm.lastName}. They can now log in.`);
      setDocForm({ firstName: "", lastName: "", email: "", password: "", specialization: "", licenseNumber: "", phone: "" });
      fetchUsers();
    } catch (err) {
      setDocError(err.response?.data?.message || "Failed to create doctor account.");
    } finally {
      setDocLoading(false);
    }
  };

  const handleDocChange = (e) => setDocForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Specialization handlers ───────────────────────────────────
  const handleAddSpec = async (e) => {
    e.preventDefault();
    setSpecError(""); setSpecSuccess("");
    if (!newSpecName.trim()) { setSpecError("Please enter a specialization name."); return; }
    try {
      const { data } = await axios.post("/api/specializations", { name: newSpecName.trim() });
      setSpecs((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSpecName("");
      setSpecSuccess(`"${data.name}" added successfully.`);
    } catch (err) { setSpecError(err.response?.data?.message || "Failed to add specialization."); }
  };

  const handleEditSpec = (spec) => {
    setEditingSpec(spec);
    setEditName(spec.name);
    setSpecError(""); setSpecSuccess("");
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) { setSpecError("Name cannot be empty."); return; }
    try {
      const { data } = await axios.put(`/api/specializations/${editingSpec._id}`, { name: editName.trim() });
      setSpecs((prev) => prev.map((s) => s._id === data._id ? data : s).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingSpec(null); setEditName("");
      setSpecSuccess(`Updated to "${data.name}".`);
    } catch (err) { setSpecError(err.response?.data?.message || "Failed to update."); }
  };

  const handleDeleteSpec = async (spec) => {
    if (!window.confirm(`Delete "${spec.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/specializations/${spec._id}`);
      setSpecs((prev) => prev.filter((s) => s._id !== spec._id));
      setSpecSuccess(`"${spec.name}" deleted.`);
    } catch (err) { setSpecError(err.response?.data?.message || "Failed to delete."); }
  };

  // ── Stats & filters ───────────────────────────────────────────
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
        <Topbar title={TAB_TITLES[tab] || "Admin"} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <>
              <div className="page-header">
                <h2>Medicare Overview</h2>
                <p>Summary of appointments, patients, and doctors.</p>
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>APPOINTMENTS</p>
              <div className="stats-grid" style={{ marginBottom: 28 }}>
                <StatsCard value={stats.total}      label="Total"         color="navy"   />
                <StatsCard value={stats.pending}    label="Pending"       color="orange" />
                <StatsCard value={stats.confirmed}  label="Confirmed"     color="teal"   />
                <StatsCard value={stats.completed}  label="Completed"     color="green"  />
                <StatsCard value={stats.cancelled}  label="Cancelled"     color="red"    />
                <StatsCard value={stats.late}       label="Late / Missed" color="red"    />
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 10 }}>USERS</p>
              <div className="stats-grid" style={{ marginBottom: 28 }}>
                <StatsCard value={stats.patients}   label="Patients"   color="teal"   />
                <StatsCard value={stats.doctors}    label="Doctors"    color="navy"   />
                <StatsCard value={stats.unassigned} label="Unassigned" color="orange" />
              </div>

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

          {/* ── ALL APPOINTMENTS ── */}
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

          {/* ── PATIENTS ── */}
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
                {usersLoading ? <Spinner /> : <UserTable users={filterUsers(patients)} onToggleBlock={handleToggleBlock} onDelete={handleDelete} />}
              </div>
            </>
          )}

          {/* ── DOCTORS ── */}
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
                {usersLoading ? <Spinner /> : <UserTable users={filterUsers(doctors)} onToggleBlock={handleToggleBlock} onDelete={handleDelete} />}
              </div>
            </>
          )}

          {/* ── ADD DOCTOR ── */}
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
                      <label>Password</label>
                      <input type="password" name="password" placeholder="Min. 6 characters" value={docForm.password} onChange={handleDocChange} required />
                    </div>
                    <div className="form-group">
                      <label>Specialization</label>
                      {specs.length === 0 ? (
                        <div className="alert alert-info" style={{ fontSize: 13 }}>
                          No specializations found.{" "}
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTab("specializations")}>
                            Add specializations first →
                          </button>
                        </div>
                      ) : (
                        <select name="specialization" value={docForm.specialization} onChange={handleDocChange} required>
                          <option value="">— Select specialization —</option>
                          {specs.map((s) => (
                            <option key={s._id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      )}
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
                      <button type="submit" className="btn btn-primary" disabled={docLoading || specs.length === 0}>
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

          {/* ── SPECIALIZATIONS ── */}
          {tab === "specializations" && (
            <>
              <div className="page-header">
                <h2>Manage Specializations</h2>
                <p>Add, edit, or remove medical specializations. Changes reflect immediately in the Add Doctor form.</p>
              </div>

              {/* Add new */}
              <div className="card" style={{ maxWidth: 560, marginBottom: 24 }}>
                <div className="card-header"><h3>Add New Specialization</h3></div>
                <div className="card-body">
                  {specError   && <div className="alert alert-error"   style={{ marginBottom: 12 }}>{specError}</div>}
                  {specSuccess && <div className="alert alert-success" style={{ marginBottom: 12 }}>{specSuccess}</div>}
                  <form onSubmit={handleAddSpec} style={{ display: "flex", gap: 10 }}>
                    <input
                      type="text"
                      placeholder="e.g. Neurosurgery"
                      value={newSpecName}
                      onChange={(e) => setNewSpecName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm">
                      Add
                    </button>
                  </form>
                </div>
              </div>

              {/* List */}
              <div className="card">
                <div className="card-header">
                  <h3>Current Specializations</h3>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>{specs.length} total</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {specsLoading ? <Spinner /> : specs.length === 0 ? (
                    <div className="empty-state" style={{ padding: "32px 20px" }}>
                      <h4>No specializations yet</h4>
                      <p>Add your first specialization above to get started.</p>
                    </div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Specialization Name</th>
                            <th>Added</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {specs.map((s, i) => (
                            <tr key={s._id}>
                              <td className="td-muted">{i + 1}</td>
                              <td>
                                {editingSpec?._id === s._id ? (
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ width: "100%", padding: "4px 8px" }}
                                    autoFocus
                                  />
                                ) : (
                                  <strong>{s.name}</strong>
                                )}
                              </td>
                              <td className="td-muted">
                                {new Date(s.createdAt).toLocaleDateString()}
                              </td>
                              <td>
                                {editingSpec?._id === s._id ? (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>Save</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingSpec(null); setEditName(""); }}>Cancel</button>
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button className="btn btn-outline btn-sm" onClick={() => handleEditSpec(s)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSpec(s)}>Delete</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}


          {/* ── ADD ADMIN ── */}
          {tab === "add-admin" && (
            <>
              <div className="page-header">
                <h2>Add Admin Account</h2>
                <p>Create a new administrator account. The new admin can log in immediately with full access.</p>
              </div>
              <div className="card" style={{ maxWidth: 500 }}>
                <div className="card-header"><h3>New Admin Details</h3></div>
                <div className="card-body">
                  {adminError   && <div className="alert alert-error">{adminError}</div>}
                  {adminSuccess && <div className="alert alert-success">{adminSuccess}</div>}
                  <form onSubmit={handleAddAdmin}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text" name="firstName" placeholder="Mark"
                          value={adminForm.firstName} onChange={handleAdminChange} required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text" name="lastName" placeholder="Johnson"
                          value={adminForm.lastName} onChange={handleAdminChange} required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email" name="email" placeholder="admin@medicare.com"
                        value={adminForm.email} onChange={handleAdminChange} required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password" name="password" placeholder="Min. 6 characters"
                        value={adminForm.password} onChange={handleAdminChange} required
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input
                        type="text" value="ADMIN" readOnly
                        style={{ background: "var(--grey-lt)", color: "var(--muted)", cursor: "not-allowed" }}
                      />
                    </div>
                    <div className="alert alert-info" style={{ fontSize: 13, marginBottom: 18 }}>
                      The new admin will have full access to the dashboard including all tabs.
                      Share the credentials with them securely.
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button type="submit" className="btn btn-primary" disabled={adminLoading}>
                        {adminLoading ? "Creating..." : "Create Admin Account"}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setAdminForm({ firstName: "", lastName: "", email: "", password: "" })}>
                        Clear
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}


          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <ProfilePage />
          )}

        </main>
      </div>
    </div>
  );
}
