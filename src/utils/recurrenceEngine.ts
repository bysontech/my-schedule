import type { RecurrenceTemplate } from "../domain/recurrence";
import type { Task } from "../domain/task";
import { db } from "../db/indexedDb";
import { listActiveTemplates, updateLastGeneratedDate } from "../db/recurrenceRepo";

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 次の指定曜日の日付を返す（今日含む）
 */
function nextWeekday(today: Date, weekday: number): string {
  const diff = (weekday - today.getDay() + 7) % 7;
  const next = new Date(today);
  next.setDate(today.getDate() + (diff === 0 ? 0 : diff));
  return toDateStr(next);
}

/**
 * 今月または来月の指定日を返す（存在しない日はスキップ＝さらに翌月）
 */
function nextMonthlyDate(today: Date, dayOfMonth: number): string | null {
  for (let offset = 0; offset < 3; offset++) {
    const y = today.getFullYear();
    const m = today.getMonth() + offset;
    const candidate = new Date(y, m, dayOfMonth);
    // 日が変わっていたら月末を超えた＝その月に指定日は存在しない
    if (candidate.getDate() !== dayOfMonth) continue;
    if (candidate >= today) return toDateStr(candidate);
  }
  return null;
}

/**
 * 今月または来月の「第N weekday」を返す（存在しない場合スキップ）
 */
function nextNthWeekday(today: Date, nth: number, weekday: number): string | null {
  for (let offset = 0; offset < 3; offset++) {
    const y = today.getFullYear();
    const m = today.getMonth() + offset;
    // その月の第1日の曜日から第N weekdayを算出
    const firstDay = new Date(y, m, 1);
    const firstWeekday = firstDay.getDay();
    const day = 1 + ((weekday - firstWeekday + 7) % 7) + (nth - 1) * 7;
    const candidate = new Date(y, m, day);
    // 月が変わっていたら第Nは存在しない
    if (candidate.getMonth() !== (m % 12 + 12) % 12) continue;
    if (candidate >= today) return toDateStr(candidate);
  }
  return null;
}

export function computeNextDueDate(
  template: RecurrenceTemplate,
  today: Date
): string | null {
  switch (template.recurrenceType) {
    case "weekly":
      return nextWeekday(today, template.recurrenceValue);
    case "monthly_date":
      return nextMonthlyDate(today, template.recurrenceValue);
    case "monthly_nth":
      return template.recurrenceNthWeek != null
        ? nextNthWeekday(today, template.recurrenceNthWeek, template.recurrenceValue)
        : null;
  }
}

/**
 * 全アクティブテンプレについて、未生成の次回タスクがあれば1件生成する。
 * 二重生成防止: 同一 templateId + dueDate のタスクが既に存在すればスキップ。
 */
export async function ensureNextInstanceForAllActiveTemplates(): Promise<void> {
  const templates = await listActiveTemplates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const tmpl of templates) {
    const dueDate = computeNextDueDate(tmpl, today);
    if (!dueDate) continue;

    // 同一テンプレ + 同一 dueDate のタスクが既にあるかチェック
    const existing = await db.tasks
      .where("recurrenceTemplateId")
      .equals(tmpl.id)
      .filter((t) => t.dueDate === dueDate && !t.isDeleted)
      .first();

    if (existing) continue;

    // lastGeneratedDate が同じならスキップ（安全弁）
    if (tmpl.lastGeneratedDate === dueDate) continue;

    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: tmpl.title,
      memo: tmpl.memo,
      dueDate,
      priority: tmpl.priority,
      status: "todo",
      groupId: tmpl.groupId,
      projectId: tmpl.projectId,
      bucketIds: [...tmpl.bucketIds],
      recurrenceTemplateId: tmpl.id,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.tasks.put(task);
    await updateLastGeneratedDate(tmpl.id, dueDate);
  }
}
