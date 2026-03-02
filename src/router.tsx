import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";
import { DashboardPage } from "./pages/DashboardPage";
import { PlanningPage } from "./pages/PlanningPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/planning", element: <PlanningPage /> },
      { path: "/workspace", element: <WorkspacePage /> },
      { path: "/settings", element: <SettingsPage /> },
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
