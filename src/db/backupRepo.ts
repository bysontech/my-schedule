import { db } from "./indexedDb";
import type { Task } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import type { RecurrenceTemplate } from "../domain/recurrence";

export interface BackupJson {
  schemaVersion: number;
  exportedAt: string;
  data: {
    tasks: Task[];
    groups: Group[];
    projects: Project[];
    buckets: Bucket[];
    recurrenceTemplates?: RecurrenceTemplate[];
  };
}

export async function exportAll(): Promise<BackupJson> {
  const [tasks, groups, projects, buckets, recurrenceTemplates] = await Promise.all([
    db.tasks.toArray(),
    db.groups.toArray(),
    db.projects.toArray(),
    db.buckets.toArray(),
    db.recurrenceTemplates.toArray(),
  ]);
  return {
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    data: { tasks, groups, projects, buckets, recurrenceTemplates },
  };
}

export function validateBackup(json: unknown): json is BackupJson {
  if (typeof json !== "object" || json === null) return false;
  const obj = json as Record<string, unknown>;
  if (typeof obj.schemaVersion !== "number") return false;
  if (typeof obj.exportedAt !== "string") return false;
  if (typeof obj.data !== "object" || obj.data === null) return false;

  const data = obj.data as Record<string, unknown>;
  if (!Array.isArray(data.tasks)) return false;
  if (!Array.isArray(data.groups)) return false;
  if (!Array.isArray(data.projects)) return false;
  if (!Array.isArray(data.buckets)) return false;
  // recurrenceTemplates は v2 バックアップには無いので optional
  if (data.recurrenceTemplates !== undefined && !Array.isArray(data.recurrenceTemplates)) return false;

  for (const t of data.tasks) {
    if (typeof t !== "object" || t === null) return false;
    const task = t as Record<string, unknown>;
    if (typeof task.id !== "string" || typeof task.title !== "string") return false;
  }
  for (const arr of [data.groups, data.projects, data.buckets]) {
    for (const item of arr as unknown[]) {
      if (typeof item !== "object" || item === null) return false;
      const rec = item as Record<string, unknown>;
      if (typeof rec.id !== "string" || typeof rec.name !== "string") return false;
    }
  }
  if (Array.isArray(data.recurrenceTemplates)) {
    for (const item of data.recurrenceTemplates) {
      if (typeof item !== "object" || item === null) return false;
      const rec = item as Record<string, unknown>;
      if (typeof rec.id !== "string" || typeof rec.title !== "string") return false;
    }
  }
  return true;
}

export async function importAll(backup: BackupJson): Promise<void> {
  await db.transaction(
    "rw",
    [db.tasks, db.groups, db.projects, db.buckets, db.recurrenceTemplates],
    async () => {
      await db.tasks.clear();
      await db.groups.clear();
      await db.projects.clear();
      await db.buckets.clear();
      await db.recurrenceTemplates.clear();

      await db.tasks.bulkPut(backup.data.tasks);
      await db.groups.bulkPut(backup.data.groups);
      await db.projects.bulkPut(backup.data.projects);
      await db.buckets.bulkPut(backup.data.buckets);
      if (backup.data.recurrenceTemplates?.length) {
        await db.recurrenceTemplates.bulkPut(backup.data.recurrenceTemplates);
      }
    },
  );
}
