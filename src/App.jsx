import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Public pages
import HomePage     from "./pages/HomePage";
import AboutPage    from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage  from "./pages/ContactPage";
import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Protected dashboards
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard  from "./pages/DoctorDashboard";
import AdminDashboard   from "./pages/AdminDashboard";

import Spinner from "./components/Spinner";

function DashboardRouter() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (!user)   return <Navigate to="/login" replace />;
  if (user.role === "PATIENT") return <PatientDashboard />;
  if (user.role === "DOCTOR")  return <DoctorDashboard  />;
  if (user.role === "ADMIN")   return <AdminDashboard   />;
  return <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"          element={<HomePage     />} />
        <Route path="/about"     element={<AboutPage    />} />
        <Route path="/services"  element={<ServicesPage />} />
        <Route path="/contact"   element={<ContactPage  />} />

        {/* Auth */}
        <Route path="/login"    element={<GuestOnly><LoginPage    /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

        {/* Protected dashboard */}
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
