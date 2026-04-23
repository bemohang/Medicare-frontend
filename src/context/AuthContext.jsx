import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

axios.defaults.baseURL = "http://localhost:5000";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("mc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("mc_token");
    const u = localStorage.getItem("mc_user");

    if (!t || !u) {
      // No session stored — clear everything and show login
      localStorage.removeItem("mc_token");
      localStorage.removeItem("mc_user");
      setLoading(false);
      return;
    }

    // Verify the token is still valid with the server
    axios.get("/api/users/me")
      .then(({ data }) => {
        // Token valid — restore session with fresh data from server
        const stored = JSON.parse(u);
        const merged = { ...stored, ...data };
        localStorage.setItem("mc_user", JSON.stringify(merged));
        setUser(merged);
      })
      .catch(() => {
        // Token expired or invalid — force full logout
        localStorage.removeItem("mc_token");
        localStorage.removeItem("mc_user");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("mc_token", token);
    localStorage.setItem("mc_user",  JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("mc_token");
    localStorage.removeItem("mc_user");
    // Clear any other cached keys that might persist session
    sessionStorage.clear();
    setUser(null);
  };

  // Call this after a successful profile update to keep UI in sync
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem("mc_user", JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
