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

export function filterByDueBucket(tasks: Task[], bucket: DueBucket): Task[] {
  return tasks.filter((t) => getDueBucket(t.dueDate) === bucket);
}

export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function filterByPriority(tasks: Task[], priority: TaskPriority): Task[] {
  return tasks.filter((t) => t.priority === priority);
}

/** overdue or today tasks that are not done, sorted by dueDate asc, limited */
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
