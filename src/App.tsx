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
              to="/tasks"
              className={`nav-link ${pathname === "/tasks" ? "nav-link--active" : ""}`}
            >
              Tasks
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
