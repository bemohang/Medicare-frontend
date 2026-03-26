import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = { PATIENT: "Patient", DOCTOR: "Doctor", ADMIN: "Administrator" };

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const roleClass = `role-${user?.role?.toLowerCase()}`;

  return (
    <header className="topbar">
      <div className="topbar-left">
    
        <h2 className="topbar-title">{title}</h2>
      </div>
      <div className="topbar-right">
        <span className="topbar-greeting">
          {greeting}, <strong>{user?.firstName}</strong>
        </span>
        <span className={`role-badge ${roleClass}`}>
          {ROLE_LABELS[user?.role]}
        </span>
      </div>
    </header>
  );
}
