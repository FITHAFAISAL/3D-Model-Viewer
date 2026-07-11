import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("adminToken"));

  useEffect(() => {
    const handleAuthChange = () => setIsLoggedIn(!!localStorage.getItem("adminToken"));
    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.dispatchEvent(new Event("authStateChanged"));
    if (location.pathname.startsWith("/admin")) {
      window.location.reload();
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">◆</span>
        3D Model Viewer
      </Link>

      <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/" className={isActive("/") ? "active" : ""}>
          Home
        </Link>
        <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
          Admin
        </Link>
        {isLoggedIn && (
          <button 
            onClick={handleLogout} 
            className="btn btn-cancel-modal" 
            style={{ padding: "0.2rem 0.6rem", fontSize: "0.85rem", marginLeft: "0.5rem" }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;