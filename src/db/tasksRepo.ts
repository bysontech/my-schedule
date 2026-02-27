import { db } from "./indexedDb";
import type { Task } from "../domain/task";

export async function listTasks(): Promise<Task[]> {
  return db.tasks.filter((task) => !task.isDeleted).toArray();
}

export async function getTask(id: string): Promise<Task | undefined> {
  return db.tasks.get(id);
}

export async function upsertTask(task: Task): Promise<void> {
  await db.tasks.put({ ...task, updatedAt: new Date().toISOString() });
}

export async function toggleDone(id: string): Promise<void> {
  const task = await db.tasks.get(id);
  if (!task) return;
  const newStatus = task.status === "done" ? "todo" : "done";
  await db.tasks.update(id, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
}

export async function toggleStatus(id: string): Promise<void> {
  const task = await db.tasks.get(id);
  if (!task) return;
  const newStatus = task.status === "todo" ? "in_progress" : "todo";
  await db.tasks.update(id, {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  });
}

export async function softDeleteTask(id: string): Promise<void> {
  await db.tasks.update(id, {
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  });
}
