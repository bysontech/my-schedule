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

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <label>
          状態:
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
            style={{ marginLeft: 4 }}
          >
            <option value="all">すべて</option>
            {(["todo", "in_progress", "done"] as const).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </label>

        <label>
          優先度:
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "all")}
            style={{ marginLeft: 4 }}
          >
            <option value="all">すべて</option>
            {(["high", "med", "low"] as const).map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </label>

        <label>
          期限:
          <select
            value={filterDueBucket}
            onChange={(e) => setFilterDueBucket(e.target.value as DueBucket | "all")}
            style={{ marginLeft: 4 }}
          >
            <option value="all">すべて</option>
            {(["overdue", "today", "thisWeek", "thisMonth"] as const).map((b) => (
              <option key={b} value={b}>{DUE_BUCKET_LABELS[b]}</option>
            ))}
          </select>
        </label>

        <label>
          ソート:
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            style={{ marginLeft: 4 }}
          >
            <option value="dueDate">期限昇順</option>
            <option value="priority">優先度降順</option>
            <option value="updatedAt">更新日降順</option>
          </select>
        </label>
      </div>

      {sorted.length === 0 && (
        <p style={{ color: "#888" }}>タスクがありません</p>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        {sorted.length > 0 && (
          <thead>
            <tr>
              <th style={thStyle}>完了</th>
              <th style={{ ...thStyle, textAlign: "left" }}>タイトル</th>
              <th style={thStyle}>期限</th>
              <th style={thStyle}>優先度</th>
              <th style={thStyle}>状態</th>
              <th style={thStyle}>操作</th>
            </tr>
          </thead>
        )}
        <tbody>
          {sorted.map((task) => (
            <tr
              key={task.id}
              style={{
                opacity: task.status === "done" ? 0.6 : 1,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <td style={{ ...tdStyle, textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={() => handleToggleDone(task.id)}
                />
              </td>
              <td
                style={{
                  ...tdStyle,
                  textDecoration: task.status === "done" ? "line-through" : "none",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
              >
                {task.title}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                {task.dueDate ?? "-"}
                {task.dueDate && getDueBucket(task.dueDate) === "overdue" && (
                  <span style={{ color: "red", marginLeft: 4 }}>!</span>
                )}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                {PRIORITY_LABELS[task.priority]}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                {STATUS_LABELS[task.status]}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                <button
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                  style={{ fontSize: "0.85em", padding: "0.3em 0.6em", marginRight: 4 }}
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  style={{
                    fontSize: "0.85em",
                    padding: "0.3em 0.6em",
                    background: "#c0392b",
                    color: "#fff",
                  }}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderBottom: "2px solid #ccc",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem",
};
