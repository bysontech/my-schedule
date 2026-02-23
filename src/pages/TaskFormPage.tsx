import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import { createEmptyTask } from "../domain/task";
import { getTask, upsertTask } from "../db/tasksRepo";

export function TaskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [titleError, setTitleError] = useState(false);
  const [existingTask, setExistingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (id) {
      getTask(id).then((task) => {
        if (task) {
          setExistingTask(task);
          setTitle(task.title);
          setMemo(task.memo ?? "");
          setDueDate(task.dueDate ?? "");
          setPriority(task.priority);
          setStatus(task.status);
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError(true);
      return;
    }
    setTitleError(false);

    const now = new Date().toISOString();
    const base = existingTask ?? {
      ...createEmptyTask(),
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const task: Task = {
      ...base,
      title: trimmed,
      memo: memo.trim() || null,
      dueDate: dueDate || null,
      priority,
      status,
      updatedAt: now,
    };

    await upsertTask(task);
    navigate("/tasks");
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>{isEdit ? "タスク編集" : "タスク作成"}</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          タイトル <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError(false);
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "0.4rem",
              marginTop: 4,
              boxSizing: "border-box",
              border: titleError ? "2px solid red" : "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </label>
        {titleError && (
          <p style={{ color: "red", margin: "0.25rem 0 0", fontSize: "0.85em" }}>
            タイトルは必須です
          </p>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          期限
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "0.4rem",
              marginTop: 4,
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          優先度
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            style={{ display: "block", marginTop: 4, padding: "0.4rem" }}
          >
            <option value="high">High</option>
            <option value="med">Med</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          状態
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            style={{ display: "block", marginTop: 4, padding: "0.4rem" }}
          >
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          メモ
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            style={{
              display: "block",
              width: "100%",
              padding: "0.4rem",
              marginTop: 4,
              boxSizing: "border-box",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontFamily: "inherit",
            }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={handleSave}>保存</button>
        <button
          onClick={() => navigate("/tasks")}
          style={{ background: "#888" }}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
