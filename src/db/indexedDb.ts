import Dexie, { type EntityTable } from "dexie";
import type { Task } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import type { RecurrenceTemplate } from "../domain/recurrence";

const db = new Dexie("my-schedule-db") as Dexie & {
  tasks: EntityTable<Task, "id">;
  groups: EntityTable<Group, "id">;
  projects: EntityTable<Project, "id">;
  buckets: EntityTable<Bucket, "id">;
  recurrenceTemplates: EntityTable<RecurrenceTemplate, "id">;
};

db.version(1).stores({
  tasks: "id, dueDate, status, priority, isDeleted, updatedAt",
});

db.version(2).stores({
  tasks: "id, dueDate, status, priority, isDeleted, updatedAt",
  groups: "id, name",
  projects: "id, name, groupId",
  buckets: "id, name",
});

db.version(3).stores({
  tasks: "id, dueDate, status, priority, isDeleted, updatedAt, recurrenceTemplateId",
  groups: "id, name",
  projects: "id, name, groupId",
  buckets: "id, name",
  recurrenceTemplates: "id, isActive, recurrenceType",
});

export { db };
