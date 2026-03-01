import { useMemo } from "react";
import type { Task } from "../domain/task";
import { formatDate, todayStr } from "../utils/calendar";

interface CalendarYearProps {
  year: number;
  tasks: Task[];
  onSelectMonth: (year: number, month: number) => void;
}

const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function CalendarYear({ year, tasks, onSelectMonth }: CalendarYearProps) {
  const today = todayStr();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Count tasks per month
  const monthCounts = useMemo(() => {
    const counts = new Array<number>(12).fill(0);
    for (const t of tasks) {
      if (!t.dueDate || t.isDeleted) continue;
      const [y, m] = t.dueDate.split("-").map(Number);
      if (y === year && m >= 1 && m <= 12) {
        counts[m - 1]++;
      }
    }
    return counts;
  }, [tasks, year]);

  // Mini month grids (simplified: just day numbers with dots)
  const miniMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const firstDay = new Date(year, month - 1, 1);
      const startDow = (firstDay.getDay() + 6) % 7; // Mon=0
      const daysInMonth = new Date(year, month, 0).getDate();

      const cells: { day: number; date: string; isToday: boolean }[] = [];
      // Empty cells before first day
      for (let d = 0; d < startDow; d++) {
        cells.push({ day: 0, date: "", isToday: false });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const date = formatDate(new Date(year, month - 1, d));
        cells.push({ day: d, date, isToday: date === today });
      }
      return cells;
    });
  }, [year, today]);

  // Build due date count map for dot indicators
  const dueDateCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (!t.dueDate || t.isDeleted) continue;
      map.set(t.dueDate, (map.get(t.dueDate) ?? 0) + 1);
    }
    return map;
  }, [tasks]);

  return (
    <div className="cal-year">
      <div className="cal-year-grid">
        {MONTH_NAMES.map((name, i) => {
          const month = i + 1;
          const isCurrentMonth = year === currentYear && month === currentMonth;
          const count = monthCounts[i];

          return (
            <button
              key={month}
              className={`cal-year-month ${isCurrentMonth ? "cal-year-month--current" : ""}`}
              onClick={() => onSelectMonth(year, month)}
            >
              <div className="cal-year-month-head">
                <span className="cal-year-month-name">{name}</span>
                {count > 0 && (
                  <span className="cal-year-month-count">{count}</span>
                )}
              </div>
              <div className="cal-year-mini">
                <div className="cal-year-mini-header">
                  {["月", "火", "水", "木", "金", "土", "日"].map((d) => (
                    <span key={d} className="cal-year-mini-dow">{d}</span>
                  ))}
                </div>
                <div className="cal-year-mini-grid">
                  {miniMonths[i].map((cell, ci) => (
                    <span
                      key={ci}
                      className={[
                        "cal-year-mini-day",
                        cell.day === 0 ? "cal-year-mini-day--empty" : "",
                        cell.isToday ? "cal-year-mini-day--today" : "",
                        cell.date && dueDateCounts.has(cell.date) ? "cal-year-mini-day--has-task" : "",
                      ].filter(Boolean).join(" ")}
                    >
                      {cell.day > 0 ? cell.day : ""}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
