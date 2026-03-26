import { useState } from "react";

// Determine if an appointment is overdue past date+time, still PENDING or CONFIRMED
export function isLate(appt) {
  if (!["PENDING", "CONFIRMED"].includes(appt.status)) return false;
  const apptDateTime = new Date(
    `${appt.appointmentDate.split("T")[0]}T${appt.appointmentTime}`
  );
  return apptDateTime < new Date();
}

function formatDate(iso) {
  const d = new Date(iso);
  return {
    day:   d.getDate(),
    month: d.toLocaleString("default", { month: "short" }),
    full:  d.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }),
  };
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour   = parseInt(h, 10);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

const STATUS_CLS = {
  PENDING:   "badge-pending",
  CONFIRMED: "badge-confirmed",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
};

export default function AppointmentCard({
  appt, role, onCancel, onComplete, onAssign, doctors = [],
}) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [cancelReason,   setCancelReason]   = useState("");
  const [selectedDoc,    setSelectedDoc]    = useState("");
  const [busy,           setBusy]           = useState(false);

  const late   = isLate(appt);
  const date   = formatDate(appt.appointmentDate);

  const canCancel   = !["CANCELLED", "COMPLETED"].includes(appt.status);
  const canComplete = role === "DOCTOR"
    && !["COMPLETED", "CANCELLED"].includes(appt.status);
  const canAssign   = role === "ADMIN"
    && !["CANCELLED", "COMPLETED"].includes(appt.status);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setBusy(true);
    await onCancel(appt._id, cancelReason);
    setBusy(false);
    setShowCancelForm(false);
    setCancelReason("");
  };

  const handleAssign = async () => {
    if (!selectedDoc) return;
    setBusy(true);
    await onAssign(appt._id, selectedDoc);
    setBusy(false);
    setShowAssignForm(false);
    setSelectedDoc("");
  };

  const handleComplete = async () => {
    setBusy(true);
    await onComplete(appt._id);
    setBusy(false);
  };

  return (
    <div className="appt-card">
      {/* Header */}
      <div className="appt-card-header">
        <div className="appt-datetime">
          <div className="appt-date-block">
            <div className="day">{date.day}</div>
            <div className="month">{date.month}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--navy)" }}>
              {date.full}
            </div>
            <div className="appt-time-str">{formatTime(appt.appointmentTime)}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
           {late && (
            <span className="badge" style={{
              background: "#FEF2F2", color: "#991B1B",
              border: "1px solid #FECACA",
            }}>
              LATE 
            </span>
          )}
          <span className={`badge ${STATUS_CLS[appt.status] ?? "badge-pending"}`}>
            {appt.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="appt-card-body">
        <div className="appt-parties">
          {role !== "PATIENT" && appt.patient && (
            <div className="appt-party">
              <span>Patient</span>
              <strong>{appt.patient.firstName} {appt.patient.lastName}</strong>
              <small>{appt.patient.email}</small>
              {appt.patient.bloodGroup && (
                <small>Blood: {appt.patient.bloodGroup}</small>
              )}
            </div>
          )}
          <div className="appt-party">
            <span>Doctor</span>
            {appt.doctor ? (
              <>
                <strong>Dr. {appt.doctor.firstName} {appt.doctor.lastName}</strong>
                {appt.doctor.specialization && (
                  <small>{appt.doctor.specialization}</small>
                )}
              </>
            ) : (
              <strong style={{ color: "var(--pending)", fontStyle: "italic" }}>
                Not assigned yet! Waiting
              </strong>
            )}
          </div>
        </div>

        {/* Doctor request note  */}
        {appt.doctorRequest && (
          <div className="appt-doctor-request">
            <strong>Requested Doctor:</strong> {appt.doctorRequest}
          </div>
        )}

        {/* Reason */}
        {appt.reason && (
          <div className="appt-reason">
            Reason: {appt.reason}
          </div>
        )}

        {/* Completion info with exact timestamp */}
        {appt.status === "COMPLETED" && appt.completedAt && (
          <div className="appt-complete-info">
            <strong>Completed on:</strong> {formatDateTime(appt.completedAt)}
          </div>
        )}

        {/* Cancellation info */}
        {appt.status === "CANCELLED" && appt.cancelReason && (
          <div className="appt-cancel-info">
            <strong>
              Cancelled by {appt.cancelledByRole ?? ""}
              {appt.cancelledBy
                ? ` — ${appt.cancelledBy.firstName} ${appt.cancelledBy.lastName}`
                : ""}
              {appt.cancelledAt
                ? ` on ${formatDateTime(appt.cancelledAt)}`
                : ""}
            </strong>
            Reason: {appt.cancelReason}
          </div>
        )}

        {/* Inline cancel form */}
        {showCancelForm && (
          <div className="inline-form">
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Cancellation Reason (*required)</label>
              <textarea
                rows={2}
                placeholder="Please provide a reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="inline-form-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={handleCancel}
                disabled={busy || !cancelReason.trim()}
              >
                {busy ? "Cancelling..." : "Confirm Cancellation"}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowCancelForm(false); setCancelReason(""); }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Inline assign form (Admin) */}
        {showAssignForm && (
          <div className="inline-form">
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Assign Doctor</label>
              <select value={selectedDoc} onChange={(e) => setSelectedDoc(e.target.value)}>
                <option value="">— Select a doctor —</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.firstName} {d.lastName}
                    {d.specialization ? ` — ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="inline-form-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAssign}
                disabled={busy || !selectedDoc}
              >
                {busy ? "Assigning..." : "Assign Doctor"}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setShowAssignForm(false); setSelectedDoc(""); }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="appt-card-footer">
        <span className="appt-id-str">
          Ref: {appt._id?.slice(-8).toUpperCase()}
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canAssign && !showAssignForm && !showCancelForm && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowAssignForm(true)}
            >
              Assign Doctor
            </button>
          )}
          {canComplete && !showCancelForm && (
            <button
              className="btn btn-success btn-sm"
              onClick={handleComplete}
              disabled={busy}
            >
              {busy ? "Saving..." : "Mark Complete"}
            </button>
          )}
          {canCancel && !showCancelForm && !showAssignForm && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setShowCancelForm(true)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
