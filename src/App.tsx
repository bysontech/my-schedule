import { Outlet, Link, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">My Schedule</h1>
          <nav className="app-nav">
            <Link
              to="/dashboard"
              className={`nav-link ${pathname === "/dashboard" ? "nav-link--active" : ""}`}
            >
              Home
            </Link>
            <Link
              to="/focus"
              className={`nav-link ${pathname === "/focus" ? "nav-link--active" : ""}`}
            >
              Focus
            </Link>
            <Link
              to="/tasks"
              className={`nav-link ${pathname === "/tasks" ? "nav-link--active" : ""}`}
            >
              Planning
            </Link>
            <Link
              to="/masters"
              className={`nav-link ${pathname === "/masters" ? "nav-link--active" : ""}`}
            >
              Masters
            </Link>
            <Link
              to="/recurrence"
              className={`nav-link ${pathname === "/recurrence" ? "nav-link--active" : ""}`}
            >
              Repeat
            </Link>
            <Link
              to="/settings"
              className={`nav-link ${pathname === "/settings" ? "nav-link--active" : ""}`}
            >
              Settings
            </Link>
            <Link
              to="/tasks/new"
              className={`nav-link ${pathname === "/tasks/new" ? "nav-link--active" : ""}`}
            >
              + New
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
