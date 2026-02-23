import { Outlet, Link, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();

  return (
    <div style={{ padding: "1rem 2rem", fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid #ccc", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>My Schedule</h1>
        <nav style={{ marginTop: "0.5rem", display: "flex", gap: "1rem" }}>
          <Link
            to="/tasks"
            style={{ fontWeight: location.pathname === "/tasks" ? "bold" : "normal" }}
          >
            タスク一覧
          </Link>
          <Link
            to="/tasks/new"
            style={{ fontWeight: location.pathname === "/tasks/new" ? "bold" : "normal" }}
          >
            新規作成
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
