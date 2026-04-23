import { useState, useEffect } from "react";
import axios from "axios";

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

// Generate all 30-min slots 08:00 – 17:00
function generateSlots() {
  const slots = [];
  for (let h = 8; h <= 17; h++) {
    for (let m of [0, 30]) {
      if (h === 17 && m === 30) break;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}
const ALL_SLOTS = generateSlots();

export default function AppointmentCard({
  appt, role, onCancel, onComplete, onAssign, doctors = [],
}) {
  const [showCancelForm,   setShowCancelForm]   = useState(false);
  const [showAssignForm,   setShowAssignForm]    = useState(false);
  const [showCompleteForm, setShowCompleteForm]  = useState(false);
  const [cancelReason,     setCancelReason]      = useState("");
  const [selectedDoc,      setSelectedDoc]       = useState("");
  const [selectedSlot,     setSelectedSlot]      = useState("");
  const [busy,             setBusy]              = useState(false);

  // Slot availability state
  const [slots,        setSlots]        = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Confirmation form fields
  const [diagnosis,     setDiagnosis]     = useState("");
  const [medication,    setMedication]    = useState("");
  const [followUpDate,  setFollowUpDate]  = useState("");
  const [referralNotes, setReferralNotes] = useState("");

  const apptDate = appt.appointmentDate.split("T")[0];
  const late     = isLate(appt);
  const date     = formatDate(appt.appointmentDate);

  const canCancel   = !["CANCELLED", "COMPLETED"].includes(appt.status);
  const canComplete = role === "DOCTOR"
    && !["COMPLETED", "CANCELLED"].includes(appt.status);
  const canAssign   = role === "ADMIN"
    && !["CANCELLED", "COMPLETED"].includes(appt.status);

  // Fetch booked slots when doctor is selected in assign form
  useEffect(() => {
    if (!showAssignForm || !selectedDoc || !apptDate) {
      setSlots([]); return;
    }
    const fetch = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await axios.get(
          `/api/appointments/slots?doctorId=${selectedDoc}&date=${apptDate}`
        );
        setSlots(data.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetch();
  }, [selectedDoc, apptDate, showAssignForm]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setBusy(true);
    await onCancel(appt._id, cancelReason);
    setBusy(false);
    setShowCancelForm(false);
    setCancelReason("");
  };

  const handleAssign = async () => {
    if (!selectedDoc || !selectedSlot) return;
    setBusy(true);
    await onAssign(appt._id, selectedDoc, selectedSlot);
    setBusy(false);
    setShowAssignForm(false);
    setSelectedDoc(""); setSelectedSlot(""); setSlots([]);
  };

  const handleComplete = async () => {
    if (!diagnosis.trim() || !medication.trim()) return;
    setBusy(true);
    await onComplete(appt._id, {
      diagnosis:     diagnosis.trim(),
      medication:    medication.trim(),
      followUpDate:  followUpDate || null,
      referralNotes: referralNotes.trim() || null,
    });
    setBusy(false);
    setShowCompleteForm(false);
    setDiagnosis(""); setMedication(""); setFollowUpDate(""); setReferralNotes("");
  };

  const closeAll = () => {
    setShowCancelForm(false);
    setShowAssignForm(false);
    setShowCompleteForm(false);
    setCancelReason("");
    setSelectedDoc(""); setSelectedSlot(""); setSlots([]);
    setDiagnosis(""); setMedication(""); setFollowUpDate(""); setReferralNotes("");
  };

  // Slot grid for assign form
  const slotGrid = () => {
    if (!selectedDoc) return null;
    if (slotsLoading) return <p style={{ fontSize: 13, color: "var(--muted)", margin: "8px 0" }}>Loading available slots…</p>;
    if (!slots.length) return null;

    const bookedTimes = new Set(slots.filter(s => !s.available).map(s => s.time));

    return (
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
          Select Time Slot for {apptDate}{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>
            ({slots.filter(s => s.available).length} available)
          </span>
        </label>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: 6,
        }}>
          {ALL_SLOTS.map((time) => {
            const booked    = bookedTimes.has(time);
            const selected  = selectedSlot === time;
            const isPast    = new Date(`${apptDate}T${time}`) < new Date();
            const disabled  = booked || isPast;
            const bookedInfo = slots.find(s => s.time === time && !s.available);

            return (
              <button
                key={time}
                type="button"
                title={
                  booked
                    ? `Booked — ${bookedInfo?.appointment?.patient
                        ? `${bookedInfo.appointment.patient.firstName} ${bookedInfo.appointment.patient.lastName}`
                        : "Occupied"}`
                    : isPast
                    ? "Past time"
                    : "Available"
                }
                style={{
                  padding: "6px 4px",
                  fontSize: 12,
                  fontWeight: selected ? 700 : 400,
                  borderRadius: 6,
                  border: selected
                    ? "2px solid var(--teal)"
                    : "1px solid " + (disabled ? "#FECACA" : "#D1D5DB"),
                  background: selected
                    ? "var(--teal)"
                    : booked
                    ? "#FEE2E2"
                    : isPast
                    ? "#F3F4F6"
                    : "#F0FDF4",
                  color: selected
                    ? "#fff"
                    : booked
                    ? "#991B1B"
                    : isPast
                    ? "#9CA3AF"
                    : "#065F46",
                  cursor: disabled ? "not-allowed" : "pointer",
                  textDecoration: disabled ? "line-through" : "none",
                }}
                onClick={() => !disabled && setSelectedSlot(time)}
                disabled={disabled}
              >
                {formatTime(time)}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
          <span style={{ color: "#065F46" }}>■ Available</span>
          <span style={{ color: "#991B1B" }}>■ Booked</span>
          <span style={{ color: "var(--teal)", fontWeight: 700 }}>■ Selected</span>
        </div>
      </div>
    );
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

        {appt.doctorRequest && (
          <div className="appt-doctor-request">
            <strong>Requested Doctor:</strong> {appt.doctorRequest}
          </div>
        )}

        {appt.reason && (
          <div className="appt-reason">Reason: {appt.reason}</div>
        )}

        {/* Completion info */}
        {appt.status === "COMPLETED" && appt.completedAt && (
          <div className="appt-complete-info">
            <div style={{ marginBottom: 6 }}>
              <strong>Completed on:</strong> {formatDateTime(appt.completedAt)}
            </div>
            {appt.diagnosis     && <div><strong>Diagnosis:</strong> {appt.diagnosis}</div>}
            {appt.medication    && <div><strong>Medication / Treatment:</strong> {appt.medication}</div>}
            {appt.followUpDate  && (
              <div>
                <strong>Follow-up Date:</strong>{" "}
                {new Date(appt.followUpDate).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </div>
            )}
            {appt.referralNotes && <div><strong>Referral Notes:</strong> {appt.referralNotes}</div>}
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
              {appt.cancelledAt ? ` on ${formatDateTime(appt.cancelledAt)}` : ""}
            </strong>
            Reason: {appt.cancelReason}
          </div>
        )}

        {/* ── Inline Doctor Confirmation Form ── */}
        {showCompleteForm && (
          <div className="inline-form">
            <p style={{ marginBottom: 10, fontWeight: 600, color: "var(--navy)" }}>
              Complete Appointment — Fill in visit details
            </p>
            <div className="form-group">
              <label>Diagnosis <span style={{ color: "var(--danger)" }}>*</span></label>
              <textarea rows={2} placeholder="Enter diagnosis (required)"
                value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Medication / Treatment Notes <span style={{ color: "var(--danger)" }}>*</span></label>
              <textarea rows={2} placeholder="Enter prescribed medication or treatment (required)"
                value={medication} onChange={(e) => setMedication(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Follow-up Date <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
              <input type="date" value={followUpDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFollowUpDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Referral Notes <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
              <textarea rows={2} placeholder="Any referrals made during this visit (optional)"
                value={referralNotes} onChange={(e) => setReferralNotes(e.target.value)} />
            </div>
            <div className="inline-form-actions">
              <button className="btn btn-success btn-sm" onClick={handleComplete}
                disabled={busy || !diagnosis.trim() || !medication.trim()}>
                {busy ? "Saving..." : "Submit & Mark Complete"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={closeAll} disabled={busy}>Dismiss</button>
            </div>
          </div>
        )}

        {/* ── Inline Cancel Form ── */}
        {showCancelForm && (
          <div className="inline-form">
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Cancellation Reason <span style={{ color: "var(--danger)" }}>*</span></label>
              <textarea rows={2} placeholder="Please provide a reason for cancellation"
                value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            </div>
            <div className="inline-form-actions">
              <button className="btn btn-danger btn-sm" onClick={handleCancel}
                disabled={busy || !cancelReason.trim()}>
                {busy ? "Cancelling..." : "Confirm Cancellation"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={closeAll}>Dismiss</button>
            </div>
          </div>
        )}

        {/* ── Inline Assign Form (Admin) — with slot picker ── */}
        {showAssignForm && (
          <div className="inline-form">
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label>Select Doctor</label>
              <select value={selectedDoc} onChange={(e) => {
                setSelectedDoc(e.target.value);
                setSelectedSlot("");
              }}>
                <option value="">— Select a doctor —</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    Dr. {d.firstName} {d.lastName}
                    {d.specialization ? ` — ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Slot availability grid */}
            {slotGrid()}

            {selectedSlot && (
              <div style={{
                marginTop: 10, padding: "8px 12px",
                background: "#F0FDF4", borderRadius: 6,
                fontSize: 13, color: "#065F46", fontWeight: 600,
              }}>
                ✓ Selected time: {formatTime(selectedSlot)} on {apptDate}
              </div>
            )}

            <div className="inline-form-actions" style={{ marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={handleAssign}
                disabled={busy || !selectedDoc || !selectedSlot}>
                {busy ? "Assigning..." : "Assign Doctor"}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={closeAll}>Dismiss</button>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="appt-card-footer">
        <span className="appt-id-str">Ref: {appt._id?.slice(-8).toUpperCase()}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canAssign && !showAssignForm && !showCancelForm && !showCompleteForm && (
            <button className="btn btn-outline btn-sm" onClick={() => setShowAssignForm(true)}>
              Assign Doctor
            </button>
          )}
          {canComplete && !showCompleteForm && !showCancelForm && (
            <button className="btn btn-success btn-sm" onClick={() => setShowCompleteForm(true)}>
              Mark Complete
            </button>
          )}
          {canCancel && !showCancelForm && !showAssignForm && !showCompleteForm && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowCancelForm(true)}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
