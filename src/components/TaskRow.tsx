import { forwardRef } from "react";
import type { Task } from "../domain/task";
import { getDueBucket } from "../utils/dateBuckets";
import { priorityIcon } from "../utils/priorityIcon";

interface TaskRowProps {
  task: Task;
  onToggleDone: (id: string) => void;
  onClickTitle?: (task: Task) => void;
  selected?: boolean;
  extra?: React.ReactNode;   // slot for kebab, status-btn, etc.
}

export const TaskRow = forwardRef<HTMLDivElement, TaskRowProps>(
  function TaskRow({ task, onToggleDone, onClickTitle, selected, extra }, ref) {
    const isDone = task.status === "done";
    const bucket = task.dueDate ? getDueBucket(task.dueDate) : null;
    const dueDanger = bucket === "overdue" || bucket === "today";

    const classes = [
      "taskrow",
      isDone ? "taskrow--done" : "",
      selected ? "taskrow--selected" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes}>
        <input
          type="checkbox"
          className="task-checkbox"
          checked={isDone}
          onChange={(e) => {
            e.stopPropagation();
            onToggleDone(task.id);
          }}
        />
        <span className="taskrow-priority">{priorityIcon(task.priority)}</span>
        <span
          className={`taskrow-title ${isDone ? "taskrow-title--done" : ""}`}
          onClick={() => onClickTitle?.(task)}
          role={onClickTitle ? "button" : undefined}
          tabIndex={onClickTitle ? 0 : undefined}
        >
          {task.title}
        </span>
        {task.dueDate && (
          <span className={`taskrow-due ${dueDanger && !isDone ? "taskrow-due--danger" : ""}`}>
            {task.dueDate}
          </span>
        )}
        {extra}
      </div>
    );
  },
);
