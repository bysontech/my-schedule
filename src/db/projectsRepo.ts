import { db } from "./indexedDb";
import type { Project } from "../domain/master";

export async function listProjects(): Promise<Project[]> {
  return db.projects.orderBy("name").toArray();
}

export async function upsertProject(project: Project): Promise<void> {
  await db.projects.put(project);
}

export async function deleteProject(id: string): Promise<void> {
  await db.projects.delete(id);
}
