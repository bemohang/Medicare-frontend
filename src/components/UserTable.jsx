import { useState } from "react";

export default function UserTable({ users, onToggleBlock }) {
  const [busy, setBusy] = useState(null);

  const handleToggle = async (u) => {
    setBusy(u._id);
    await onToggleBlock(u._id, !u.isBlocked);
    setBusy(null);
  };

  if (!users.length) {
    return (
      <div className="empty-state">
        <h4>No users found</h4>
        <p>No users match the current filter.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Details</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="td-name">{u.firstName} {u.lastName}</td>
              <td className="td-muted">{u.email}</td>
              <td>
                <span className={`badge ${
                  u.role === "DOCTOR" ? "badge-confirmed" :
                  u.role === "ADMIN"  ? "badge-pending"   : "badge-completed"
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="td-muted">
                {u.role === "DOCTOR" && u.specialization
                  ? u.specialization
                  : u.role === "PATIENT" && u.bloodGroup
                  ? `Blood: ${u.bloodGroup}`
                  : "—"}
              </td>
              <td>
                {u.isBlocked
                  ? <span className="badge badge-cancelled">Blocked</span>
                  : <span className="badge badge-completed">Active</span>}
              </td>
              <td className="td-muted">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td>
                <button
                  className={`btn btn-sm ${u.isBlocked ? "btn-success" : "btn-danger"}`}
                  onClick={() => handleToggle(u)}
                  disabled={busy === u._id}
                >
                  {busy === u._id ? "..." : u.isBlocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
