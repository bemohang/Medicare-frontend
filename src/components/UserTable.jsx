import { useState } from "react";

export default function UserTable({ users, onToggleBlock, onDelete }) {
  const [busyBlock,  setBusyBlock]  = useState(null);
  const [busyDelete, setBusyDelete] = useState(null);

  const handleToggle = async (u) => {
    setBusyBlock(u._id);
    await onToggleBlock(u._id, !u.isBlocked);
    setBusyBlock(null);
  };

  const handleDelete = async (u) => {
    const confirmed = window.confirm(
      `Permanently delete ${u.firstName} ${u.lastName}?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;
    setBusyDelete(u._id);
    await onDelete(u._id);
    setBusyDelete(null);
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
            <th>Actions</th>
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
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    className={`btn btn-sm ${u.isBlocked ? "btn-success" : "btn-outline"}`}
                    onClick={() => handleToggle(u)}
                    disabled={busyBlock === u._id || busyDelete === u._id}
                    title={u.isBlocked ? "Unblock account" : "Block account"}
                  >
                    {busyBlock === u._id ? "..." : u.isBlocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(u)}
                    disabled={busyDelete === u._id || busyBlock === u._id}
                    title="Permanently delete this account"
                  >
                    {busyDelete === u._id ? "..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
