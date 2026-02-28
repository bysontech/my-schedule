import { useState, useEffect } from "react";
import type { RecurrenceTemplate, RecurrenceType } from "../domain/recurrence";
import { WEEKDAY_LABELS, describeRecurrence } from "../domain/recurrence";
import type { TaskPriority } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import { listAllTemplates, upsertTemplate, deleteTemplate } from "../db/recurrenceRepo";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import { KebabMenu } from "../components/KebabMenu";
import { Drawer } from "../components/Drawer";

const PRIORITY_LABELS: Record<TaskPriority, string> = { high: "High", med: "Med", low: "Low" };

function emptyForm() {
  return {
    title: "",
    memo: "",
    priority: "med" as TaskPriority,
    recurrenceType: "weekly" as RecurrenceType,
    recurrenceValue: 1, // 月曜
    recurrenceNthWeek: 1,
    groupId: "",
    projectId: "",
    bucketIds: [] as string[],
  };
}

export function RecurrenceTemplatesPage() {
  const [templates, setTemplates] = useState<RecurrenceTemplate[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [titleError, setTitleError] = useState(false);

  const load = () => {
    listAllTemplates().then(setTemplates);
    listGroups().then(setGroups);
    listProjects().then(setProjects);
    listBuckets().then(setBuckets);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setTitleError(false);
    setDrawerOpen(true);
  };

  const openEdit = (t: RecurrenceTemplate) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      memo: t.memo ?? "",
      priority: t.priority,
      recurrenceType: t.recurrenceType,
      recurrenceValue: t.recurrenceValue,
      recurrenceNthWeek: t.recurrenceNthWeek ?? 1,
      groupId: t.groupId ?? "",
      projectId: t.projectId ?? "",
      bucketIds: [...t.bucketIds],
    });
    setTitleError(false);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setTitleError(true);
      return;
    }
    const now = new Date().toISOString();
    const existing = editingId ? templates.find((t) => t.id === editingId) : null;

    const tmpl: RecurrenceTemplate = {
      id: existing?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      memo: form.memo.trim() || null,
      priority: form.priority,
      recurrenceType: form.recurrenceType,
      recurrenceValue: form.recurrenceValue,
      recurrenceNthWeek: form.recurrenceType === "monthly_nth" ? form.recurrenceNthWeek : null,
      groupId: form.groupId || null,
      projectId: form.projectId || null,
      bucketIds: form.bucketIds,
      isActive: existing?.isActive ?? true,
      lastGeneratedDate: existing?.lastGeneratedDate ?? null,
      createdAt: existing?.createdAt ?? now,
    };

    await upsertTemplate(tmpl);
    setDrawerOpen(false);
    load();
  };

  const handleToggleActive = async (t: RecurrenceTemplate) => {
    await upsertTemplate({ ...t, isActive: !t.isActive });
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    load();
  };

  const toggleBucket = (bid: string) => {
    setForm((prev) => ({
      ...prev,
      bucketIds: prev.bucketIds.includes(bid)
        ? prev.bucketIds.filter((b) => b !== bid)
        : [...prev.bucketIds, bid],
    }));
  };

  const filteredProjects = form.groupId
    ? projects.filter((p) => p.groupId === form.groupId)
    : projects;

  return (
    <div className="repeat-page">
      <div className="repeat-header">
        <h2 className="dash-section-title" style={{ margin: 0 }}>繰り返しテンプレート</h2>
        <button className="btn-sm" onClick={openNew}>+ 新規作成</button>
      </div>

      {/* Template list */}
      {templates.length === 0 && (
        <div className="empty-state">
          <p>繰り返しテンプレートがありません</p>
        </div>
      )}

      {templates.length > 0 && (
        <div className="repeat-list">
          {templates.map((t) => (
            <div key={t.id} className={`repeat-row ${!t.isActive ? "repeat-row--inactive" : ""}`}>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={t.isActive}
                onChange={() => handleToggleActive(t)}
                title={t.isActive ? "無効にする" : "有効にする"}
              />
              <div className="repeat-row-body" onClick={() => openEdit(t)}>
                <span className={`repeat-row-title ${!t.isActive ? "repeat-row-title--inactive" : ""}`}>
                  {t.title}
                </span>
                <div className="repeat-row-meta">
                  <span className="badge badge-recurrence">{describeRecurrence(t)}</span>
                  <span className={`badge badge-priority-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                </div>
              </div>
              <KebabMenu items={[
                { label: "編集", onClick: () => openEdit(t) },
                { label: "削除", danger: true, onClick: () => handleDelete(t.id) },
              ]} />
            </div>
          ))}
        </div>
      )}

      {/* Edit / New Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "テンプレ編集" : "テンプレ作成"}
      >
        <div className="repeat-form">
          <div className="form-group">
            <label className="form-label">タイトル <span className="form-required">*</span></label>
            <input
              type="text"
              value={form.title}
              className={titleError ? "input-error" : ""}
              placeholder="繰り返しタスク名"
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setTitleError(false); }}
            />
            {titleError && <p className="form-error">タイトルは必須です</p>}
          </div>

          <div className="form-group">
            <label className="form-label">繰り返し種別</label>
            <select
              value={form.recurrenceType}
              onChange={(e) => setForm({ ...form, recurrenceType: e.target.value as RecurrenceType })}
            >
              <option value="weekly">毎週</option>
              <option value="monthly_date">毎月（日付指定）</option>
              <option value="monthly_nth">毎月（第N曜日）</option>
            </select>
          </div>

          {form.recurrenceType === "weekly" && (
            <div className="form-group">
              <label className="form-label">曜日</label>
              <select
                value={form.recurrenceValue}
                onChange={(e) => setForm({ ...form, recurrenceValue: Number(e.target.value) })}
              >
                {WEEKDAY_LABELS.map((label, i) => (
                  <option key={i} value={i}>{label}曜日</option>
                ))}
              </select>
            </div>
          )}

          {form.recurrenceType === "monthly_date" && (
            <div className="form-group">
              <label className="form-label">日（1-31）</label>
              <input
                type="number"
                min={1}
                max={31}
                value={form.recurrenceValue}
                onChange={(e) => setForm({ ...form, recurrenceValue: Number(e.target.value) })}
              />
            </div>
          )}

          {form.recurrenceType === "monthly_nth" && (
            <>
              <div className="form-group">
                <label className="form-label">第N</label>
                <select
                  value={form.recurrenceNthWeek}
                  onChange={(e) => setForm({ ...form, recurrenceNthWeek: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>第{n}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">曜日</label>
                <select
                  value={form.recurrenceValue}
                  onChange={(e) => setForm({ ...form, recurrenceValue: Number(e.target.value) })}
                >
                  {WEEKDAY_LABELS.map((label, i) => (
                    <option key={i} value={i}>{label}曜日</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">優先度</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
            >
              <option value="high">High</option>
              <option value="med">Med</option>
              <option value="low">Low</option>
            </select>
          </div>

          {groups.length > 0 && (
            <div className="form-group">
              <label className="form-label">グループ</label>
              <select
                value={form.groupId}
                onChange={(e) => setForm({ ...form, groupId: e.target.value, projectId: "" })}
              >
                <option value="">なし</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          {projects.length > 0 && (
            <div className="form-group">
              <label className="form-label">プロジェクト</label>
              <select
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">なし</option>
                {filteredProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {buckets.length > 0 && (
            <div className="form-group">
              <label className="form-label">自由分類 (Bucket)</label>
              <div className="bucket-checks">
                {buckets.map((b) => {
                  const checked = form.bucketIds.includes(b.id);
                  return (
                    <label key={b.id} className={`bucket-check-label ${checked ? "bucket-check-label--checked" : ""}`}>
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
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={2}
              placeholder="メモ（任意）"
            />
          </div>

          <div className="form-actions">
            <button onClick={handleSave}>保存</button>
            <button className="btn-secondary" onClick={() => setDrawerOpen(false)}>キャンセル</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
