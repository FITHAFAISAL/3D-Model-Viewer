import { useState } from "react";
import axios from "axios";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "https://3d-model-viewer-production-b436.up.railway.app";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/login`, { username, password });
      if (res.data && res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        window.dispatchEvent(new Event("authStateChanged"));
        onLogin(res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-container" style={{ maxWidth: "400px", marginTop: "4rem" }}>
      <h1 className="page-title" style={{ textAlign: "center" }}>Admin Login</h1>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {error && (
          <div className="toast toast-error" style={{ position: "relative", transform: "none", margin: 0, opacity: 1, visibility: "visible" }}>
            <span className="toast-icon">✕</span>
            {error}
          </div>
        )}
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Username</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-green" disabled={loading} style={{ marginTop: "1rem", width: "100%" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
