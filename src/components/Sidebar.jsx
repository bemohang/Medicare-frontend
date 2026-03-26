import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV = {
  PATIENT: [
    { key: "overview",     label: "Overview"          },
    { key: "book",         label: "Book Appointment"  },
    { key: "appointments", label: "My Appointments"   },
  ],
  DOCTOR: [
    { key: "overview",     label: "Overview"          },
    { key: "appointments", label: "My Appointments"   },
  ],
  ADMIN: [
    { key: "overview",     label: "Overview"          },
    { key: "appointments", label: "All Appointments"  },
    { key: "patients",     label: "Patients"          },
    { key: "doctors",      label: "Doctors"           },
    { key: "add-doctor",   label: "Add Doctor"        },
  ],
};

export default function Sidebar({ activeTab, onTabChange, mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

  const links = NAV[user?.role] ?? [];

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <img src="/images/logo.jpg" alt="MediCare" />
          <span>MediCare</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {links.map((item) => (
            <button
              key={item.key}
              className={`sidebar-link ${activeTab === item.key ? "active" : ""}`}
              onClick={() => { onTabChange(item.key); onClose(); }}
            >
              <span className="sidebar-link-icon">—</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
