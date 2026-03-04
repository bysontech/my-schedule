import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import type { DueBucket } from "./dateBuckets";
import { getDueBucket } from "./dateBuckets";

export interface DueCounts {
  overdue: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

export interface StatusCounts {
  todo: number;
  in_progress: number;
  done: number;
}

export interface PriorityCounts {
  high: number;
  med: number;
  low: number;
}

export interface TaskAggregation {
  dueCounts: DueCounts;
  statusCounts: StatusCounts;
  priorityCounts: PriorityCounts;
}

export function aggregateCounts(tasks: Task[]): TaskAggregation {
  const dueCounts: DueCounts = { overdue: 0, today: 0, thisWeek: 0, thisMonth: 0 };
  const statusCounts: StatusCounts = { todo: 0, in_progress: 0, done: 0 };
  const priorityCounts: PriorityCounts = { high: 0, med: 0, low: 0 };

  for (const task of tasks) {
    statusCounts[task.status]++;
    priorityCounts[task.priority]++;

    const bucket = getDueBucket(task.dueDate);
    if (bucket) {
      dueCounts[bucket]++;
    }
  }

  return { dueCounts, statusCounts, priorityCounts };
}

/* ── Strategy summary (top tier) ── */

export interface StrategySummary {
  total: number;
  inProgress: number;
  done: number;
  completionRate: number; // 0-100
  thisWeekTotal: number;
  thisWeekDone: number;
  thisWeekRate: number; // 0-100
}

export function computeStrategySummary(tasks: Task[]): StrategySummary {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const thisWeekBuckets: Set<DueBucket | null> = new Set(["overdue", "today", "thisWeek"]);
  const thisWeekTasks = tasks.filter((t) => thisWeekBuckets.has(getDueBucket(t.dueDate)));
  const thisWeekTotal = thisWeekTasks.length;
  const thisWeekDone = thisWeekTasks.filter((t) => t.status === "done").length;
  const thisWeekRate = thisWeekTotal > 0 ? Math.round((thisWeekDone / thisWeekTotal) * 100) : 0;

  return { total, inProgress, done, completionRate, thisWeekTotal, thisWeekDone, thisWeekRate };
}

/* ── Danger zone (middle tier) ── */

export interface DangerCounts {
  overdue: number;
  today: number;
  thisWeekHigh: number;
}

export function computeDangerCounts(tasks: Task[]): DangerCounts {
  let overdue = 0;
  let today = 0;
  let thisWeekHigh = 0;

  for (const task of tasks) {
    if (task.status === "done") continue;
    const bucket = getDueBucket(task.dueDate);
    if (bucket === "overdue") overdue++;
    if (bucket === "today") today++;
    if (bucket === "thisWeek" && task.priority === "high") thisWeekHigh++;
  }

  return { overdue, today, thisWeekHigh };
}

/* ── Group progress (bottom tier) ── */

export interface GroupProgress {
  groupId: string | null;
  groupName: string;
  total: number;
  done: number;
  rate: number; // 0-100
}

export function computeGroupProgress(
  tasks: Task[],
  groups: { id: string; name: string }[],
): GroupProgress[] {
  const acc = new Map<string | null, { total: number; done: number }>();

  for (const task of tasks) {
    const key = task.groupId;
    const entry = acc.get(key) ?? { total: 0, done: 0 };
    entry.total++;
    if (task.status === "done") entry.done++;
    acc.set(key, entry);
  }

  const result: GroupProgress[] = [];

  for (const g of groups) {
    const entry = acc.get(g.id);
    if (entry) {
      result.push({
        groupId: g.id,
        groupName: g.name,
        total: entry.total,
        done: entry.done,
        rate: Math.round((entry.done / entry.total) * 100),
      });
    }
  }

  const unassigned = acc.get(null);
  if (unassigned) {
    result.push({
      groupId: null,
      groupName: "未分類",
      total: unassigned.total,
      done: unassigned.done,
      rate: Math.round((unassigned.done / unassigned.total) * 100),
    });
  }

  return result;
}

/* ── Project progress ── */

export interface ProjectProgress {
  projectId: string | null;
  projectName: string;
  total: number;
  done: number;
  rate: number; // 0-100
}

export function computeProjectProgress(
  tasks: Task[],
  projects: { id: string; name: string }[],
): ProjectProgress[] {
  const acc = new Map<string | null, { total: number; done: number }>();

  for (const task of tasks) {
    const key = task.projectId;
    const entry = acc.get(key) ?? { total: 0, done: 0 };
    entry.total++;
    if (task.status === "done") entry.done++;
    acc.set(key, entry);
  }

  const result: ProjectProgress[] = [];

  for (const p of projects) {
    const entry = acc.get(p.id);
    if (entry) {
      result.push({
        projectId: p.id,
        projectName: p.name,
        total: entry.total,
        done: entry.done,
        rate: Math.round((entry.done / entry.total) * 100),
      });
    }
  }

  const unassigned = acc.get(null);
  if (unassigned) {
    result.push({
      projectId: null,
      projectName: "未分類",
      total: unassigned.total,
      done: unassigned.done,
      rate: Math.round((unassigned.done / unassigned.total) * 100),
    });
  }

  return result;
}

/* ── Project progress grouped by group ── */

export interface GroupedProjectProgress {
  groupId: string | null;
  groupName: string;
  projects: ProjectProgress[];
}

export function computeProjectProgressByGroup(
  tasks: Task[],
  groups: { id: string; name: string }[],
  projects: { id: string; name: string; groupId: string | null }[],
): GroupedProjectProgress[] {
  // Build task counts by projectId
  const projCounts = new Map<string | null, { total: number; done: number }>();
  for (const task of tasks) {
    const key = task.projectId;
    const entry = projCounts.get(key) ?? { total: 0, done: 0 };
    entry.total++;
    if (task.status === "done") entry.done++;
    projCounts.set(key, entry);
  }

  // Build group → projects mapping
  const groupProjectMap = new Map<string | null, typeof projects>();
  for (const p of projects) {
    const gId = p.groupId;
    if (!groupProjectMap.has(gId)) groupProjectMap.set(gId, []);
    groupProjectMap.get(gId)!.push(p);
  }

  const result: GroupedProjectProgress[] = [];

  const buildProjectEntries = (groupProjects: typeof projects): ProjectProgress[] => {
    const entries: ProjectProgress[] = [];
    for (const p of groupProjects) {
      const counts = projCounts.get(p.id);
      if (counts) {
        entries.push({
          projectId: p.id,
          projectName: p.name,
          total: counts.total,
          done: counts.done,
          rate: Math.round((counts.done / counts.total) * 100),
        });
      }
    }
    return entries;
  };

  // Named groups
  for (const g of groups) {
    const gProjects = groupProjectMap.get(g.id) ?? [];
    const entries = buildProjectEntries(gProjects);
    // Also count tasks directly in group with no project
    const directTasks = tasks.filter((t) => t.groupId === g.id && t.projectId === null);
    if (directTasks.length > 0) {
      const done = directTasks.filter((t) => t.status === "done").length;
      entries.push({
        projectId: null,
        projectName: "未分類",
        total: directTasks.length,
        done,
        rate: Math.round((done / directTasks.length) * 100),
      });
    }
    if (entries.length > 0) {
      result.push({ groupId: g.id, groupName: g.name, projects: entries });
    }
  }

  // Unassigned group
  const nullProjects = groupProjectMap.get(null) ?? [];
  const nullEntries = buildProjectEntries(nullProjects);
  const nullDirectTasks = tasks.filter((t) => t.groupId === null && t.projectId === null);
  if (nullDirectTasks.length > 0) {
    const done = nullDirectTasks.filter((t) => t.status === "done").length;
    nullEntries.push({
      projectId: null,
      projectName: "未分類",
      total: nullDirectTasks.length,
      done,
      rate: Math.round((done / nullDirectTasks.length) * 100),
    });
  }
  if (nullEntries.length > 0) {
    result.push({ groupId: null, groupName: "未分類", projects: nullEntries });
  }

  return result;
}

/* ── Date-range filter helper ── */

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function filterByDateRange(tasks: Task[], range: "this_week" | "this_month"): Task[] {
  const now = new Date();
  let start: string;
  let end: string;

  if (range === "this_week") {
    const day = now.getDay();
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((day + 6) % 7));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    start = fmtDate(mon);
    end = fmtDate(sun);
  } else {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    start = fmtDate(first);
    end = fmtDate(last);
  }

  return tasks.filter((t) => t.dueDate != null && t.dueDate >= start && t.dueDate <= end);
}

/* ── Existing helpers ── */

export function filterByDueBucket(tasks: Task[], bucket: DueBucket): Task[] {
  return tasks.filter((t) => getDueBucket(t.dueDate) === bucket);
}

export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function filterByPriority(tasks: Task[], priority: TaskPriority): Task[] {
  return tasks.filter((t) => t.priority === priority);
}

export function getQuickList(
  tasks: Task[],
  bucket: DueBucket,
  limit: number,
): Task[] {
  return tasks
    .filter(
      (t) =>
        getDueBucket(t.dueDate) === bucket &&
        (t.status === "todo" || t.status === "in_progress"),
    )
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, limit);
}
