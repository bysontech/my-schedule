import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";

const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const PlanningPage = lazy(() => import("./pages/PlanningPage").then((m) => ({ default: m.PlanningPage })));
const WorkspacePage = lazy(() => import("./pages/WorkspacePage").then((m) => ({ default: m.WorkspacePage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));

function PageFallback() {
  // Cannot use useI18n here (outside router context), use localStorage directly
  const locale = localStorage.getItem("my-schedule-locale") ?? "ja";
  const text = locale === "en" ? "Loading…" : "読み込み中…";
  return (
    <div style={{ padding: "1rem", textAlign: "center", color: "var(--color-text-secondary, #64748b)" }}>
      {text}
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      {
        path: "/dashboard",
        element: (
          <Suspense fallback={<PageFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "/planning",
        element: (
          <Suspense fallback={<PageFallback />}>
            <PlanningPage />
          </Suspense>
        ),
      },
      {
        path: "/workspace",
        element: (
          <Suspense fallback={<PageFallback />}>
            <WorkspacePage />
          </Suspense>
        ),
      },
      {
        path: "/settings",
        element: (
          <Suspense fallback={<PageFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      // Redirects for removed pages
      { path: "/focus", element: <Navigate to="/dashboard" replace /> },
      { path: "/tasks", element: <Navigate to="/dashboard" replace /> },
      { path: "/tasks/new", element: <Navigate to="/dashboard" replace /> },
      { path: "/tasks/:id/edit", element: <Navigate to="/dashboard" replace /> },
      { path: "/masters", element: <Navigate to="/dashboard" replace /> },
      { path: "/recurrence", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
