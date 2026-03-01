import { useState, useEffect, useMemo } from "react";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import { createEmptyTask } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import { upsertTask } from "../db/tasksRepo";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import { Drawer } from "./Drawer";

interface TaskDrawerProps {
  /** null = closed, undefined = create mode, Task = edit mode */
  task: Task | null | undefined;
  /** Default dueDate for create mode */
  defaultDueDate?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function TaskDrawer({ task, defaultDueDate, onClose, onSaved }: TaskDrawerProps) {
  const isOpen = task !== null;
  const isCreate = task === undefined;

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [groupId, setGroupId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [bucketIds, setBucketIds] = useState<string[]>([]);
  const [titleError, setTitleError] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  // Reset form when task changes
  useEffect(() => {
    if (task === null) return; // closed
    listGroups().then(setGroups);
    listProjects().then(setProjects);
    listBuckets().then(setBuckets);

    if (task === undefined) {
      // create mode
      setTitle("");
      setMemo("");
      setDueDate(defaultDueDate ?? "");
      setPriority("med");
      setStatus("todo");
      setGroupId("");
      setProjectId("");
      setBucketIds([]);
      setTitleError(false);
    } else {
      // edit mode
      setTitle(task.title);
      setMemo(task.memo ?? "");
      setDueDate(task.dueDate ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setGroupId(task.groupId ?? "");
      setProjectId(task.projectId ?? "");
      setBucketIds(task.bucketIds);
      setTitleError(false);
    }
  }, [task, defaultDueDate]);

  const filteredProjects = useMemo(
    () => (groupId ? projects.filter((p) => p.groupId === groupId) : projects),
    [projects, groupId],
  );

  const toggleBucket = (bid: string) => {
    setBucketIds((prev) =>
      prev.includes(bid) ? prev.filter((b) => b !== bid) : [...prev, bid],
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    const now = new Date().toISOString();

    if (isCreate) {
      const newTask: Task = {
        ...createEmptyTask(),
        id: crypto.randomUUID(),
        title: title.trim(),
        memo: memo.trim() || null,
        dueDate: dueDate || null,
        priority,
        status,
        groupId: groupId || null,
        projectId: projectId || null,
        bucketIds,
        createdAt: now,
        updatedAt: now,
      };
      await upsertTask(newTask);
    } else if (task) {
      const updated: Task = {
        ...task,
        title: title.trim(),
        memo: memo.trim() || null,
        dueDate: dueDate || null,
        priority,
        status,
        groupId: groupId || null,
        projectId: projectId || null,
        bucketIds,
      };
      await upsertTask(updated);
    }

    onSaved();
    onClose();
  };

  return (
    <Drawer open={isOpen} onClose={onClose} title={isCreate ? "タスク作成" : "タスク編集"}>
      <div className="drawer-form">
        <div className="form-group">
          <label className="form-label">タイトル <span className="form-required">*</span></label>
          <input
            type="text"
            value={title}
            className={titleError ? "input-error" : ""}
            placeholder="タスク名"
            onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
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
          <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="high">High</option>
            <option value="med">Med</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">状態</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
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
              onChange={(e) => { setGroupId(e.target.value); setProjectId(""); }}
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
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">なし</option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {buckets.length > 0 && (
          <div className="form-group">
            <label className="form-label">Bucket</label>
            <div className="bucket-checks">
              {buckets.map((b) => {
                const checked = bucketIds.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`bucket-check-label ${checked ? "bucket-check-label--checked" : ""}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleBucket(b.id)} />
                    {b.name}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="メモ（任意）"
          />
        </div>

        <div className="form-actions">
          <button onClick={handleSave} disabled={!title.trim()}>
            {isCreate ? "作成" : "保存"}
          </button>
          <button className="btn-secondary" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </Drawer>
  );
}
