import type { Task } from "../domain/task";

/** YYYY-MM-DD format */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatDate(new Date());
}

export interface CalendarCell {
  date: string;        // YYYY-MM-DD
  day: number;         // 1-31
  inMonth: boolean;    // true if belongs to the target month
  isToday: boolean;
}

/**
 * Build a 6×7 grid for month view (Monday start).
 * Returns exactly 42 cells.
 */
export function getMonthGrid(year: number, month: number): CalendarCell[] {
  const today = todayStr();
  const firstDay = new Date(year, month - 1, 1);
  // JS getDay(): 0=Sun..6=Sat → shift to Mon=0..Sun=6
  const startDow = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDow);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const ds = formatDate(d);
    cells.push({
      date: ds,
      day: d.getDate(),
      inMonth: d.getMonth() + 1 === month && d.getFullYear() === year,
      isToday: ds === today,
    });
  }
  return cells;
}

/**
 * Get 7 days for the week containing `refDate`, starting Monday.
 */
export function getWeekDays(refDate: Date): CalendarCell[] {
  const today = todayStr();
  const dow = (refDate.getDay() + 6) % 7; // Mon=0
  const monday = new Date(refDate);
  monday.setDate(monday.getDate() - dow);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const ds = formatDate(d);
    cells.push({
      date: ds,
      day: d.getDate(),
      inMonth: true,
      isToday: ds === today,
    });
  }
  return cells;
}

/**
 * Group tasks by dueDate into a Map<dateStr, Task[]>.
 * Only includes non-deleted tasks with a dueDate.
 */
export function tasksByDueDateMap(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    if (t.isDeleted || !t.dueDate) continue;
    const arr = map.get(t.dueDate);
    if (arr) {
      arr.push(t);
    } else {
      map.set(t.dueDate, [t]);
    }
  }
  return map;
}

const WEEKDAY_SHORT = ["月", "火", "水", "木", "金", "土", "日"];

export function weekdayLabel(index: number): string {
  return WEEKDAY_SHORT[index] ?? "";
}
