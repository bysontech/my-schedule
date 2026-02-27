import { useState, useEffect, useMemo } from "react";
import type { Task } from "../domain/task";
import { listTasks, toggleDone } from "../db/tasksRepo";
import { getDueBucket } from "../utils/dateBuckets";
import { priorityIcon } from "../utils/priorityIcon";
import { ensureNextInstanceForAllActiveTemplates } from "../utils/recurrenceEngine";

export function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = () => {
    listTasks().then(setTasks);
  };

  useEffect(() => {
    ensureNextInstanceForAllActiveTemplates().then(() => load());
  }, []);

  const sections = useMemo(() => {
    const active = tasks.filter((t) => t.status !== "done");

    const overdue = active
      .filter((t) => getDueBucket(t.dueDate) === "overdue")
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

    const today = active
      .filter((t) => getDueBucket(t.dueDate) === "today")
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

    const thisWeekHigh = active
      .filter(
        (t) =>
          getDueBucket(t.dueDate) === "thisWeek" && t.priority === "high",
      )
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

    return { overdue, today, thisWeekHigh };
  }, [tasks]);

  const handleToggle = async (id: string) => {
    await toggleDone(id);
    load();
  };

  const total =
    sections.overdue.length +
    sections.today.length +
    sections.thisWeekHigh.length;

  return (
    <div className="focus-page">
      {total === 0 ? (
        <div className="empty-state">
          <p>今やるべきタスクはありません</p>
        </div>
      ) : (
        <>
          <FocusSection
            title="期限切れ"
            tasks={sections.overdue}
            onToggle={handleToggle}
            alert
          />
          <FocusSection
            title="今日"
            tasks={sections.today}
            onToggle={handleToggle}
          />
          <FocusSection
            title="今週 High"
            tasks={sections.thisWeekHigh}
            onToggle={handleToggle}
          />
        </>
      )}
    </div>
  );
}

function FocusSection({
  title,
  tasks,
  onToggle,
  alert,
}: {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  alert?: boolean;
}) {
  if (tasks.length === 0) return null;

  return (
    <section className="focus-section">
      <h2 className={`focus-section-title ${alert ? "focus-section-title--alert" : ""}`}>
        {title}
        <span className={`focus-count ${alert ? "focus-count--alert" : ""}`}>
          {tasks.length}
        </span>
      </h2>
      <div className="focus-list">
        {tasks.map((task) => (
          <div key={task.id} className="focus-row">
            <input
              type="checkbox"
              className="task-checkbox"
              checked={false}
              onChange={() => onToggle(task.id)}
            />
            <span className="focus-priority">{priorityIcon(task.priority)}</span>
            <span className="focus-title">{task.title}</span>
            {task.dueDate && (
              <span className="focus-due">{task.dueDate}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
