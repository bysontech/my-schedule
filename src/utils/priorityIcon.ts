import type { TaskPriority } from "../domain/task";

const PRIORITY_ICONS: Record<TaskPriority, string> = {
  high: "\u2191",
  med: "\u2192",
  low: "\u2193",
};

export function priorityIcon(p: TaskPriority): string {
  return PRIORITY_ICONS[p];
}
