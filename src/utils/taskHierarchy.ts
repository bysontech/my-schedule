import type { Task } from "../domain/task";
import type { Group, Project } from "../domain/master";

export interface ProjectSection {
  projectId: string | null;
  projectName: string;
  tasks: Task[];
}

export interface GroupSection {
  groupId: string | null;
  groupName: string;
  projects: ProjectSection[];
}

/**
 * Group tasks by group → project hierarchy.
 * groupId=null → "未分類" group section
 * projectId=null → "未分類" project section within each group
 */
export function groupByGroupProject(
  tasks: Task[],
  groups: Group[],
  projects: Project[],
): GroupSection[] {
  // Build group map: groupId → { projectId → Task[] }
  const groupMap = new Map<string | null, Map<string | null, Task[]>>();

  for (const task of tasks) {
    const gKey = task.groupId;
    if (!groupMap.has(gKey)) groupMap.set(gKey, new Map());
    const projMap = groupMap.get(gKey)!;
    const pKey = task.projectId;
    if (!projMap.has(pKey)) projMap.set(pKey, []);
    projMap.get(pKey)!.push(task);
  }

  const groupNameMap = new Map<string, string>();
  for (const g of groups) groupNameMap.set(g.id, g.name);

  const projectNameMap = new Map<string, string>();
  for (const p of projects) projectNameMap.set(p.id, p.name);

  const result: GroupSection[] = [];

  // Named groups first (in order)
  for (const g of groups) {
    const projMap = groupMap.get(g.id);
    if (!projMap) continue;
    result.push(buildGroupSection(g.id, g.name, projMap, projects, projectNameMap));
    groupMap.delete(g.id);
  }

  // Unassigned group (groupId=null)
  const nullProjMap = groupMap.get(null);
  if (nullProjMap) {
    result.push(buildGroupSection(null, "未分類", nullProjMap, projects, projectNameMap));
    groupMap.delete(null);
  }

  // Any remaining (shouldn't happen but be safe)
  for (const [gId, projMap] of groupMap) {
    const name = gId ? (groupNameMap.get(gId) ?? "不明") : "未分類";
    result.push(buildGroupSection(gId, name, projMap, projects, projectNameMap));
  }

  return result;
}

function buildGroupSection(
  groupId: string | null,
  groupName: string,
  projMap: Map<string | null, Task[]>,
  allProjects: Project[],
  projectNameMap: Map<string, string>,
): GroupSection {
  const projectSections: ProjectSection[] = [];

  // Named projects belonging to this group first
  for (const p of allProjects) {
    if (p.groupId !== groupId) continue;
    const tasks = projMap.get(p.id);
    if (!tasks) continue;
    projectSections.push({ projectId: p.id, projectName: p.name, tasks });
    projMap.delete(p.id);
  }

  // Unassigned project (projectId=null)
  const nullTasks = projMap.get(null);
  if (nullTasks) {
    projectSections.push({ projectId: null, projectName: "未分類", tasks: nullTasks });
    projMap.delete(null);
  }

  // Any remaining projects (cross-group assignments)
  for (const [pId, tasks] of projMap) {
    const name = pId ? (projectNameMap.get(pId) ?? "不明") : "未分類";
    projectSections.push({ projectId: pId, projectName: name, tasks });
  }

  return { groupId, groupName, projects: projectSections };
}
