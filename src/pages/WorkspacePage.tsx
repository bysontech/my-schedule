import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import { listTasks, upsertTask, softDeleteTask } from "../db/tasksRepo";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import { KebabMenu } from "../components/KebabMenu";
import { TaskDrawer } from "../components/TaskDrawer";
import { MasterDrawer } from "../components/MasterDrawer";
import { FabMenu } from "../components/FabMenu";
import { Toast } from "../components/Toast";

type ViewMode = "group_board" | "single_group" | "project_board";
type RangeFilter = "all" | "this_week" | "this_month" | "undone_only";

const VIEW_MODES: ViewMode[] = ["group_board", "single_group", "project_board"];
const RANGE_VALUES: RangeFilter[] = ["all", "this_week", "this_month", "undone_only"];

function isViewMode(v: string | null): v is ViewMode {
  return VIEW_MODES.includes(v as ViewMode);
}
function isRangeFilter(v: string | null): v is RangeFilter {
  return RANGE_VALUES.includes(v as RangeFilter);
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getWeekRange(): [string, string] {
  const now = new Date();
  const day = now.getDay();
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

export function WorkspacePage() {
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  // Read initial state from query params
  const qMode = searchParams.get("mode");
  const qRange = searchParams.get("range");
  const qGroupId = searchParams.get("groupId");
  const qProjectId = searchParams.get("projectId");

  const initialMode = isViewMode(qMode) ? qMode : "group_board";
  const initialRange = isRangeFilter(qRange) ? qRange : "all";

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  // Single-group/project selector — undefined means "not selected yet"
  const [singleId, setSingleId] = useState<string | undefined>(undefined);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterBucketId, setFilterBucketId] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>(initialRange);

  // Drawers
  const [taskDrawer, setTaskDrawer] = useState<Task | null | undefined>(null);
  const [taskDrawerGroupId, setTaskDrawerGroupId] = useState<string | undefined>();
  const [taskDrawerProjectId, setTaskDrawerProjectId] = useState<string | undefined>();
  const [masterDrawer, setMasterDrawer] = useState<{
    type: "group" | "project";
    item?: Group | Project;
  } | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // D&D state
  const dragTaskId = useRef<string | null>(null);
  const dragSourceColId = useRef<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | undefined>(undefined);

  // Track if query params have been applied
  const qApplied = useRef(false);

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

  // Apply query param groupId/projectId after data loads
  useEffect(() => {
    if (qApplied.current) return;
    if (groups.length === 0 && projects.length === 0) return;
    qApplied.current = true;

    if (initialMode === "group_board" && qGroupId) {
      // Switch to single_group mode with selected group
      setViewMode("single_group");
      const colKey = qGroupId === "__null__" ? "__null__" : qGroupId;
      setSingleId(colKey);
    } else if (initialMode === "single_group" && qGroupId) {
      const colKey = qGroupId === "__null__" ? "__null__" : qGroupId;
      setSingleId(colKey);
    } else if (initialMode === "project_board" && qProjectId) {
      // project_board doesn't have singleId selection but we keep viewMode
    }
  }, [groups, projects, initialMode, qGroupId, qProjectId]);

  // ---- Filtered tasks ----
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filterBucketId !== "all") {
      result = result.filter((t) => t.bucketIds.includes(filterBucketId));
    }
    if (filterPriority !== "all") {
      result = result.filter((t) => t.priority === filterPriority);
    }
    if (filterStatus !== "all") {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Range filter
    if (rangeFilter === "this_week") {
      const [start, end] = getWeekRange();
      result = result.filter((t) => t.dueDate != null && t.dueDate >= start && t.dueDate <= end);
    } else if (rangeFilter === "this_month") {
      const [start, end] = getMonthRange();
      result = result.filter((t) => t.dueDate != null && t.dueDate >= start && t.dueDate <= end);
    } else if (rangeFilter === "undone_only") {
      result = result.filter((t) => t.status !== "done");
    }

    return result;
  }, [tasks, filterBucketId, filterPriority, filterStatus, rangeFilter]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filterBucketId !== "all") c++;
    if (filterPriority !== "all") c++;
    if (filterStatus !== "all") c++;
    if (rangeFilter !== "all") c++;
    return c;
  }, [filterBucketId, filterPriority, filterStatus, rangeFilter]);

  // ---- Column computation based on viewMode ----
  const COL_NULL = "__null__";
  const toColKey = (id: string | null) => id ?? COL_NULL;
  const fromColKey = (key: string): string | null => (key === COL_NULL ? null : key);

  const columns = useMemo(() => {
    const map = new Map<string, Task[]>();

    if (viewMode === "group_board") {
      map.set(COL_NULL, []);
      for (const g of groups) map.set(g.id, []);
      for (const t of filteredTasks) {
        const key = toColKey(t.groupId);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(t);
      }
    } else if (viewMode === "single_group") {
      if (singleId !== undefined) {
        const gId = fromColKey(singleId);
        map.set(singleId, []);
        for (const t of filteredTasks) {
          if (t.groupId === gId) {
            map.get(singleId)!.push(t);
          }
        }
      }
    } else {
      // project_board
      map.set(COL_NULL, []);
      for (const p of projects) map.set(p.id, []);
      for (const t of filteredTasks) {
        const key = toColKey(t.projectId);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(t);
      }
    }

    return map;
  }, [filteredTasks, groups, projects, viewMode, singleId]);

  // ---- Column name helpers ----
  const colName = (key: string) => {
    if (key === COL_NULL) return "未分類";
    if (viewMode === "project_board") {
      return projects.find((p) => p.id === key)?.name ?? "不明";
    }
    return groups.find((g) => g.id === key)?.name ?? "不明";
  };

  // ---- project_board hierarchical structure ----
  interface ProjBoardGroup {
    groupId: string | null;
    groupName: string;
    projectCols: { colKey: string; projectName: string; tasks: Task[] }[];
  }

  const projectBoardGroups = useMemo((): ProjBoardGroup[] => {
    if (viewMode !== "project_board") return [];

    // Group projects by their groupId
    const groupProjectMap = new Map<string | null, Project[]>();
    for (const p of projects) {
      const gId = p.groupId;
      if (!groupProjectMap.has(gId)) groupProjectMap.set(gId, []);
      groupProjectMap.get(gId)!.push(p);
    }

    // Build task map by projectId
    const tasksByProject = new Map<string | null, Task[]>();
    for (const t of filteredTasks) {
      const key = t.projectId;
      if (!tasksByProject.has(key)) tasksByProject.set(key, []);
      tasksByProject.get(key)!.push(t);
    }

    const result: ProjBoardGroup[] = [];

    // Named groups
    for (const g of groups) {
      const groupProjects = groupProjectMap.get(g.id) ?? [];
      const cols = groupProjects.map((p) => ({
        colKey: p.id,
        projectName: p.name,
        tasks: tasksByProject.get(p.id) ?? [],
      }));
      // Also include uncategorized tasks within this group
      // (tasks with groupId matching but projectId=null)
      const uncatTasks = filteredTasks.filter((t) => t.groupId === g.id && t.projectId === null);
      if (uncatTasks.length > 0 || cols.length === 0) {
        cols.unshift({ colKey: `${g.id}__uncat`, projectName: "未分類", tasks: uncatTasks });
      }
      if (cols.some((c) => c.tasks.length > 0) || groupProjects.length > 0) {
        result.push({ groupId: g.id, groupName: g.name, projectCols: cols });
      }
    }

    // Unassigned group (groupId=null)
    const nullGroupProjects = groupProjectMap.get(null) ?? [];
    const nullCols = nullGroupProjects.map((p) => ({
      colKey: p.id,
      projectName: p.name,
      tasks: tasksByProject.get(p.id) ?? [],
    }));
    const nullUncatTasks = filteredTasks.filter((t) => t.groupId === null && t.projectId === null);
    if (nullUncatTasks.length > 0 || nullCols.length === 0) {
      nullCols.unshift({ colKey: COL_NULL, projectName: "未分類", tasks: nullUncatTasks });
    }
    if (nullCols.some((c) => c.tasks.length > 0) || nullGroupProjects.length > 0 || nullUncatTasks.length > 0) {
      result.push({ groupId: null, groupName: "未分類", projectCols: nullCols });
    }

    return result;
  }, [viewMode, groups, projects, filteredTasks]);

  // ---- D&D handlers ----
  const handleDragStart = (taskId: string, sourceColKey: string) => {
    dragTaskId.current = taskId;
    dragSourceColId.current = sourceColKey;
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColId(colKey);
  };

  const handleDragLeave = (e: React.DragEvent, colKey: string) => {
    const related = e.relatedTarget as Node | null;
    const current = e.currentTarget as Node;
    if (related && current.contains(related)) return;
    if (dragOverColId === colKey) setDragOverColId(undefined);
  };

  const handleDrop = async (e: React.DragEvent, targetColKey: string) => {
    e.preventDefault();
    setDragOverColId(undefined);

    const taskId = dragTaskId.current;
    const sourceColKey = dragSourceColId.current;
    dragTaskId.current = null;
    dragSourceColId.current = null;

    if (!taskId || sourceColKey === null) return;
    if (sourceColKey === targetColKey) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const targetId = fromColKey(targetColKey);
    const sourceId = fromColKey(sourceColKey);
    const field = viewMode === "project_board" ? "projectId" : "groupId";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [field]: targetId } : t)),
    );

    try {
      await upsertTask({ ...task, [field]: targetId });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, [field]: sourceId } : t)),
      );
      setToast("移動に失敗しました。元に戻しました。");
    }
  };

  const handleDragEnd = () => {
    dragTaskId.current = null;
    dragSourceColId.current = null;
    setDragOverColId(undefined);
  };

  // ---- Task actions ----
  const handleCreateTask = (colKey: string) => {
    const id = fromColKey(colKey);
    if (viewMode === "project_board") {
      setTaskDrawerGroupId(undefined);
      setTaskDrawerProjectId(id ?? undefined);
    } else {
      setTaskDrawerGroupId(id ?? undefined);
      setTaskDrawerProjectId(undefined);
    }
    setTaskDrawer(undefined);
  };

  const handleEditTask = (task: Task) => {
    setTaskDrawerGroupId(undefined);
    setTaskDrawerProjectId(undefined);
    setTaskDrawer(task);
  };

  const handleDeleteTask = async (task: Task) => {
    await softDeleteTask(task.id);
    await reload();
  };

  const handleEditGroup = (group: Group) => {
    setMasterDrawer({ type: "group", item: group });
  };

  const todayStr = fmt(new Date());

  // Mode label helper
  const modeLabel = (m: ViewMode) =>
    m === "group_board" ? "グループ" : m === "single_group" ? "単一" : "プロジェクト";

  // Single-mode selector options
  const singleOptions = useMemo(() => {
    if (viewMode === "single_group" || viewMode === "group_board") {
      return [
        { key: COL_NULL, label: "未分類" },
        ...groups.map((g) => ({ key: g.id, label: g.name })),
      ];
    }
    return [
      { key: COL_NULL, label: "未分類" },
      ...projects.map((p) => ({ key: p.id, label: p.name })),
    ];
  }, [viewMode, groups, projects]);

  // ---- Render task card (shared between modes) ----
  const renderTaskCard = (task: Task, dragColKey: string) => {
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
          handleDragStart(task.id, dragColKey);
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
  };

  return (
    <div className="ws-page">
      {/* Toolbar */}
      <div className="ws-toolbar">
        {/* View mode toggle */}
        <div className="cal-view-toggle">
          {(["group_board", "single_group", "project_board"] as ViewMode[]).map((m) => (
            <button
              key={m}
              className={`cal-view-btn ${viewMode === m ? "cal-view-btn--active" : ""}`}
              onClick={() => { setViewMode(m); setSingleId(undefined); }}
            >
              {modeLabel(m)}
            </button>
          ))}
        </div>

        <button
          className={`btn-sm ${showFilters ? "btn-secondary" : "btn-ghost"}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          フィルタ {activeFilterCount > 0 && <span className="ws-filter-badge">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Single-group selector */}
      {viewMode === "single_group" && (
        <div className="ws-single-selector">
          <select
            value={singleId ?? ""}
            onChange={(e) => setSingleId(e.target.value || undefined)}
          >
            <option value="">グループを選択…</option>
            {singleOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Filter bar */}
      {showFilters && (
        <div className="filter-bar">
          <div className="filter-item">
            <label className="filter-label">範囲</label>
            <select value={rangeFilter} onChange={(e) => setRangeFilter(e.target.value as RangeFilter)}>
              <option value="all">すべて</option>
              <option value="this_week">今週</option>
              <option value="this_month">今月</option>
              <option value="undone_only">未完了のみ</option>
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
        </div>
      )}

      {/* Single-group: prompt if not selected */}
      {viewMode === "single_group" && singleId === undefined && (
        <div className="ws-empty-prompt">上のセレクタからグループを選択してください</div>
      )}

      {/* Columns: group_board / single_group */}
      {viewMode !== "project_board" && (
        <div className="ws-board">
          {Array.from(columns.entries()).map(([colKey, columnTasks]) => {
            const isDragOver = dragOverColId === colKey;
            const group = colKey !== COL_NULL
              ? groups.find((g) => g.id === colKey)
              : null;

            return (
              <div
                key={colKey}
                className={`ws-col ${isDragOver ? "ws-col--drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, colKey)}
                onDragLeave={(e) => handleDragLeave(e, colKey)}
                onDrop={(e) => handleDrop(e, colKey)}
              >
                <div className="ws-col-header">
                  <span className="ws-col-name">{colName(colKey)}</span>
                  <span className="ws-col-count">{columnTasks.length}</span>
                  <div className="ws-col-actions">
                    <button className="ws-col-add" onClick={() => handleCreateTask(colKey)} title="タスク作成">+</button>
                    {group && (
                      <KebabMenu items={[
                        { label: "グループ編集", onClick: () => handleEditGroup(group) },
                      ]} />
                    )}
                  </div>
                </div>
                <div className="ws-col-body">
                  {columnTasks.length === 0 && <div className="ws-col-empty">タスクなし</div>}
                  {columnTasks.length > 0 && (
                    <Virtuoso
                      data={columnTasks}
                      style={{ height: "50vh", minHeight: 200 }}
                      itemContent={(_, task) => renderTaskCard(task, toColKey(task.groupId))}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Columns: project_board (hierarchical: group → project) */}
      {viewMode === "project_board" && (
        <div className="ws-proj-board">
          {projectBoardGroups.map((gbg) => {
            const groupObj = gbg.groupId ? groups.find((g) => g.id === gbg.groupId) : null;
            return (
              <div key={gbg.groupId ?? COL_NULL} className="ws-proj-group">
                <div className="ws-proj-group-header">
                  <span className="ws-proj-group-name">{gbg.groupName}</span>
                  {groupObj && (
                    <KebabMenu items={[
                      { label: "グループ編集", onClick: () => handleEditGroup(groupObj) },
                    ]} />
                  )}
                </div>
                <div className="ws-board">
                  {gbg.projectCols.map((pc) => {
                    const isDragOver = dragOverColId === pc.colKey;
                    return (
                      <div
                        key={pc.colKey}
                        className={`ws-col ${isDragOver ? "ws-col--drag-over" : ""}`}
                        onDragOver={(e) => handleDragOver(e, pc.colKey)}
                        onDragLeave={(e) => handleDragLeave(e, pc.colKey)}
                        onDrop={(e) => handleDrop(e, pc.colKey)}
                      >
                        <div className="ws-col-header">
                          <span className="ws-col-name">{pc.projectName}</span>
                          <span className="ws-col-count">{pc.tasks.length}</span>
                          <div className="ws-col-actions">
                            <button className="ws-col-add" onClick={() => handleCreateTask(pc.colKey)} title="タスク作成">+</button>
                          </div>
                        </div>
                        <div className="ws-col-body">
                          {pc.tasks.length === 0 && <div className="ws-col-empty">タスクなし</div>}
                          {pc.tasks.length > 0 && (
                            <Virtuoso
                              data={pc.tasks}
                              style={{ height: "50vh", minHeight: 200 }}
                              itemContent={(_, task) => renderTaskCard(task, toColKey(task.projectId))}
                            />
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
      )}

      {/* FAB Menu */}
      <FabMenu
        onCreateTask={() => {
          setTaskDrawerGroupId(undefined);
          setTaskDrawerProjectId(undefined);
          setTaskDrawer(undefined);
        }}
        onCreateGroup={() => setMasterDrawer({ type: "group" })}
        onCreateProject={() => setMasterDrawer({ type: "project" })}
      />

      {/* Drawers */}
      <TaskDrawer
        task={taskDrawer}
        defaultGroupId={taskDrawerGroupId}
        defaultProjectId={taskDrawerProjectId}
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
