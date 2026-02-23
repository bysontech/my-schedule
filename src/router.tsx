import {
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import App from "./App";
import { TasksPage } from "./pages/TasksPage";
import { TaskFormPage } from "./pages/TaskFormPage";

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Navigate to="/tasks" replace /> },
      { path: "/tasks", element: <TasksPage /> },
      { path: "/tasks/new", element: <TaskFormPage /> },
      { path: "/tasks/:id/edit", element: <TaskFormPage /> },
    ],
  },
]);
