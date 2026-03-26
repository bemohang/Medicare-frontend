import { useState } from "react";
import axios from "axios";

export default function BookingModal({ onClose, onBooked }) {
  const [form, setForm] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reason:          "",
    doctorRequest:   "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // 08:00 – 17:30 in 30-min steps
  const timeSlots = [];
  for (let h = 8; h <= 17; h++) {
    for (const m of ["00", "30"]) {
      if (h === 17 && m === "30") break;
      timeSlots.push(`${String(h).padStart(2, "0")}:${m}`);
    }
  }

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.appointmentDate || !form.appointmentTime) {
      setError("Please select a date and time.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post("/api/appointments", {
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason:          form.reason    || undefined,
        doctorRequest:   form.doctorRequest || undefined,
      });
      onBooked(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>Book an Appointment</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label>Preferred Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  min={today}
                  value={form.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preferred Time</label>
                <select
                  name="appointmentTime"
                  value={form.appointmentTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Select time —</option>
                  {timeSlots.map((t) => {
                    const [h, m] = t.split(":");
                    const hr    = parseInt(h, 10);
                    const label = `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
                    return <option key={t} value={t}>{label}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Reason for Visit</label>
              <textarea
                name="reason"
                rows={3}
                placeholder="Briefly describe your symptoms or reason for the visit"
                value={form.reason}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Preferred Doctor (Optional Request)</label>
              <input
                type="text"
                name="doctorRequest"
                placeholder="e.g. Dr. Smith (admin will confirm availability)"
                value={form.doctorRequest}
                onChange={handleChange}
              />
            </div>

            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              A doctor will be assigned to your appointment by our administration team.
              Your preferred doctor request will be taken into consideration.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
