import { useState, useEffect, useMemo } from "react";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import { createEmptyTask } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import { upsertTask } from "../db/tasksRepo";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import { upsertGroup } from "../db/groupsRepo";
import { upsertProject } from "../db/projectsRepo";
import { Drawer } from "./Drawer";
import { useI18n } from "../i18n/I18nContext";

interface TaskDrawerProps {
  /** null = closed, undefined = create mode, Task = edit mode */
  task: Task | null | undefined;
  /** Default dueDate for create mode */
  defaultDueDate?: string;
  /** Default groupId for create mode */
  defaultGroupId?: string;
  /** Default projectId for create mode */
  defaultProjectId?: string;
  onClose: () => void;
  onSaved: () => void;
}

type InlineCreate = "group" | "project" | null;

export function TaskDrawer({ task, defaultDueDate, defaultGroupId, defaultProjectId, onClose, onSaved }: TaskDrawerProps) {
  const { t } = useI18n();
  const isOpen = task !== null;
  const isCreate = task === undefined;

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [groupId, setGroupId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [bucketIds, setBucketIds] = useState<string[]>([]);
  const [titleError, setTitleError] = useState(false);
  const [timeError, setTimeError] = useState(false);

  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  // Inline create state
  const [inlineCreate, setInlineCreate] = useState<InlineCreate>(null);
  const [inlineName, setInlineName] = useState("");
  const [inlineGroupId, setInlineGroupId] = useState("");
  const [inlineNameError, setInlineNameError] = useState(false);

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
      setStartAt("");
      setEndAt("");
      setPriority("med");
      setStatus("todo");
      setGroupId(defaultGroupId ?? "");
      setProjectId(defaultProjectId ?? "");
      setBucketIds([]);
      setTitleError(false);
      setTimeError(false);
    } else {
      // edit mode
      setTitle(task.title);
      setMemo(task.memo ?? "");
      setDueDate(task.dueDate ?? "");
      setStartAt(task.startAt ?? "");
      setEndAt(task.endAt ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setGroupId(task.groupId ?? "");
      setProjectId(task.projectId ?? "");
      setBucketIds(task.bucketIds);
      setTitleError(false);
      setTimeError(false);
    }
    setInlineCreate(null);
    setInlineName("");
    setInlineGroupId("");
    setInlineNameError(false);
  }, [task, defaultDueDate, defaultGroupId, defaultProjectId]);

  const filteredProjects = useMemo(
    () => (groupId ? projects.filter((p) => p.groupId === groupId) : projects),
    [projects, groupId],
  );

  const toggleBucket = (bid: string) => {
    setBucketIds((prev) =>
      prev.includes(bid) ? prev.filter((b) => b !== bid) : [...prev, bid],
    );
  };

  // Inline create handlers
  const handleInlineCreateSave = async () => {
    const trimmed = inlineName.trim();
    if (!trimmed) {
      setInlineNameError(true);
      return;
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();

    if (inlineCreate === "group") {
      const newGroup: Group = { id: newId, name: trimmed, createdAt: now };
      await upsertGroup(newGroup);
      const freshGroups = await listGroups();
      setGroups(freshGroups);
      setGroupId(newId);
    } else if (inlineCreate === "project") {
      const newProject: Project = {
        id: newId,
        name: trimmed,
        groupId: inlineGroupId || null,
        createdAt: now,
      };
      await upsertProject(newProject);
      const freshProjects = await listProjects();
      setProjects(freshProjects);
      setProjectId(newId);
    }

    setInlineCreate(null);
    setInlineName("");
    setInlineGroupId("");
    setInlineNameError(false);
  };

  const handleInlineCreateCancel = () => {
    setInlineCreate(null);
    setInlineName("");
    setInlineGroupId("");
    setInlineNameError(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    // Validate startAt <= endAt if both present
    if (startAt && endAt && startAt > endAt) {
      setTimeError(true);
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
        startAt: startAt || null,
        endAt: endAt || null,
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
        startAt: startAt || null,
        endAt: endAt || null,
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
    <Drawer open={isOpen} onClose={onClose} title={isCreate ? t.taskCreate : t.taskEdit}>
      <div className="drawer-form">
        {/* Inline create panel */}
        {inlineCreate && (
          <div className="inline-create-panel">
            <h4 className="inline-create-title">
              {inlineCreate === "group" ? t.groupCreate : t.projectCreate}
            </h4>
            <div className="form-group">
              <input
                type="text"
                value={inlineName}
                className={inlineNameError ? "input-error" : ""}
                placeholder={inlineCreate === "group" ? t.groupNamePlaceholder : t.projectNamePlaceholder}
                onChange={(e) => { setInlineName(e.target.value); setInlineNameError(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleInlineCreateSave();
                  }
                }}
                autoFocus
              />
              {inlineNameError && <p className="form-error">{t.nameRequired}</p>}
            </div>
            {inlineCreate === "project" && (
              <div className="form-group">
                <label className="form-label">{t.belongsToGroup}</label>
                <select value={inlineGroupId} onChange={(e) => setInlineGroupId(e.target.value)}>
                  <option value="">{t.none}</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="inline-create-actions">
              <button className="btn-sm" onClick={handleInlineCreateSave} disabled={!inlineName.trim()}>{t.create}</button>
              <button className="btn-sm btn-ghost" onClick={handleInlineCreateCancel}>{t.back}</button>
            </div>
          </div>
        )}

        {/* Main form (always rendered to preserve input) */}
        <div style={inlineCreate ? { display: "none" } : undefined}>
          <div className="form-group">
            <label className="form-label">{t.title} <span className="form-required">*</span></label>
            <input
              type="text"
              value={title}
              className={titleError ? "input-error" : ""}
              placeholder={t.taskNamePlaceholder}
              onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
            />
            {titleError && <p className="form-error">{t.titleRequired}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">{t.dueDate}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t.startTime}</label>
            <div className="form-time-row">
              <input
                type="time"
                value={startAt}
                onChange={(e) => { setStartAt(e.target.value); setTimeError(false); }}
              />
              {startAt && (
                <button type="button" className="form-time-clear" onClick={() => setStartAt("")}>×</button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.endTime}</label>
            <div className="form-time-row">
              <input
                type="time"
                value={endAt}
                onChange={(e) => { setEndAt(e.target.value); setTimeError(false); }}
              />
              {endAt && (
                <button type="button" className="form-time-clear" onClick={() => setEndAt("")}>×</button>
              )}
            </div>
            {timeError && <p className="form-error">{t.endAfterStart}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">{t.priority}</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="high">{t.priorityHigh}</option>
              <option value="med">{t.priorityMed}</option>
              <option value="low">{t.priorityLow}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.status}</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              <option value="todo">{t.statusTodo}</option>
              <option value="in_progress">{t.statusInProgress}</option>
              <option value="done">{t.statusDone}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.group}</label>
            <div className="form-select-with-add">
              <select
                value={groupId}
                onChange={(e) => { setGroupId(e.target.value); setProjectId(""); }}
              >
                <option value="">{t.none}</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="form-inline-add"
                onClick={() => { setInlineCreate("group"); setInlineGroupId(""); }}
                title={t.groupCreate}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.project}</label>
            <div className="form-select-with-add">
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">{t.none}</option>
                {filteredProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="form-inline-add"
                onClick={() => { setInlineCreate("project"); setInlineGroupId(groupId); }}
                title={t.projectCreate}
              >
                +
              </button>
            </div>
          </div>

          {buckets.length > 0 && (
            <div className="form-group">
              <label className="form-label">{t.bucket}</label>
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
            <label className="form-label">{t.memo}</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder={t.memoPlaceholder}
            />
          </div>

          <div className="form-actions">
            <button onClick={handleSave} disabled={!title.trim()}>
              {isCreate ? t.create : t.save}
            </button>
            <button className="btn-secondary" onClick={onClose}>{t.cancel}</button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
