import { useState, useEffect, useMemo } from "react";
import type { Task } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import { listTasks } from "../db/tasksRepo";
import { listGroups, upsertGroup, deleteGroup } from "../db/groupsRepo";
import { listProjects, upsertProject, deleteProject } from "../db/projectsRepo";
import { listBuckets, upsertBucket, deleteBucket } from "../db/bucketsRepo";
import { KebabMenu } from "../components/KebabMenu";

type MasterTab = "group" | "project" | "bucket";

// ── Shared inline-edit row ──

interface MasterRowProps {
  name: string;
  sub?: string | null;
  count: number;
  editingId: string | null;
  id: string;
  editingName: string;
  onStartEdit: () => void;
  onEditChange: (v: string) => void;
  onEditConfirm: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
}

function MasterRow({
  name, sub, count, editingId, id, editingName,
  onStartEdit, onEditChange, onEditConfirm, onEditCancel, onDelete,
}: MasterRowProps) {
  return (
    <div className="master-item">
      {editingId === id ? (
        <input
          type="text"
          className="master-item-edit"
          value={editingName}
          autoFocus
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onEditConfirm();
            }
            if (e.key === "Escape") onEditCancel();
          }}
          onBlur={onEditConfirm}
        />
      ) : (
        <span
          className="master-item-name"
          onClick={onStartEdit}
          title="クリックで編集"
        >
          {name}
          {sub && <span className="master-item-sub">{sub}</span>}
        </span>
      )}
      <span className="master-item-count">({count})</span>
      <KebabMenu items={[
        { label: "名前を編集", onClick: onStartEdit },
        { label: "削除", danger: true, onClick: onDelete },
      ]} />
    </div>
  );
}

// ── Page ──

export function MastersPage() {
  const [tab, setTab] = useState<MasterTab>("group");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  // Inline-edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Add form
  const [newName, setNewName] = useState("");
  const [newGroupId, setNewGroupId] = useState("");

  const load = () => {
    listTasks().then(setTasks);
    listGroups().then(setGroups);
    listProjects().then(setProjects);
    listBuckets().then(setBuckets);
  };
  useEffect(() => { load(); }, []);

  // Related task counts
  const groupCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tasks) {
      if (t.groupId) m.set(t.groupId, (m.get(t.groupId) ?? 0) + 1);
    }
    return m;
  }, [tasks]);

  const projectCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tasks) {
      if (t.projectId) m.set(t.projectId, (m.get(t.projectId) ?? 0) + 1);
    }
    return m;
  }, [tasks]);

  const bucketCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tasks) {
      for (const bid of t.bucketIds) {
        m.set(bid, (m.get(bid) ?? 0) + 1);
      }
    }
    return m;
  }, [tasks]);

  const groupName = (gid: string | null) =>
    groups.find((g) => g.id === gid)?.name ?? null;

  // ── Handlers ──

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const now = new Date().toISOString();

    if (tab === "group") {
      await upsertGroup({ id: crypto.randomUUID(), name, createdAt: now });
    } else if (tab === "project") {
      await upsertProject({ id: crypto.randomUUID(), name, groupId: newGroupId || null, createdAt: now });
    } else {
      await upsertBucket({ id: crypto.randomUUID(), name, createdAt: now });
    }
    setNewName("");
    setNewGroupId("");
    load();
  };

  const handleRenameGroup = async (g: Group) => {
    const name = editingName.trim();
    if (name && name !== g.name) await upsertGroup({ ...g, name });
    setEditingId(null);
    load();
  };

  const handleRenameProject = async (p: Project) => {
    const name = editingName.trim();
    if (name && name !== p.name) await upsertProject({ ...p, name });
    setEditingId(null);
    load();
  };

  const handleRenameBucket = async (b: Bucket) => {
    const name = editingName.trim();
    if (name && name !== b.name) await upsertBucket({ ...b, name });
    setEditingId(null);
    load();
  };

  return (
    <div className="masters-page">
      {/* Tab bar */}
      <div className="masters-tabs">
        {([
          ["group", "グループ"],
          ["project", "プロジェクト"],
          ["bucket", "Bucket"],
        ] as [MasterTab, string][]).map(([key, label]) => (
          <button
            key={key}
            className={`masters-tab ${tab === key ? "masters-tab--active" : ""}`}
            onClick={() => { setTab(key); setEditingId(null); setNewName(""); }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add form */}
      <div className="masters-section">
        <div className="masters-add-form">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={
              tab === "group" ? "グループ名" :
              tab === "project" ? "プロジェクト名" : "分類名"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          {tab === "project" && (
            <select value={newGroupId} onChange={(e) => setNewGroupId(e.target.value)}>
              <option value="">所属グループ（なし）</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}
          <button onClick={handleAdd} className="btn-sm">+ 追加</button>
        </div>

        {/* List */}
        <div className="masters-list">
          {tab === "group" && (
            groups.length === 0
              ? <p className="master-empty">グループがありません</p>
              : groups.map((g) => (
                <MasterRow
                  key={g.id}
                  id={g.id}
                  name={g.name}
                  count={groupCounts.get(g.id) ?? 0}
                  editingId={editingId}
                  editingName={editingName}
                  onStartEdit={() => { setEditingId(g.id); setEditingName(g.name); }}
                  onEditChange={setEditingName}
                  onEditConfirm={() => handleRenameGroup(g)}
                  onEditCancel={() => setEditingId(null)}
                  onDelete={() => deleteGroup(g.id).then(load)}
                />
              ))
          )}

          {tab === "project" && (
            projects.length === 0
              ? <p className="master-empty">プロジェクトがありません</p>
              : projects.map((p) => (
                <MasterRow
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  sub={groupName(p.groupId)}
                  count={projectCounts.get(p.id) ?? 0}
                  editingId={editingId}
                  editingName={editingName}
                  onStartEdit={() => { setEditingId(p.id); setEditingName(p.name); }}
                  onEditChange={setEditingName}
                  onEditConfirm={() => handleRenameProject(p)}
                  onEditCancel={() => setEditingId(null)}
                  onDelete={() => deleteProject(p.id).then(load)}
                />
              ))
          )}

          {tab === "bucket" && (
            buckets.length === 0
              ? <p className="master-empty">Bucketがありません</p>
              : buckets.map((b) => (
                <MasterRow
                  key={b.id}
                  id={b.id}
                  name={b.name}
                  count={bucketCounts.get(b.id) ?? 0}
                  editingId={editingId}
                  editingName={editingName}
                  onStartEdit={() => { setEditingId(b.id); setEditingName(b.name); }}
                  onEditChange={setEditingName}
                  onEditConfirm={() => handleRenameBucket(b)}
                  onEditCancel={() => setEditingId(null)}
                  onDelete={() => deleteBucket(b.id).then(load)}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
