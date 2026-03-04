import { useMemo } from "react";
import type { Task } from "../domain/task";
import { getDayTasks, splitDayTasks, computeBlock } from "../utils/dayView";

const HOUR_START = 0;
const HOUR_END = 24;
const HOUR_HEIGHT = 48; // px per hour
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);

interface CalendarDayTimelineProps {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onCreateTask: (date: string) => void;
}

export function CalendarDayTimeline({
  date,
  tasks,
  onSelectTask,
  onCreateTask,
}: CalendarDayTimelineProps) {
  const dayTasks = useMemo(() => getDayTasks(tasks, date), [tasks, date]);
  const { unscheduled, timed } = useMemo(() => splitDayTasks(dayTasks), [dayTasks]);

  const timelineHeight = (HOUR_END - HOUR_START) * HOUR_HEIGHT;

  return (
    <div className="cdt">
      {/* Header: date + add button */}
      <div className="cdt-header">
        <span className="cdt-date">{date}</span>
        <button
          className="cdt-add-btn"
          onClick={() => onCreateTask(date)}
          title="タスク作成"
        >
          +
        </button>
      </div>

      {/* Unscheduled lane */}
      {unscheduled.length > 0 && (
        <div className="cdt-unscheduled">
          <span className="cdt-lane-label">未定</span>
          <div className="cdt-unscheduled-list">
            {unscheduled.map((t) => {
              const isDone = t.status === "done";
              return (
                <button
                  key={t.id}
                  className={`cdt-task-chip ${isDone ? "cdt-task-chip--done" : ""}`}
                  onClick={() => onSelectTask(t)}
                >
                  <span className={`cdt-task-chip-bar cdt-task-chip-bar--${t.priority}`} />
                  <span className={`cdt-task-chip-title ${isDone ? "cdt-task-chip-title--done" : ""}`}>
                    {t.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline grid */}
      <div className="cdt-timeline" style={{ height: timelineHeight }}>
        {/* Hour lines */}
        {HOURS.map((h) => {
          const top = (h - HOUR_START) * HOUR_HEIGHT;
          return (
            <div key={h} className="cdt-hour-line" style={{ top }}>
              <span className="cdt-hour-label">{h}:00</span>
            </div>
          );
        })}

        {/* Timed task blocks */}
        {timed.map((t) => {
          const { top, height } = computeBlock(t, HOUR_START, HOUR_HEIGHT);
          const isDone = t.status === "done";
          const timeLabel = t.endAt ? `${t.startAt}–${t.endAt}` : `${t.startAt}–`;

          return (
            <button
              key={t.id}
              className={`cdt-block ${isDone ? "cdt-block--done" : ""}`}
              style={{ top, height: Math.max(height, 20) }}
              onClick={() => onSelectTask(t)}
            >
              <span className={`cdt-block-bar cdt-block-bar--${t.priority}`} />
              <div className="cdt-block-content">
                <span className={`cdt-block-title ${isDone ? "cdt-block-title--done" : ""}`}>
                  {t.title}
                </span>
                <span className="cdt-block-time">{timeLabel}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {dayTasks.length === 0 && (
        <div className="cdt-empty">この日のタスクはありません</div>
      )}
    </div>
  );
}
