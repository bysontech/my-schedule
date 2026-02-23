import Dexie, { type EntityTable } from "dexie";
import type { Task } from "../domain/task";

const db = new Dexie("my-schedule-db") as Dexie & {
  tasks: EntityTable<Task, "id">;
};

db.version(1).stores({
  tasks: "id, dueDate, status, priority, isDeleted, updatedAt",
});

export { db };
