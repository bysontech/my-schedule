import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import { createEmptyTask } from "../domain/task";
import { getTask, upsertTask } from "../db/tasksRepo";
import type { Group, Project, Bucket } from "../domain/master";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import type { RecurrenceType } from "../domain/recurrence";
import { WEEKDAY_LABELS } from "../domain/recurrence";
import { upsertTemplate } from "../db/recurrenceRepo";

export function TaskFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [groupId, setGroupId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [bucketIds, setBucketIds] = useState<string[]>([]);
  const [titleError, setTitleError] = useState(false);
  const [existingTask, setExistingTask] = useState<Task | null>(null);

  // 繰り返し設定（新規のみ）
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("weekly");
  const [recurrenceValue, setRecurrenceValue] = useState(1);
  const [recurrenceNthWeek, setRecurrenceNthWeek] = useState(1);

  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  useEffect(() => {
    listGroups().then(setGroups);
    listProjects().then(setProjects);
    listBuckets().then(setBuckets);
    if (id) {
      getTask(id).then((task) => {
        if (task) {
          setExistingTask(task);
          setTitle(task.title);
          setMemo(task.memo ?? "");
          setDueDate(task.dueDate ?? "");
          setPriority(task.priority);
          setStatus(task.status);
          setGroupId(task.groupId ?? "");
          setProjectId(task.projectId ?? "");
          setBucketIds(task.bucketIds);
        }
      });
    }
  }, [id]);

  const filteredProjects = groupId
    ? projects.filter((p) => p.groupId === groupId)
    : projects;

  const toggleBucket = (bid: string) => {
    setBucketIds((prev) =>
      prev.includes(bid) ? prev.filter((b) => b !== bid) : [...prev, bid]
    );
  };

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
      groupId: groupId || null,
      projectId: projectId || null,
      bucketIds,
      updatedAt: now,
    };

    await upsertTask(task);

    // 繰り返し設定があれば recurrenceTemplate も作成
    if (!isEdit && recurrenceEnabled) {
      await upsertTemplate({
        id: crypto.randomUUID(),
        title: trimmed,
        memo: memo.trim() || null,
        priority,
        groupId: groupId || null,
        projectId: projectId || null,
        bucketIds,
        recurrenceType,
        recurrenceValue,
        recurrenceNthWeek: recurrenceType === "monthly_nth" ? recurrenceNthWeek : null,
        isActive: true,
        lastGeneratedDate: null,
        createdAt: now,
      });
    }

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

      {groups.length > 0 && (
        <div className="form-group">
          <label className="form-label">グループ</label>
          <select
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
              setProjectId("");
            }}
          >
            <option value="">なし</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      )}

      {projects.length > 0 && (
        <div className="form-group">
          <label className="form-label">プロジェクト</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">なし</option>
            {filteredProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {buckets.length > 0 && (
        <div className="form-group">
          <label className="form-label">自由分類 (Bucket)</label>
          <div className="bucket-checks">
            {buckets.map((b) => {
              const checked = bucketIds.includes(b.id);
              return (
                <label
                  key={b.id}
                  className={`bucket-check-label ${checked ? "bucket-check-label--checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBucket(b.id)}
                  />
                  {b.name}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 繰り返し設定（新規のみ） */}
      {!isEdit && (
        <>
          <div className="form-group">
            <label className="bucket-check-label" style={{ display: "inline-flex", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={recurrenceEnabled}
                onChange={(e) => setRecurrenceEnabled(e.target.checked)}
                style={{ width: "auto", height: "auto", opacity: 1, position: "static" }}
              />
              繰り返し設定を有効にする
            </label>
          </div>

          {recurrenceEnabled && (
            <>
              <div className="form-group">
                <label className="form-label">繰り返し種別</label>
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                >
                  <option value="weekly">毎週</option>
                  <option value="monthly_date">毎月（日付指定）</option>
                  <option value="monthly_nth">毎月（第N曜日）</option>
                </select>
              </div>

              {recurrenceType === "weekly" && (
                <div className="form-group">
                  <label className="form-label">曜日</label>
                  <select
                    value={recurrenceValue}
                    onChange={(e) => setRecurrenceValue(Number(e.target.value))}
                  >
                    {WEEKDAY_LABELS.map((label, i) => (
                      <option key={i} value={i}>{label}曜日</option>
                    ))}
                  </select>
                </div>
              )}

              {recurrenceType === "monthly_date" && (
                <div className="form-group">
                  <label className="form-label">日（1-31）</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={recurrenceValue}
                    onChange={(e) => setRecurrenceValue(Number(e.target.value))}
                  />
                </div>
              )}

              {recurrenceType === "monthly_nth" && (
                <>
                  <div className="form-group">
                    <label className="form-label">第N</label>
                    <select
                      value={recurrenceNthWeek}
                      onChange={(e) => setRecurrenceNthWeek(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>第{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">曜日</label>
                    <select
                      value={recurrenceValue}
                      onChange={(e) => setRecurrenceValue(Number(e.target.value))}
                    >
                      {WEEKDAY_LABELS.map((label, i) => (
                        <option key={i} value={i}>{label}曜日</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

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
