import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const themes = ["dark", "light", "grey"];
const themeIcons = { dark: "🌙", light: "☀️", grey: "🌫️" };

const HOME_ROUTES = new Set(["/", "/dashboard", "/admin"]);

export default function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;
  const isHome = HOME_ROUTES.has(location.pathname);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1000);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const cycleTheme = () => {
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home", show: true },
    { to: "/dashboard", label: "Dashboard", show: true },
    { to: "/admin", label: "Admin", show: role === "admin" },
    { to: "/transactions", label: "Transactions", show: true },
    { to: "/profile", label: "Profile", show: true },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          {isMobile ? (
            <button
              className="nav-icon-btn hamburger-btn"
              onClick={() => setDrawerOpen((p) => !p)}
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          ) : isHome ? (
            <button
              className="nav-icon-btn hamburger-btn"
              onClick={() => setDrawerOpen((p) => !p)}
              aria-label="Open menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          ) : (
            <button
              className="nav-icon-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}

          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🛡️</span>
            <span className="brand-text">FraudGuard AI</span>
          </Link>
        </div>

        <div className="navbar-links">
          {navLinks.filter((l) => l.show).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={location.pathname === l.to ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="theme-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
            {themeIcons[theme]}
          </button>
          {role ? (
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />

      
      <aside className={`drawer ${drawerOpen ? "open" : ""}`} ref={drawerRef}>
        <div className="drawer-header">
          <span className="brand-icon">🛡️</span>
          <span className="brand-text">FraudGuard AI</span>
          <button className="nav-icon-btn drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="drawer-nav">
          {navLinks.filter((l) => l.show).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`drawer-link ${location.pathname === l.to ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="drawer-footer">
          <div className="drawer-theme">
            <span className="drawer-label">Theme</span>
            <div className="theme-switcher">
              {themes.map((t) => (
                <button
                  key={t}
                  className={`theme-option ${theme === t ? "active" : ""}`}
                  onClick={() => { setTheme(t); localStorage.setItem("theme", t); }}
                >
                  {themeIcons[t]} {t}
                </button>
              ))}
            </div>
          </div>
          {role ? (
            <button className="btn btn-outline btn-full" onClick={logout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-full" onClick={() => setDrawerOpen(false)}>
              Login
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
