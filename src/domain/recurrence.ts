import type { TaskPriority } from "./task";

export type RecurrenceType = "weekly" | "monthly_date" | "monthly_nth";

export interface RecurrenceTemplate {
  id: string;
  title: string;
  memo: string | null;
  priority: TaskPriority;
  groupId: string | null;
  projectId: string | null;
  bucketIds: string[];
  recurrenceType: RecurrenceType;
  recurrenceValue: number; // weekly: weekday 0-6, monthly_date: 1-31, monthly_nth: weekday 0-6
  recurrenceNthWeek: number | null; // 1-5 (monthly_nth only)
  isActive: boolean;
  lastGeneratedDate: string | null; // YYYY-MM-DD
  createdAt: string; // ISO8601
}

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function describeRecurrence(t: RecurrenceTemplate): string {
  switch (t.recurrenceType) {
    case "weekly":
      return `毎週${WEEKDAY_LABELS[t.recurrenceValue]}曜日`;
    case "monthly_date":
      return `毎月${t.recurrenceValue}日`;
    case "monthly_nth":
      return `毎月第${t.recurrenceNthWeek}${WEEKDAY_LABELS[t.recurrenceValue]}曜日`;
  }
}
