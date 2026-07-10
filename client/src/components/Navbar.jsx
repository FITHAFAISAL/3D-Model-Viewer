import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

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

      <div className="nav-links">
        <Link to="/" className={isActive("/") ? "active" : ""}>
          Home
        </Link>
        <Link to="/admin" className={isActive("/admin") ? "active" : ""}>
          Admin
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;