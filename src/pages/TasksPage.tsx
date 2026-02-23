import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import { priorityOrder } from "../domain/task";
import { listTasks, toggleDone, softDeleteTask } from "../db/tasksRepo";
import { getDueBucket, DUE_BUCKET_LABELS, type DueBucket } from "../utils/dateBuckets";

type SortKey = "dueDate" | "priority" | "updatedAt";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: "High",
  med: "Med",
  low: "Low",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
};

export function TasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterDueBucket, setFilterDueBucket] = useState<DueBucket | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");

  const load = () => {
    listTasks().then(setTasks);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = tasks;
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (filterDueBucket !== "all") {
      result = result.filter((t) => getDueBucket(t.dueDate) === filterDueBucket);
    }
    return result;
  }, [tasks, filterStatus, filterPriority, filterDueBucket]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortKey) {
      case "dueDate":
        arr.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
        break;
      case "priority":
        arr.sort((a, b) => priorityOrder(b.priority) - priorityOrder(a.priority));
        break;
      case "updatedAt":
        arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
    }
    return arr;
  }, [filtered, sortKey]);

  const handleToggleDone = async (id: string) => {
    await toggleDone(id);
    load();
  };

  const handleDelete = async (id: string) => {
    await softDeleteTask(id);
    load();
  };

  const dueBucket = (task: Task) => getDueBucket(task.dueDate);

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-item">
          <span className="filter-label">状態</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
          >
            <option value="all">すべて</option>
            {(["todo", "in_progress", "done"] as const).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <span className="filter-label">優先度</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "all")}
          >
            <option value="all">すべて</option>
            {(["high", "med", "low"] as const).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <span className="filter-label">期限</span>
          <select
            value={filterDueBucket}
            onChange={(e) => setFilterDueBucket(e.target.value as DueBucket | "all")}
          >
            <option value="all">すべて</option>
            {(["overdue", "today", "thisWeek", "thisMonth"] as const).map((b) => (
              <option key={b} value={b}>{DUE_BUCKET_LABELS[b]}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <span className="filter-label">ソート</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="dueDate">期限昇順</option>
            <option value="priority">優先度降順</option>
            <option value="updatedAt">更新日降順</option>
          </select>
        </div>
      </div>

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>タスクがありません</p>
          <button onClick={() => navigate("/tasks/new")} style={{ marginTop: "0.75rem" }}>
            + 最初のタスクを作成
          </button>
        </div>
      ) : (
        <div className="task-list">
          {sorted.map((task) => {
            const bucket = dueBucket(task);
            const isDone = task.status === "done";
            return (
              <div
                key={task.id}
                className={`task-card ${isDone ? "task-card--done" : ""}`}
              >
                <input
                  type="checkbox"
                  className="task-checkbox"
                  checked={isDone}
                  onChange={() => handleToggleDone(task.id)}
                />

                <div className="task-body" onClick={() => navigate(`/tasks/${task.id}/edit`)}>
                  <p className={`task-title ${isDone ? "task-title--done" : ""}`}>
                    {task.title}
                  </p>
                  <div className="task-meta">
                    <span className={`badge badge-priority-${task.priority}`}>
                      {PRIORITY_LABELS[task.priority]}
                    </span>
                    <span className="badge badge-status">
                      {STATUS_LABELS[task.status]}
                    </span>
                    {task.dueDate && (
                      <span className={`badge badge-due ${bucket === "overdue" ? "badge-overdue" : ""}`}>
                        {task.dueDate}
                        {bucket ? ` (${DUE_BUCKET_LABELS[bucket]})` : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    className="btn-sm btn-ghost"
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                  >
                    編集
                  </button>
                  <button
                    className="btn-sm btn-danger"
                    onClick={() => handleDelete(task.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
