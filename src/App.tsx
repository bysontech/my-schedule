import { Outlet, Link, useLocation } from "react-router-dom";

export default function App() {
  const { pathname } = useLocation();

  const navLinks: { to: string; label: string }[] = [
    { to: "/dashboard", label: "Home" },
    { to: "/focus", label: "Focus" },
    { to: "/tasks", label: "Tasks" },
    { to: "/planning", label: "Planning" },
    { to: "/workspace", label: "Workspace" },
    { to: "/recurrence", label: "Repeat" },
    { to: "/masters", label: "Masters" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">My Schedule</h1>
          <nav className="app-nav">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${pathname === to ? "nav-link--active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
