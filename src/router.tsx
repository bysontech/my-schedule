import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";
import { TasksPage } from "./pages/TasksPage";
import { TaskFormPage } from "./pages/TaskFormPage";
import { MastersPage } from "./pages/MastersPage";
import { RecurrenceTemplatesPage } from "./pages/RecurrenceTemplatesPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/tasks" replace /> },
      { path: "/tasks", element: <TasksPage /> },
      { path: "/tasks/new", element: <TaskFormPage /> },
      { path: "/tasks/:id/edit", element: <TaskFormPage /> },
      { path: "/masters", element: <MastersPage /> },
      { path: "/recurrence", element: <RecurrenceTemplatesPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);
