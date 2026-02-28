import { useMemo } from "react";
import type { Task } from "../domain/task";
import { getMonthGrid, tasksByDueDateMap, weekdayLabel } from "../utils/calendar";

interface CalendarMonthProps {
  year: number;
  month: number;         // 1-12
  tasks: Task[];
  onSelectDate: (date: string) => void;
}

export function CalendarMonth({ year, month, tasks, onSelectDate }: CalendarMonthProps) {
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);
  const dueDateMap = useMemo(() => tasksByDueDateMap(tasks), [tasks]);

  return (
    <div className="cal-month">
      {/* Header: 月 火 … 日 */}
      <div className="cal-month-header">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className={`cal-month-dow ${i >= 5 ? "cal-month-dow--weekend" : ""}`}>
            {weekdayLabel(i)}
          </span>
        ))}
      </div>

      {/* 6×7 grid */}
      <div className="cal-month-grid">
        {grid.map((cell) => {
          const dayTasks = dueDateMap.get(cell.date);
          const count = dayTasks ? dayTasks.length : 0;
          const allDone = dayTasks ? dayTasks.every((t) => t.status === "done") : false;

          return (
            <button
              key={cell.date}
              className={[
                "cal-month-cell",
                !cell.inMonth ? "cal-month-cell--outside" : "",
                cell.isToday ? "cal-month-cell--today" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => onSelectDate(cell.date)}
            >
              <span className="cal-month-day">{cell.day}</span>
              {count > 0 && (
                <span className={`cal-month-count ${allDone ? "cal-month-count--done" : ""}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
