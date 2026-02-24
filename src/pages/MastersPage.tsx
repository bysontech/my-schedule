import { useState, useEffect } from "react";
import type { Group, Project, Bucket } from "../domain/master";
import { listGroups, upsertGroup, deleteGroup } from "../db/groupsRepo";
import { listProjects, upsertProject, deleteProject } from "../db/projectsRepo";
import { listBuckets, upsertBucket, deleteBucket } from "../db/bucketsRepo";

// ── Groups ──────────────────────────────────────────────────

function GroupsSection() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = () => listGroups().then(setGroups);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    await upsertGroup({ id: crypto.randomUUID(), name, createdAt: now });
    setNewName("");
    load();
  };

  const handleRename = async (g: Group) => {
    const name = editingName.trim();
    if (name && name !== g.name) {
      await upsertGroup({ ...g, name });
    }
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteGroup(id);
    load();
  };

  return (
    <section className="masters-section">
      <div className="masters-section-header">
        <h2 className="masters-section-title">グループ</h2>
      </div>
      <div className="masters-add-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="グループ名"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd} className="btn-sm">追加</button>
      </div>
      <div className="masters-list">
        {groups.length === 0 && <p className="master-empty">グループがありません</p>}
        {groups.map((g) => (
          <div key={g.id} className="master-item">
            {editingId === g.id ? (
              <>
                <input
                  type="text"
                  className="master-item-edit"
                  value={editingName}
                  autoFocus
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(g);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => handleRename(g)}
                />
              </>
            ) : (
              <span
                className="master-item-name"
                onClick={() => { setEditingId(g.id); setEditingName(g.name); }}
                title="クリックで編集"
              >
                {g.name}
              </span>
            )}
            <button className="btn-sm btn-danger" onClick={() => handleDelete(g.id)}>削除</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Projects ──────────────────────────────────────────────────

function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newName, setNewName] = useState("");
  const [newGroupId, setNewGroupId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = () => {
    listProjects().then(setProjects);
    listGroups().then(setGroups);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    await upsertProject({
      id: crypto.randomUUID(),
      name,
      groupId: newGroupId || null,
      createdAt: now,
    });
    setNewName("");
    setNewGroupId("");
    load();
  };

  const handleRename = async (p: Project) => {
    const name = editingName.trim();
    if (name && name !== p.name) {
      await upsertProject({ ...p, name });
    }
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    load();
  };

  const groupName = (gid: string | null) =>
    groups.find((g) => g.id === gid)?.name ?? null;

  return (
    <section className="masters-section">
      <div className="masters-section-header">
        <h2 className="masters-section-title">プロジェクト</h2>
      </div>
      <div className="masters-add-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="プロジェクト名"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <select value={newGroupId} onChange={(e) => setNewGroupId(e.target.value)}>
          <option value="">グループなし</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <button onClick={handleAdd} className="btn-sm">追加</button>
      </div>
      <div className="masters-list">
        {projects.length === 0 && <p className="master-empty">プロジェクトがありません</p>}
        {projects.map((p) => (
          <div key={p.id} className="master-item">
            {editingId === p.id ? (
              <input
                type="text"
                className="master-item-edit"
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(p);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onBlur={() => handleRename(p)}
              />
            ) : (
              <span
                className="master-item-name"
                onClick={() => { setEditingId(p.id); setEditingName(p.name); }}
                title="クリックで編集"
              >
                {p.name}
                {p.groupId && (
                  <span className="master-item-sub">{groupName(p.groupId)}</span>
                )}
              </span>
            )}
            <button className="btn-sm btn-danger" onClick={() => handleDelete(p.id)}>削除</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Buckets ──────────────────────────────────────────────────

function BucketsSection() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = () => listBuckets().then(setBuckets);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const now = new Date().toISOString();
    await upsertBucket({ id: crypto.randomUUID(), name, createdAt: now });
    setNewName("");
    load();
  };

  const handleRename = async (b: Bucket) => {
    const name = editingName.trim();
    if (name && name !== b.name) {
      await upsertBucket({ ...b, name });
    }
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteBucket(id);
    load();
  };

  return (
    <section className="masters-section">
      <div className="masters-section-header">
        <h2 className="masters-section-title">自由分類 (Bucket)</h2>
      </div>
      <div className="masters-add-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="分類名"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd} className="btn-sm">追加</button>
      </div>
      <div className="masters-list">
        {buckets.length === 0 && <p className="master-empty">Bucketがありません</p>}
        {buckets.map((b) => (
          <div key={b.id} className="master-item">
            {editingId === b.id ? (
              <input
                type="text"
                className="master-item-edit"
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(b);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onBlur={() => handleRename(b)}
              />
            ) : (
              <span
                className="master-item-name"
                onClick={() => { setEditingId(b.id); setEditingName(b.name); }}
                title="クリックで編集"
              >
                {b.name}
              </span>
            )}
            <button className="btn-sm btn-danger" onClick={() => handleDelete(b.id)}>削除</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────

export function MastersPage() {
  return (
    <div className="masters-page">
      <GroupsSection />
      <ProjectsSection />
      <BucketsSection />
    </div>
  );
}
