import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import { priorityOrder } from "../domain/task";
import { listTasks, toggleDone, softDeleteTask } from "../db/tasksRepo";
import { getDueBucket, DUE_BUCKET_LABELS, type DueBucket } from "../utils/dateBuckets";
import type { Group, Project, Bucket } from "../domain/master";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import { ensureNextInstanceForAllActiveTemplates } from "../utils/recurrenceEngine";
import { TaskRow } from "../components/TaskRow";
import { KebabMenu, type KebabItem } from "../components/KebabMenu";
import { TaskDrawer } from "../components/TaskDrawer";

type SortKey = "dueDate" | "priority" | "updatedAt";

// TaskDrawer state: null=closed, undefined=create, Task=edit
type TaskDrawerState = Task | null | undefined;

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

const VALID_STATUSES = new Set<string>(["todo", "in_progress", "done"]);
const VALID_PRIORITIES = new Set<string>(["high", "med", "low"]);
const VALID_DUE_BUCKETS = new Set<string>(["overdue", "today", "thisWeek", "thisMonth"]);

export function TasksPage() {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  const [taskDrawerState, setTaskDrawerState] = useState<TaskDrawerState>(null);

  const qStatus = searchParams.get("status");
  const qPriority = searchParams.get("priority");
  const qDue = searchParams.get("due");
  const qGroupId = searchParams.get("groupId");

  const hasQueryFilter = !!(qStatus || qPriority || qDue || qGroupId);

  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">(
    qStatus && VALID_STATUSES.has(qStatus) ? (qStatus as TaskStatus) : "all",
  );
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">(
    qPriority && VALID_PRIORITIES.has(qPriority) ? (qPriority as TaskPriority) : "all",
  );
  const [filterDueBucket, setFilterDueBucket] = useState<DueBucket | "all">(
    qDue && VALID_DUE_BUCKETS.has(qDue) ? (qDue as DueBucket) : "all",
  );
  const [filterGroupId, setFilterGroupId] = useState<string>(qGroupId ?? "all");
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [filterBucketId, setFilterBucketId] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");

  const [showFilter, setShowFilter] = useState(hasQueryFilter);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const load = () => {
    listTasks().then(setTasks);
    listGroups().then(setGroups);
    listProjects().then(setProjects);
    listBuckets().then(setBuckets);
  };

  useEffect(() => {
    ensureNextInstanceForAllActiveTemplates().then(() => load());
  }, []);

  const filtered = useMemo(() => {
    let result = tasks;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.memo && t.memo.toLowerCase().includes(q)),
      );
    }
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (filterDueBucket !== "all") {
      result = result.filter((t) => getDueBucket(t.dueDate) === filterDueBucket);
    }
    if (filterGroupId !== "all") {
      result = result.filter((t) => t.groupId === filterGroupId);
    }
    if (filterProjectId !== "all") {
      result = result.filter((t) => t.projectId === filterProjectId);
    }
    if (filterBucketId !== "all") {
      result = result.filter((t) => t.bucketIds.includes(filterBucketId));
    }
    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority, filterDueBucket, filterGroupId, filterProjectId, filterBucketId]);

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

  const groupName = (gid: string | null) => groups.find((g) => g.id === gid)?.name;
  const projectName = (pid: string | null) => projects.find((p) => p.id === pid)?.name;
  const bucketName = (bid: string) => buckets.find((b) => b.id === bid)?.name ?? bid;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Keyboard: "/" to focus search, Esc to clear/blur
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const inInput = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;

      if (e.key === "/" && !inInput) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        if (searchQuery) {
          setSearchQuery("");
        } else {
          searchRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchQuery]);

  return (
    <div>
      {/* Search */}
      <div className="focus-search" style={{ marginBottom: "0.75rem" }}>
        <input
          ref={searchRef}
          type="text"
          className="focus-search-input"
          placeholder="タイトル・メモで検索 ( / )"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="focus-search-clear"
            onClick={() => {
              setSearchQuery("");
              searchRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Filter toggle + new */}
      <div className="planning-toolbar">
        <button
          className={`btn-sm ${showFilter ? "btn-secondary" : "btn-ghost"}`}
          onClick={() => setShowFilter((v) => !v)}
        >
          {showFilter ? "フィルタを隠す" : "詳細フィルタ"}
        </button>
        <button
          className="btn-sm"
          onClick={() => setTaskDrawerState(undefined)}
          style={{ marginLeft: "0.5rem" }}
        >
          + 新規作成
        </button>
        <div className="filter-item" style={{ marginLeft: "auto" }}>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="dueDate">期限昇順</option>
            <option value="priority">優先度降順</option>
            <option value="updatedAt">更新日降順</option>
          </select>
        </div>
      </div>

      {/* Collapsible filter bar */}
      {showFilter && (
        <div className="filter-bar">
          <div className="filter-item">
            <span className="filter-label">状態</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}
            >
              <option value="all">すべて</option>
              {(["todo", "in_progress", "done"] as const).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">優先度</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "all")}
            >
              <option value="all">すべて</option>
              {(["high", "med", "low"] as const).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">期限</span>
            <select
              value={filterDueBucket}
              onChange={(e) => setFilterDueBucket(e.target.value as DueBucket | "all")}
            >
              <option value="all">すべて</option>
              {(["overdue", "today", "thisWeek", "thisMonth"] as const).map((b) => (
                <option key={b} value={b}>{DUE_BUCKET_LABELS[b]}</option>
              ))}
            </select>
          </div>

          {groups.length > 0 && (
            <div className="filter-item">
              <span className="filter-label">グループ</span>
              <select
                value={filterGroupId}
                onChange={(e) => {
                  setFilterGroupId(e.target.value);
                  setFilterProjectId("all");
                }}
              >
                <option value="all">すべて</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {projects.length > 0 && (
            <div className="filter-item">
              <span className="filter-label">プロジェクト</span>
              <select
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
              >
                <option value="all">すべて</option>
                {(filterGroupId !== "all"
                  ? projects.filter((p) => p.groupId === filterGroupId)
                  : projects
                ).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {buckets.length > 0 && (
            <div className="filter-item">
              <span className="filter-label">Bucket</span>
              <select
                value={filterBucketId}
                onChange={(e) => setFilterBucketId(e.target.value)}
              >
                <option value="all">すべて</option>
                {buckets.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>タスクがありません</p>
          <button onClick={() => setTaskDrawerState(undefined)} style={{ marginTop: "0.75rem" }}>
            + 最初のタスクを作成
          </button>
        </div>
      ) : (
        <div className="task-list">
          {sorted.map((task) => {
            const bucket = getDueBucket(task.dueDate);
            const isExpanded = expandedId === task.id;

            const kebabItems: KebabItem[] = [
              { label: "編集", onClick: () => setTaskDrawerState(task) },
              { label: "削除", danger: true, onClick: () => handleDelete(task.id) },
            ];

            return (
              <div key={task.id} className="task-card">
                <TaskRow
                  task={task}
                  onToggleDone={handleToggleDone}
                  onClickTitle={() => toggleExpand(task.id)}
                  extra={<KebabMenu items={kebabItems} />}
                />

                {/* Expanded details */}
                {isExpanded && (
                  <div className="task-detail">
                    <div className="task-meta">
                      <span className={`badge badge-priority-${task.priority}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <span className="badge badge-status">
                        {STATUS_LABELS[task.status]}
                      </span>
                      {task.dueDate && bucket && (
                        <span className={`badge badge-due ${bucket === "overdue" ? "badge-overdue" : ""}`}>
                          {DUE_BUCKET_LABELS[bucket]}
                        </span>
                      )}
                      {task.groupId && groupName(task.groupId) && (
                        <span className="badge badge-master">{groupName(task.groupId)}</span>
                      )}
                      {task.projectId && projectName(task.projectId) && (
                        <span className="badge badge-master">{projectName(task.projectId)}</span>
                      )}
                      {task.bucketIds.map((bid) => (
                        <span key={bid} className="badge badge-bucket">{bucketName(bid)}</span>
                      ))}
                      {task.recurrenceTemplateId && (
                        <span className="badge badge-recurrence">繰り返し</span>
                      )}
                    </div>
                    {task.memo && (
                      <p className="task-detail-memo">{task.memo}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task Drawer (create/edit) */}
      <TaskDrawer
        task={taskDrawerState}
        onClose={() => setTaskDrawerState(null)}
        onSaved={load}
      />
    </div>
  );
}
