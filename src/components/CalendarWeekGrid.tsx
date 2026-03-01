import { useMemo } from "react";
import type { Task } from "../domain/task";
import { getWeekDays, tasksByDueDateMap, weekdayLabel } from "../utils/calendar";
import { priorityIcon } from "../utils/priorityIcon";
import { getDueBucket } from "../utils/dateBuckets";

interface CalendarWeekGridProps {
  refDate: Date;
  tasks: Task[];
  onSelectDate: (date: string) => void;
}

export function CalendarWeekGrid({ refDate, tasks, onSelectDate }: CalendarWeekGridProps) {
  const days = useMemo(() => getWeekDays(refDate), [refDate]);
  const dueDateMap = useMemo(() => tasksByDueDateMap(tasks), [tasks]);

  return (
    <div className="cwg">
      {/* Header row: 月 火 … 日 */}
      <div className="cwg-header">
        {days.map((cell, i) => (
          <span
            key={cell.date}
            className={`cwg-dow ${i >= 5 ? "cwg-dow--weekend" : ""}`}
          >
            {weekdayLabel(i)}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="cwg-grid">
        {days.map((cell) => {
          const dayTasks = dueDateMap.get(cell.date) ?? [];
          const highCount = dayTasks.filter((t) => t.priority === "high" && t.status !== "done").length;

          return (
            <button
              key={cell.date}
              className={[
                "cwg-cell",
                cell.isToday ? "cwg-cell--today" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelectDate(cell.date)}
            >
              {/* Date label + counts */}
              <div className="cwg-cell-head">
                <span className="cwg-cell-day">{cell.day}</span>
                {dayTasks.length > 0 && (
                  <span className="cwg-cell-count">{dayTasks.length}</span>
                )}
                {highCount > 0 && (
                  <span className="cwg-cell-high">{highCount}H</span>
                )}
              </div>

              {/* Compact task list */}
              <div className="cwg-cell-tasks">
                {dayTasks.map((t) => {
                  const isDone = t.status === "done";
                  const bucket = t.dueDate ? getDueBucket(t.dueDate) : null;
                  const dueDanger = (bucket === "overdue" || bucket === "today") && !isDone;

                  return (
                    <div
                      key={t.id}
                      className={`cwg-task ${isDone ? "cwg-task--done" : ""}`}
                    >
                      <span className="cwg-task-icon">{priorityIcon(t.priority)}</span>
                      <span className={`cwg-task-title ${dueDanger ? "cwg-task-title--danger" : ""}`}>
                        {t.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
