import { db } from "./indexedDb";
import type { Group } from "../domain/master";

export async function listGroups(): Promise<Group[]> {
  return db.groups.orderBy("name").toArray();
}

export async function upsertGroup(group: Group): Promise<void> {
  await db.groups.put(group);
}

export async function deleteGroup(id: string): Promise<void> {
  await db.groups.delete(id);
}
