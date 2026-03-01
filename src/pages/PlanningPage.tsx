import { useState, useEffect, useMemo, useCallback } from "react";
import type { Task, TaskPriority, TaskStatus } from "../domain/task";
import type { Group, Project, Bucket } from "../domain/master";
import { listTasks, toggleDone } from "../db/tasksRepo";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { listBuckets } from "../db/bucketsRepo";
import { CalendarMonth } from "../components/CalendarMonth";
import { CalendarWeekGrid } from "../components/CalendarWeekGrid";
import { CalendarYear } from "../components/CalendarYear";
import { DayTasksDrawer } from "../components/DayTasksDrawer";

type ViewMode = "week" | "month" | "year";

const PRIORITY_LABELS: Record<TaskPriority, string> = { high: "High", med: "Med", low: "Low" };
const STATUS_LABELS: Record<TaskStatus, string> = { todo: "未着手", in_progress: "進行中", done: "完了" };

export function PlanningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);

  // View state (preserved across drawer open/close)
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterGroupId, setFilterGroupId] = useState<string>("all");
  const [filterProjectId, setFilterProjectId] = useState<string>("all");
  const [filterBucketId, setFilterBucketId] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");

  const load = useCallback(() => {
    listTasks().then(setTasks);
    listGroups().then(setGroups);
    listProjects().then(setProjects);
    listBuckets().then(setBuckets);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filterGroupId !== "all") {
      result = result.filter((t) => t.groupId === filterGroupId);
    }
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
    return result;
  }, [tasks, filterGroupId, filterProjectId, filterBucketId, filterPriority, filterStatus]);

  const handleToggleDone = useCallback(async (id: string) => {
    await toggleDone(id);
    load();
  }, [load]);

  // Navigation
  const cursorYear = cursorDate.getFullYear();
  const cursorMonth = cursorDate.getMonth() + 1;

  const goPrev = () => {
    setCursorDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "year") d.setFullYear(d.getFullYear() - 1);
      else if (viewMode === "month") d.setMonth(d.getMonth() - 1);
      else d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goNext = () => {
    setCursorDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "year") d.setFullYear(d.getFullYear() + 1);
      else if (viewMode === "month") d.setMonth(d.getMonth() + 1);
      else d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const goToday = () => setCursorDate(new Date());

  const navTitle = (() => {
    if (viewMode === "year") return `${cursorYear}年`;
    if (viewMode === "month") return `${cursorYear}年${cursorMonth}月`;
    // week
    const d = new Date(cursorDate);
    const dow = (d.getDay() + 6) % 7;
    const mon = new Date(d);
    mon.setDate(mon.getDate() - dow);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    const fmt = (dt: Date) => `${dt.getMonth() + 1}/${dt.getDate()}`;
    return `${fmt(mon)} – ${fmt(sun)}`;
  })();

  const handleSelectMonth = (year: number, month: number) => {
    setCursorDate(new Date(year, month - 1, 1));
    setViewMode("month");
  };

  const filteredProjectsByGroup = filterGroupId !== "all"
    ? projects.filter((p) => p.groupId === filterGroupId)
    : projects;

  const hasActiveFilter = filterGroupId !== "all" || filterProjectId !== "all" || filterBucketId !== "all" || filterPriority !== "all" || filterStatus !== "all";

  return (
    <div className="planning-page">
      {/* Toolbar: view toggle */}
      <div className="cal-toolbar">
        <h2 className="dash-section-title" style={{ margin: 0 }}>Planning</h2>
        <div className="cal-view-toggle">
          {(["week", "month", "year"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`cal-view-btn ${viewMode === mode ? "cal-view-btn--active" : ""}`}
              onClick={() => setViewMode(mode)}
            >
              {mode === "week" ? "週" : mode === "month" ? "月" : "年"}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={goPrev}>&lt;</button>
        <button className="cal-nav-today" onClick={goToday}>今日</button>
        <span className="cal-nav-title">{navTitle}</span>
        <button className="cal-nav-btn" onClick={goNext}>&gt;</button>
      </div>

      {/* Filter toggle */}
      <div className="planning-filter-bar">
        <button
          className={`btn-sm ${showFilter ? "btn-secondary" : "btn-ghost"}`}
          onClick={() => setShowFilter((v) => !v)}
        >
          {showFilter ? "フィルタを隠す" : "詳細フィルタ"}
        </button>
        {hasActiveFilter && (
          <span className="planning-filter-active">フィルタ適用中</span>
        )}
      </div>

      {/* Collapsible filter */}
      {showFilter && (
        <div className="filter-bar">
          {groups.length > 0 && (
            <div className="filter-item">
              <span className="filter-label">グループ</span>
              <select
                value={filterGroupId}
                onChange={(e) => { setFilterGroupId(e.target.value); setFilterProjectId("all"); }}
              >
                <option value="all">すべて</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          {projects.length > 0 && (
            <div className="filter-item">
              <span className="filter-label">プロジェクト</span>
              <select value={filterProjectId} onChange={(e) => setFilterProjectId(e.target.value)}>
                <option value="all">すべて</option>
                {filteredProjectsByGroup.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {buckets.length > 0 && (
            <div className="filter-item">
              <span className="filter-label">Bucket</span>
              <select value={filterBucketId} onChange={(e) => setFilterBucketId(e.target.value)}>
                <option value="all">すべて</option>
                {buckets.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <div className="filter-item">
            <span className="filter-label">優先度</span>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "all")}>
              <option value="all">すべて</option>
              {(["high", "med", "low"] as const).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">状態</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")}>
              <option value="all">すべて</option>
              {(["todo", "in_progress", "done"] as const).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="planning-calendar">
        {viewMode === "month" && (
          <CalendarMonth
            year={cursorYear}
            month={cursorMonth}
            tasks={filteredTasks}
            onSelectDate={setSelectedDate}
          />
        )}
        {viewMode === "week" && (
          <CalendarWeekGrid
            refDate={cursorDate}
            tasks={filteredTasks}
            onSelectDate={setSelectedDate}
          />
        )}
        {viewMode === "year" && (
          <CalendarYear
            year={cursorYear}
            tasks={filteredTasks}
            onSelectMonth={handleSelectMonth}
          />
        )}
      </div>

      {/* DayDrawer (date selection → task list → create/edit) */}
      <DayTasksDrawer
        date={selectedDate}
        tasks={filteredTasks}
        onToggleDone={handleToggleDone}
        onSaved={load}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
