import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";
import { DashboardPage } from "./pages/DashboardPage";
import { FocusPage } from "./pages/FocusPage";
import { TasksPage } from "./pages/TasksPage";
import { PlanningPage } from "./pages/PlanningPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { MastersPage } from "./pages/MastersPage";
import { RecurrenceTemplatesPage } from "./pages/RecurrenceTemplatesPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/focus", element: <FocusPage /> },
      { path: "/tasks", element: <TasksPage /> },
      { path: "/planning", element: <PlanningPage /> },
      { path: "/workspace", element: <WorkspacePage /> },
      { path: "/masters", element: <MastersPage /> },
      { path: "/recurrence", element: <RecurrenceTemplatesPage /> },
      { path: "/settings", element: <SettingsPage /> },
      // Redirects for removed pages
      { path: "/tasks/new", element: <Navigate to="/dashboard" replace /> },
      { path: "/tasks/:id/edit", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
