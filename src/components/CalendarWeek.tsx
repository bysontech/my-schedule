import { useMemo } from "react";
import type { Task } from "../domain/task";
import { getWeekDays, tasksByDueDateMap, weekdayLabel } from "../utils/calendar";
import { TaskRow } from "./TaskRow";

interface CalendarWeekProps {
  refDate: Date;
  tasks: Task[];
  onSelectDate: (date: string) => void;
  onToggleDone: (id: string) => void;
}

export function CalendarWeek({ refDate, tasks, onSelectDate, onToggleDone }: CalendarWeekProps) {
  const days = useMemo(() => getWeekDays(refDate), [refDate]);
  const dueDateMap = useMemo(() => tasksByDueDateMap(tasks), [tasks]);

  return (
    <div className="cal-week">
      {days.map((cell, i) => {
        const dayTasks = dueDateMap.get(cell.date) ?? [];
        return (
          <div
            key={cell.date}
            className={[
              "cal-week-day",
              cell.isToday ? "cal-week-day--today" : "",
            ].filter(Boolean).join(" ")}
          >
            <button
              className="cal-week-header"
              onClick={() => onSelectDate(cell.date)}
            >
              <span className="cal-week-dow">{weekdayLabel(i)}</span>
              <span className="cal-week-date">{cell.day}</span>
              {dayTasks.length > 0 && (
                <span className="cal-week-badge">{dayTasks.length}</span>
              )}
            </button>
            {dayTasks.length > 0 && (
              <div className="cal-week-tasks">
                {dayTasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggleDone={onToggleDone}
                    onClickTitle={() => onSelectDate(cell.date)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
