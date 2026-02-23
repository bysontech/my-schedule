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
    <div className="form-container">
      <h2 className="form-title">{isEdit ? "タスク編集" : "タスク作成"}</h2>

      <div className="form-group">
        <label className="form-label">
          タイトル <span className="form-required">*</span>
        </label>
        <input
          type="text"
          value={title}
          className={titleError ? "input-error" : ""}
          placeholder="タスク名を入力"
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setTitleError(false);
          }}
        />
        {titleError && <p className="form-error">タイトルは必須です</p>}
      </div>

      <div className="form-group">
        <label className="form-label">期限</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">優先度</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          <option value="high">High</option>
          <option value="med">Med</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">状態</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          <option value="todo">未着手</option>
          <option value="in_progress">進行中</option>
          <option value="done">完了</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          placeholder="メモを入力（任意）"
        />
      </div>

      <div className="form-actions">
        <button onClick={handleSave}>保存</button>
        <button className="btn-secondary" onClick={() => navigate("/tasks")}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
