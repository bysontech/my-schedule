export type DueBucket = "overdue" | "today" | "thisWeek" | "thisMonth";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getDueBucket(dueDate: string | null): DueBucket | null {
  if (!dueDate) return null;

  const now = new Date();
  const today = startOfDay(now);
  const due = startOfDay(new Date(dueDate + "T00:00:00"));

  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "today";

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  if (due <= endOfWeek) return "thisWeek";

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  if (due <= endOfMonth) return "thisMonth";

  return null;
}

export const DUE_BUCKET_LABELS: Record<DueBucket, string> = {
  overdue: "期限切れ",
  today: "今日",
  thisWeek: "今週",
  thisMonth: "今月",
};
