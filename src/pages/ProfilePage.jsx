import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // ── General info form ─────────────────────────────────────────
  const [info, setInfo] = useState({
    firstName:   user?.firstName   || "",
    lastName:    user?.lastName    || "",
    phone:       user?.phone       || "",
    gender:      user?.gender      || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    bloodGroup:  user?.bloodGroup  || "",
  });
  const [infoMsg,     setInfoMsg]     = useState("");
  const [infoError,   setInfoError]   = useState("");
  const [infoLoading, setInfoLoading] = useState(false);

  // ── Email change form ─────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({
    newEmail: "", currentPasswordForEmail: "",
  });
  const [emailMsg,     setEmailMsg]     = useState("");
  const [emailError,   setEmailError]   = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // ── Password change form ──────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [pwMsg,     setPwMsg]     = useState("");
  const [pwError,   setPwError]   = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────
  const handleInfoChange = (e) =>
    setInfo((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleEmailChange = (e) =>
    setEmailForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePwChange = (e) =>
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Save general info
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoMsg(""); setInfoError("");
    setInfoLoading(true);
    try {
      const { data } = await axios.put("/api/users/me/profile", {
        firstName:   info.firstName,
        lastName:    info.lastName,
        phone:       info.phone    || null,
        gender:      info.gender   || null,
        dateOfBirth: info.dateOfBirth || null,
        bloodGroup:  info.bloodGroup  || null,
      });
      updateUser({
        firstName:   data.user.firstName,
        lastName:    data.user.lastName,
        phone:       data.user.phone,
        gender:      data.user.gender,
        dateOfBirth: data.user.dateOfBirth,
        bloodGroup:  data.user.bloodGroup,
      });
      setInfoMsg("Profile updated successfully.");
    } catch (err) {
      setInfoError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setInfoLoading(false);
    }
  };

  // Save email change
  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setEmailMsg(""); setEmailError("");
    if (!emailForm.newEmail || !emailForm.currentPasswordForEmail) {
      setEmailError("Both fields are required."); return;
    }
    setEmailLoading(true);
    try {
      const { data } = await axios.put("/api/users/me/profile", {
        newEmail:               emailForm.newEmail,
        currentPasswordForEmail: emailForm.currentPasswordForEmail,
      });
      updateUser({ email: data.user.email });
      setEmailMsg("Email updated successfully.");
      setEmailForm({ newEmail: "", currentPasswordForEmail: "" });
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  // Save password change
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPwMsg(""); setPwError("");
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("All password fields are required."); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match."); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters."); return;
    }
    setPwLoading(true);
    try {
      await axios.put("/api/users/me/profile", {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setPwMsg("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const isPatient = user?.role === "PATIENT";
  const isDoctor  = user?.role === "DOCTOR";

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Update your personal details. Email and password changes require your current password.</p>
      </div>

      {/* ── Current info display ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Account Info</h3></div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", fontSize: 14 }}>
            <div><span style={{ color: "var(--muted)" }}>Name</span><br /><strong>{user?.firstName} {user?.lastName}</strong></div>
            <div><span style={{ color: "var(--muted)" }}>Email</span><br /><strong>{user?.email}</strong></div>
            <div><span style={{ color: "var(--muted)" }}>Role</span><br /><strong>{user?.role}</strong></div>
            {isDoctor  && <div><span style={{ color: "var(--muted)" }}>Specialization</span><br /><strong>{user?.specialization || "—"}</strong></div>}
            {isPatient && <div><span style={{ color: "var(--muted)" }}>Blood Group</span><br /><strong>{user?.bloodGroup || "—"}</strong></div>}
            {user?.phone && <div><span style={{ color: "var(--muted)" }}>Phone</span><br /><strong>{user.phone}</strong></div>}
          </div>
        </div>
      </div>

      {/* ── General info form ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Update Personal Details</h3></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            These fields can be updated without verifying your password.
          </p>
          {infoError && <div className="alert alert-error"   style={{ marginBottom: 12 }}>{infoError}</div>}
          {infoMsg   && <div className="alert alert-success" style={{ marginBottom: 12 }}>{infoMsg}</div>}
          <form onSubmit={handleSaveInfo}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" value={info.firstName} onChange={handleInfoChange} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={info.lastName} onChange={handleInfoChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={info.phone} onChange={handleInfoChange} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={info.gender} onChange={handleInfoChange}>
                  <option value="">— Select —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            {isPatient && (
              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={info.dateOfBirth} onChange={handleInfoChange} />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select name="bloodGroup" value={info.bloodGroup} onChange={handleInfoChange}>
                    <option value="">— Select —</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {isDoctor && (
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dateOfBirth" value={info.dateOfBirth} onChange={handleInfoChange} />
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={infoLoading}>
              {infoLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Email change form ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3>Change Email Address</h3></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            Current email: <strong>{user?.email}</strong>. Your current password is required to change this.
          </p>
          {emailError && <div className="alert alert-error"   style={{ marginBottom: 12 }}>{emailError}</div>}
          {emailMsg   && <div className="alert alert-success" style={{ marginBottom: 12 }}>{emailMsg}</div>}
          <form onSubmit={handleSaveEmail}>
            <div className="form-group">
              <label>New Email Address</label>
              <input
                type="email" name="newEmail"
                placeholder="newemail@example.com"
                value={emailForm.newEmail}
                onChange={handleEmailChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Current Password <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="password" name="currentPasswordForEmail"
                placeholder="Enter your current password to confirm"
                value={emailForm.currentPasswordForEmail}
                onChange={handleEmailChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={emailLoading}>
              {emailLoading ? "Updating..." : "Update Email"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Password change form ── */}
      <div className="card">
        <div className="card-header"><h3>Change Password</h3></div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            You must verify your current password before setting a new one.
          </p>
          {pwError && <div className="alert alert-error"   style={{ marginBottom: 12 }}>{pwError}</div>}
          {pwMsg   && <div className="alert alert-success" style={{ marginBottom: 12 }}>{pwMsg}</div>}
          <form onSubmit={handleSavePassword}>
            <div className="form-group">
              <label>Current Password <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="password" name="currentPassword"
                placeholder="Enter your current password"
                value={pwForm.currentPassword}
                onChange={handlePwChange}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="password" name="newPassword"
                placeholder="Min. 6 characters"
                value={pwForm.newPassword}
                onChange={handlePwChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password <span style={{ color: "var(--danger)" }}>*</span></label>
              <input
                type="password" name="confirmPassword"
                placeholder="Repeat new password"
                value={pwForm.confirmPassword}
                onChange={handlePwChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
