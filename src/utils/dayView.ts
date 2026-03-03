import type { Task } from "../domain/task";

/** Convert "HH:mm" to minutes since midnight */
export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Format minutes to "H:mm" */
export function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export interface SplitDayTasks {
  /** Tasks with dueDate but no startAt/endAt (unscheduled) */
  unscheduled: Task[];
  /** Tasks with startAt (and optionally endAt) — timed blocks */
  timed: Task[];
}

/** Get tasks whose dueDate matches the given date string (YYYY-MM-DD) */
export function getDayTasks(tasks: Task[], date: string): Task[] {
  return tasks.filter((t) => t.dueDate === date);
}

/** Split day tasks into unscheduled and timed */
export function splitDayTasks(dayTasks: Task[]): SplitDayTasks {
  const unscheduled: Task[] = [];
  const timed: Task[] = [];

  for (const t of dayTasks) {
    if (t.startAt) {
      timed.push(t);
    } else {
      unscheduled.push(t);
    }
  }

  // Sort timed by startAt
  timed.sort((a, b) => toMinutes(a.startAt!) - toMinutes(b.startAt!));

  return { unscheduled, timed };
}

/** Compute block top/height for a timed task (pixels).
 *  Timeline covers HOUR_START..HOUR_END with HOUR_HEIGHT per hour. */
export function computeBlock(
  task: Task,
  hourStart: number,
  hourHeight: number,
): { top: number; height: number } {
  const startMin = toMinutes(task.startAt!);
  const endMin = task.endAt ? toMinutes(task.endAt) : startMin + 30; // default 30min
  const topMin = startMin - hourStart * 60;
  const durationMin = Math.max(endMin - startMin, 15); // at least 15min visible
  return {
    top: (topMin / 60) * hourHeight,
    height: (durationMin / 60) * hourHeight,
  };
}
