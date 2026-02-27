import { db } from "./indexedDb";
import type { RecurrenceTemplate } from "../domain/recurrence";

export async function listAllTemplates(): Promise<RecurrenceTemplate[]> {
  return db.recurrenceTemplates.toArray();
}

export async function listActiveTemplates(): Promise<RecurrenceTemplate[]> {
  return db.recurrenceTemplates.where("isActive").equals(1).toArray();
}

export async function getTemplate(id: string): Promise<RecurrenceTemplate | undefined> {
  return db.recurrenceTemplates.get(id);
}

export async function upsertTemplate(template: RecurrenceTemplate): Promise<void> {
  await db.recurrenceTemplates.put(template);
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.recurrenceTemplates.delete(id);
}

export async function updateLastGeneratedDate(id: string, date: string): Promise<void> {
  await db.recurrenceTemplates.update(id, { lastGeneratedDate: date });
}
