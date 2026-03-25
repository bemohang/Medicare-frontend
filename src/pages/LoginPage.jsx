import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-panel">
        <img src="/images/logo.jpg" alt="MediCare" className="auth-panel-logo" />
        <h1>MediCare</h1>
        <p>
          Sign in to access your patient dashboard, view appointments,
          or manage the hospital system.
        </p>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div style={{ marginBottom: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: "var(--muted)" }}>
            &larr; Back to website
          </Link>
        </div>
        <div className="auth-form-header">
          <h2>Welcome back</h2>
          <p>Sign in to your MediCare account to continue.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
              required autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" name="password"
              placeholder="Enter your password"
              value={form.password} onChange={handleChange}
              required autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-link">
          New patient? <Link to="/register">Create an account</Link>
        </div>

      
      </div>
    </div>
  );
}
