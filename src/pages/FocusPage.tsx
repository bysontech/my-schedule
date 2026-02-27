import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../domain/task";
import { listTasks, toggleDone, toggleStatus, upsertTask } from "../db/tasksRepo";
import { getDueBucket } from "../utils/dateBuckets";
import { priorityIcon } from "../utils/priorityIcon";
import { ensureNextInstanceForAllActiveTemplates } from "../utils/recurrenceEngine";

function sortByDueAsc(a: Task, b: Task): number {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate.localeCompare(b.dueDate);
}

export function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickTitle, setQuickTitle] = useState("");

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
      .sort(sortByDueAsc);

    const today = active
      .filter((t) => getDueBucket(t.dueDate) === "today")
      .sort(sortByDueAsc);

    const thisWeekHigh = active
      .filter(
        (t) =>
          getDueBucket(t.dueDate) === "thisWeek" && t.priority === "high",
      )
      .sort(sortByDueAsc);

    return { overdue, today, thisWeekHigh };
  }, [tasks]);

  const handleToggleDone = async (id: string) => {
    await toggleDone(id);
    load();
  };

  const handleToggleStatus = async (id: string) => {
    await toggleStatus(id);
    load();
  };

  const handleQuickAdd = async () => {
    const title = quickTitle.trim();
    if (!title) return;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      memo: null,
      dueDate: todayStr,
      priority: "med",
      status: "todo",
      groupId: null,
      projectId: null,
      bucketIds: [],
      recurrenceTemplateId: null,
      isDeleted: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await upsertTask(task);
    setQuickTitle("");
    load();
  };

  const total =
    sections.overdue.length +
    sections.today.length +
    sections.thisWeekHigh.length;

  return (
    <div className="focus-page">
      {/* Quick add */}
      <div className="focus-quick-add">
        <input
          type="text"
          className="focus-quick-input"
          placeholder="今日やることを追加..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd();
          }}
        />
        <button
          className="btn-sm"
          onClick={handleQuickAdd}
          disabled={!quickTitle.trim()}
        >
          追加
        </button>
      </div>

      {total === 0 ? (
        <div className="empty-state">
          <p>今やるべきタスクはありません</p>
          <Link to="/tasks" className="focus-planning-link">
            設計室で整理 →
          </Link>
        </div>
      ) : (
        <>
          <FocusSection
            title="期限切れ"
            tasks={sections.overdue}
            onToggleDone={handleToggleDone}
            onToggleStatus={handleToggleStatus}
            alert
          />
          <FocusSection
            title="今日"
            tasks={sections.today}
            onToggleDone={handleToggleDone}
            onToggleStatus={handleToggleStatus}
          />
          <FocusSection
            title="今週 High"
            tasks={sections.thisWeekHigh}
            onToggleDone={handleToggleDone}
            onToggleStatus={handleToggleStatus}
          />
          <div className="focus-footer">
            <Link to="/tasks" className="focus-planning-link">
              設計室で整理 →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function FocusSection({
  title,
  tasks,
  onToggleDone,
  onToggleStatus,
  alert,
}: {
  title: string;
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onToggleStatus: (id: string) => void;
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
          <div
            key={task.id}
            className={`focus-row ${task.status === "in_progress" ? "focus-row--active" : ""}`}
          >
            <input
              type="checkbox"
              className="task-checkbox"
              checked={false}
              onChange={() => onToggleDone(task.id)}
            />
            <button
              className={`focus-status-btn ${task.status === "in_progress" ? "focus-status-btn--active" : ""}`}
              onClick={() => onToggleStatus(task.id)}
              title={task.status === "todo" ? "着手する" : "未着手に戻す"}
            >
              {task.status === "in_progress" ? "着手中" : "着手"}
            </button>
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
