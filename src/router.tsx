import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";
import { DashboardPage } from "./pages/DashboardPage";
import { FocusPage } from "./pages/FocusPage";
import { TasksPage } from "./pages/TasksPage";
import { TaskFormPage } from "./pages/TaskFormPage";
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
      { path: "/tasks/new", element: <TaskFormPage /> },
      { path: "/tasks/:id/edit", element: <TaskFormPage /> },
      { path: "/masters", element: <MastersPage /> },
      { path: "/recurrence", element: <RecurrenceTemplatesPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
