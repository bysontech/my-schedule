import { useState, useEffect } from "react";
import type { Group, Project, Bucket } from "../domain/master";
import { upsertGroup } from "../db/groupsRepo";
import { upsertProject } from "../db/projectsRepo";
import { upsertBucket } from "../db/bucketsRepo";
import { listGroups } from "../db/groupsRepo";
import { Drawer } from "./Drawer";

type MasterType = "group" | "project" | "bucket";

interface MasterDrawerProps {
  /** null = closed */
  open: { type: MasterType; item?: Group | Project | Bucket } | null;
  onClose: () => void;
  onSaved: () => void;
}

export function MasterDrawer({ open, onClose, onSaved }: MasterDrawerProps) {
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [nameError, setNameError] = useState(false);

  const isCreate = open ? !open.item : true;
  const masterType = open?.type ?? "group";

  useEffect(() => {
    if (!open) return;
    if (open.item) {
      setName(open.item.name);
      if (open.type === "project") {
        setGroupId((open.item as Project).groupId ?? "");
      }
    } else {
      setName("");
      setGroupId("");
    }
    setNameError(false);
    if (open.type === "project") {
      listGroups().then(setGroups);
    }
  }, [open]);

  const typeLabel = masterType === "group" ? "グループ"
    : masterType === "project" ? "プロジェクト"
    : "Bucket";

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      return;
    }
    const now = new Date().toISOString();

    if (masterType === "group") {
      const existing = open?.item as Group | undefined;
      await upsertGroup({
        id: existing?.id ?? crypto.randomUUID(),
        name: trimmed,
        createdAt: existing?.createdAt ?? now,
      });
    } else if (masterType === "project") {
      const existing = open?.item as Project | undefined;
      await upsertProject({
        id: existing?.id ?? crypto.randomUUID(),
        name: trimmed,
        groupId: groupId || null,
        createdAt: existing?.createdAt ?? now,
      });
    } else {
      const existing = open?.item as Bucket | undefined;
      await upsertBucket({
        id: existing?.id ?? crypto.randomUUID(),
        name: trimmed,
        createdAt: existing?.createdAt ?? now,
      });
    }

    onSaved();
    onClose();
  };

  return (
    <Drawer
      open={!!open}
      onClose={onClose}
      title={`${typeLabel}${isCreate ? "作成" : "編集"}`}
    >
      <div className="drawer-form">
        <div className="form-group">
          <label className="form-label">{typeLabel}名 <span className="form-required">*</span></label>
          <input
            type="text"
            value={name}
            className={nameError ? "input-error" : ""}
            placeholder={`${typeLabel}名を入力`}
            onChange={(e) => { setName(e.target.value); setNameError(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          {nameError && <p className="form-error">名前は必須です</p>}
        </div>

        {masterType === "project" && (
          <div className="form-group">
            <label className="form-label">所属グループ</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">なし</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-actions">
          <button onClick={handleSave} disabled={!name.trim()}>
            {isCreate ? "作成" : "保存"}
          </button>
          <button className="btn-secondary" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </Drawer>
  );
}
