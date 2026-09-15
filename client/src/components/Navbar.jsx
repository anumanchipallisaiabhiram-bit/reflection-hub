import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <span className="nav-logo-icon">📖</span>
          <span className="nav-logo-text">Reflection Hub</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? "nav-links-open" : ""}`}>
          {isAuthenticated ? (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/create"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}
              >
                + New Journal
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  isActive ? "nav-link active nav-link-ai" : "nav-link nav-link-ai"
                }
                onClick={closeMenu}
              >
                ✨ AI Chat
              </NavLink>

              <div className="nav-user-section">
                {user?.name && (
                  <span className="nav-user-greeting">
                    <span className="user-avatar-initial">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="user-name">{user.name}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary nav-logout-btn"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                onClick={closeMenu}
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  isActive ? "nav-link active nav-btn" : "nav-link nav-btn"
                }
                onClick={closeMenu}
              >
                Get Started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
