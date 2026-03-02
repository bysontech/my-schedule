import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import { listTasks, upsertTask, softDeleteTask } from "../db/tasksRepo";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import { KebabMenu } from "../components/KebabMenu";
import { TaskDrawer } from "../components/TaskDrawer";
import { MasterDrawer } from "../components/MasterDrawer";
import { Toast } from "../components/Toast";

type PeriodFilter = "all" | "week" | "month";

/** Get Monday-start week range for today */
function getWeekRange(): [string, string] {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return [fmt(mon), fmt(sun)];
}

function getMonthRange(): [string, string] {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return [fmt(first), fmt(last)];
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function WorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [filterBucketId, setFilterBucketId] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<PeriodFilter>("all");

  // Drawers
  const [taskDrawer, setTaskDrawer] = useState<Task | null | undefined>(null);
  const [taskDrawerGroupId, setTaskDrawerGroupId] = useState<string | undefined>();
  const [masterDrawer, setMasterDrawer] = useState<{ type: "group"; item?: Group } | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // D&D state
  const dragTaskId = useRef<string | null>(null);
  const dragSourceGroupId = useRef<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const [t, g, p, b] = await Promise.all([
      listTasks(), listGroups(), listProjects(), listBuckets(),
    ]);
    setTasks(t);
    setGroups(g);
    setProjects(p);
    setBuckets(b);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filterProjectId !== "all") {
      result = result.filter((t) => t.projectId === filterProjectId);
    }
    if (filterBucketId !== "all") {
      result = result.filter((t) => t.bucketIds.includes(filterBucketId));
    }
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }
    if (filterPeriod === "week") {
      const [start, end] = getWeekRange();
      result = result.filter((t) => t.dueDate != null && t.dueDate >= start && t.dueDate <= end);
    } else if (filterPeriod === "month") {
      const [start, end] = getMonthRange();
      result = result.filter((t) => t.dueDate != null && t.dueDate >= start && t.dueDate <= end);
    }

    return result;
  }, [tasks, filterProjectId, filterBucketId, filterPriority, filterStatus, filterPeriod]);

  // Group tasks into columns
  const columns = useMemo(() => {
    const groupMap = new Map<string | null, Task[]>();
    // Init with null (uncategorized) + all groups
    groupMap.set(null, []);
    for (const g of groups) {
      groupMap.set(g.id, []);
    }
    for (const t of filteredTasks) {
      const key = t.groupId;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(t);
    }
    return groupMap;
  }, [filteredTasks, groups]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filterProjectId !== "all") c++;
    if (filterBucketId !== "all") c++;
    if (filterPriority !== "all") c++;
    if (filterStatus !== "all") c++;
    if (filterPeriod !== "all") c++;
    return c;
  }, [filterProjectId, filterBucketId, filterPriority, filterStatus, filterPeriod]);

  // --- D&D handlers ---
  const handleDragStart = (taskId: string, sourceGroupId: string | null) => {
    dragTaskId.current = taskId;
    dragSourceGroupId.current = sourceGroupId;
  };

  const handleDragOver = (e: React.DragEvent, groupId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroupId(groupId);
  };

  const handleDragLeave = (e: React.DragEvent, groupId: string | null) => {
    // Only clear if leaving the column (not entering a child)
    const related = e.relatedTarget as Node | null;
    const current = e.currentTarget as Node;
    if (related && current.contains(related)) return;
    if (dragOverGroupId === groupId) {
      setDragOverGroupId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetGroupId: string | null) => {
    e.preventDefault();
    setDragOverGroupId(null);

    const taskId = dragTaskId.current;
    const sourceGroupId = dragSourceGroupId.current;
    dragTaskId.current = null;
    dragSourceGroupId.current = null;

    if (!taskId) return;
    // Same group → no-op
    if (sourceGroupId === targetGroupId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, groupId: targetGroupId } : t)),
    );

    try {
      await upsertTask({ ...task, groupId: targetGroupId });
    } catch {
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, groupId: sourceGroupId } : t)),
      );
      setToast("移動に失敗しました。元に戻しました。");
    }
  };

  const handleDragEnd = () => {
    dragTaskId.current = null;
    dragSourceGroupId.current = null;
    setDragOverGroupId(null);
  };

  // --- Task actions ---
  const handleCreateTask = (groupId: string | null) => {
    setTaskDrawerGroupId(groupId ?? undefined);
    setTaskDrawer(undefined); // create mode
  };

  const handleEditTask = (task: Task) => {
    setTaskDrawerGroupId(undefined);
    setTaskDrawer(task); // edit mode
  };

  const handleDeleteTask = async (task: Task) => {
    await softDeleteTask(task.id);
    await reload();
  };

  const handleEditGroup = (group: Group) => {
    setMasterDrawer({ type: "group", item: group });
  };

  // Column key helper
  const groupName = (gId: string | null) => {
    if (gId === null) return "未分類";
    return groups.find((g) => g.id === gId)?.name ?? "不明";
  };

  const todayStr = fmt(new Date());

  return (
    <div className="ws-page">
      {/* Toolbar */}
      <div className="ws-toolbar">
        <button
          className={`btn-sm ${showFilters ? "btn-secondary" : "btn-ghost"}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          フィルタ {activeFilterCount > 0 && <span className="ws-filter-badge">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="filter-bar">
          <div className="filter-item">
            <label className="filter-label">プロジェクト</label>
            <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)}>
              <option value="all">すべて</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">Bucket</label>
            <select value={filterBucketId} onChange={(e) => setFilterBucketId(e.target.value)}>
              <option value="all">すべて</option>
              {buckets.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">優先度</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "all")}>
              <option value="all">すべて</option>
              <option value="high">High</option>
              <option value="med">Med</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">状態</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}>
              <option value="all">すべて</option>
              <option value="todo">未着手</option>
              <option value="in_progress">進行中</option>
              <option value="done">完了</option>
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">期間</label>
            <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value as PeriodFilter)}>
              <option value="all">すべて</option>
              <option value="week">今週</option>
              <option value="month">今月</option>
            </select>
          </div>
        </div>
      )}

      {/* Columns */}
      <div className="ws-board">
        {Array.from(columns.entries()).map(([gId, columnTasks]) => {
          const isDragOver = dragOverGroupId === gId;
          const group = gId !== null ? groups.find((g) => g.id === gId) : null;

          return (
            <div
              key={gId ?? "__uncategorized"}
              className={`ws-col ${isDragOver ? "ws-col--drag-over" : ""}`}
              onDragOver={(e) => handleDragOver(e, gId)}
              onDragLeave={(e) => handleDragLeave(e, gId)}
              onDrop={(e) => handleDrop(e, gId)}
            >
              {/* Column header */}
              <div className="ws-col-header">
                <span className="ws-col-name">{groupName(gId)}</span>
                <span className="ws-col-count">{columnTasks.length}</span>
                <div className="ws-col-actions">
                  <button
                    className="ws-col-add"
                    onClick={() => handleCreateTask(gId)}
                    title="タスク作成"
                  >
                    +
                  </button>
                  {group && (
                    <KebabMenu items={[
                      { label: "グループ編集", onClick: () => handleEditGroup(group) },
                    ]} />
                  )}
                </div>
              </div>

              {/* Task cards */}
              <div className="ws-col-body">
                {columnTasks.length === 0 && (
                  <div className="ws-col-empty">タスクなし</div>
                )}
                {columnTasks.map((task) => {
                  const isDone = task.status === "done";
                  const isOverdue = task.dueDate != null && task.dueDate < todayStr && !isDone;
                  const isToday = task.dueDate === todayStr;

                  return (
                    <div
                      key={task.id}
                      className={`ws-card ${isDone ? "ws-card--done" : ""}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        handleDragStart(task.id, task.groupId);
                      }}
                      onDragEnd={handleDragEnd}
                    >
                      <span className={`ws-card-pbar ws-card-pbar--${task.priority}`} />
                      <div className="ws-card-content">
                        <div className="ws-card-row">
                          <span
                            className={`ws-card-title ${isDone ? "ws-card-title--done" : ""}`}
                            role="button"
                            onClick={() => handleEditTask(task)}
                          >
                            {task.title}
                          </span>
                          <KebabMenu items={[
                            { label: "編集", onClick: () => handleEditTask(task) },
                            { label: "削除", danger: true, onClick: () => handleDeleteTask(task) },
                          ]} />
                        </div>
                        {task.dueDate && (
                          <span className={`ws-card-due ${isOverdue || isToday ? "ws-card-due--danger" : ""}`}>
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawers */}
      <TaskDrawer
        task={taskDrawer}
        defaultGroupId={taskDrawerGroupId}
        onClose={() => setTaskDrawer(null)}
        onSaved={reload}
      />

      <MasterDrawer
        open={masterDrawer}
        onClose={() => setMasterDrawer(null)}
        onSaved={reload}
      />

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
