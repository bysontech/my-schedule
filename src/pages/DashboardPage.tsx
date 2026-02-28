import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Task } from "../domain/task";
import type { Group } from "../domain/master";
import { listTasks, toggleDone } from "../db/tasksRepo";
import { listGroups } from "../db/groupsRepo";
import { ensureNextInstanceForAllActiveTemplates } from "../utils/recurrenceEngine";
import {
  computeStrategySummary,
  computeDangerCounts,
  computeGroupProgress,
} from "../utils/taskAggregations";
import { getDueBucket } from "../utils/dateBuckets";
import { TaskRow } from "../components/TaskRow";
import { TaskEditDrawer } from "../components/TaskEditDrawer";
import { CalendarMonth } from "../components/CalendarMonth";
import { CalendarWeek } from "../components/CalendarWeek";
import { DayTasksDrawer } from "../components/DayTasksDrawer";

type CalendarView = "week" | "month";

export function DashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Calendar state
  const [calView, setCalView] = useState<CalendarView>("week");
  const [calRef, setCalRef] = useState(() => new Date()); // reference date for week/month nav
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calYear = calRef.getFullYear();
  const calMonth = calRef.getMonth() + 1; // 1-12

  const load = useCallback(() => {
    listTasks().then(setTasks);
    listGroups().then(setGroups);
  }, []);

  useEffect(() => {
    ensureNextInstanceForAllActiveTemplates().then(() => load());
  }, [load]);

  const strategy = useMemo(() => computeStrategySummary(tasks), [tasks]);
  const danger = useMemo(() => computeDangerCounts(tasks), [tasks]);
  const groupProgress = useMemo(() => computeGroupProgress(tasks, groups), [tasks, groups]);

  const dangerTotal = danger.overdue + danger.today + danger.thisWeekHigh;

  const handleToggleDone = useCallback(async (id: string) => {
    await toggleDone(id);
    load();
  }, [load]);

  // Quick list: overdue + today (not done), max 5 each
  const quickOverdue = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "done" && getDueBucket(t.dueDate) === "overdue")
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
        .slice(0, 5),
    [tasks],
  );
  const quickToday = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== "done" && getDueBucket(t.dueDate) === "today")
        .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
        .slice(0, 5),
    [tasks],
  );

  // Calendar navigation
  const goCalPrev = () => {
    setCalRef((prev) => {
      const d = new Date(prev);
      if (calView === "month") {
        d.setMonth(d.getMonth() - 1);
      } else {
        d.setDate(d.getDate() - 7);
      }
      return d;
    });
  };

  const goCalNext = () => {
    setCalRef((prev) => {
      const d = new Date(prev);
      if (calView === "month") {
        d.setMonth(d.getMonth() + 1);
      } else {
        d.setDate(d.getDate() + 7);
      }
      return d;
    });
  };

  const goCalToday = () => {
    setCalRef(new Date());
  };

  const calTitle =
    calView === "month"
      ? `${calYear}年${calMonth}月`
      : (() => {
          const d = new Date(calRef);
          const dow = (d.getDay() + 6) % 7;
          const mon = new Date(d);
          mon.setDate(mon.getDate() - dow);
          const sun = new Date(mon);
          sun.setDate(sun.getDate() + 6);
          const fmtShort = (dt: Date) =>
            `${dt.getMonth() + 1}/${dt.getDate()}`;
          return `${fmtShort(mon)} – ${fmtShort(sun)}`;
        })();

  return (
    <div className="dashboard">
      {/* ── 上段: 戦略サマリー ── */}
      <section className="dash-section">
        <h2 className="dash-section-title">戦略サマリー</h2>
        <div className="dash-cards">
          <div className="dash-stat">
            <span className="dash-stat-value">{strategy.total}</span>
            <span className="dash-stat-label">総タスク</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{strategy.inProgress}</span>
            <span className="dash-stat-label">進行中</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{strategy.completionRate}%</span>
            <span className="dash-stat-sub">{strategy.done} / {strategy.total}</span>
            <span className="dash-stat-label">完了率</span>
          </div>
          <div className="dash-stat">
            <span className="dash-stat-value">{strategy.thisWeekRate}%</span>
            <span className="dash-stat-sub">{strategy.thisWeekDone} / {strategy.thisWeekTotal}</span>
            <span className="dash-stat-label">今週達成率</span>
          </div>
        </div>
      </section>

      {/* ── 危険ゾーン ── */}
      <section className="dash-section">
        <h2 className={`dash-section-title ${dangerTotal > 0 ? "dash-section-title--alert" : ""}`}>
          危険ゾーン
        </h2>
        <div className="dash-cards">
          <button
            className={`dash-card ${danger.overdue > 0 ? "dash-card--danger" : ""}`}
            onClick={() => navigate("/focus")}
          >
            <span className="dash-card-count">{danger.overdue}</span>
            <span className="dash-card-label">期限切れ</span>
          </button>
          <button
            className={`dash-card ${danger.today > 0 ? "dash-card--danger" : ""}`}
            onClick={() => navigate("/focus")}
          >
            <span className="dash-card-count">{danger.today}</span>
            <span className="dash-card-label">今日期限</span>
          </button>
          <button
            className={`dash-card ${danger.thisWeekHigh > 0 ? "dash-card--caution" : ""}`}
            onClick={() => navigate("/focus")}
          >
            <span className="dash-card-count">{danger.thisWeekHigh}</span>
            <span className="dash-card-label">今週 High</span>
          </button>
        </div>

        {/* Quick preview of overdue/today using TaskRow */}
        {(quickOverdue.length > 0 || quickToday.length > 0) && (
          <div className="dash-danger-preview">
            {quickOverdue.length > 0 && (
              <div className="dash-danger-group">
                <span className="dash-danger-group-label dash-danger-group-label--danger">期限切れ</span>
                {quickOverdue.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggleDone={handleToggleDone}
                    onClickTitle={(task) => setEditingTask(task)}
                  />
                ))}
              </div>
            )}
            {quickToday.length > 0 && (
              <div className="dash-danger-group">
                <span className="dash-danger-group-label dash-danger-group-label--danger">今日</span>
                {quickToday.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    onToggleDone={handleToggleDone}
                    onClickTitle={(task) => setEditingTask(task)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── カレンダー ── */}
      <section className="dash-section">
        <div className="cal-toolbar">
          <h2 className="dash-section-title" style={{ margin: 0 }}>カレンダー</h2>
          <div className="cal-view-toggle">
            <button
              className={`cal-view-btn ${calView === "week" ? "cal-view-btn--active" : ""}`}
              onClick={() => setCalView("week")}
            >
              週
            </button>
            <button
              className={`cal-view-btn ${calView === "month" ? "cal-view-btn--active" : ""}`}
              onClick={() => setCalView("month")}
            >
              月
            </button>
          </div>
        </div>

        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={goCalPrev}>&lt;</button>
          <button className="cal-nav-today" onClick={goCalToday}>今日</button>
          <span className="cal-nav-title">{calTitle}</span>
          <button className="cal-nav-btn" onClick={goCalNext}>&gt;</button>
        </div>

        {calView === "month" ? (
          <CalendarMonth
            year={calYear}
            month={calMonth}
            tasks={tasks}
            onSelectDate={setSelectedDate}
          />
        ) : (
          <CalendarWeek
            refDate={calRef}
            tasks={tasks}
            onSelectDate={setSelectedDate}
            onToggleDone={handleToggleDone}
          />
        )}
      </section>

      {/* ── 分野別進捗 ── */}
      {groupProgress.length > 0 && (
        <section className="dash-section">
          <h2 className="dash-section-title">分野別進捗</h2>
          <div className="dash-group-list">
            {groupProgress.map((gp) => (
              <button
                key={gp.groupId ?? "__null__"}
                className="dash-group-row"
                onClick={() =>
                  gp.groupId
                    ? navigate(`/tasks?groupId=${gp.groupId}`)
                    : navigate("/tasks")
                }
              >
                <span className="dash-group-name">{gp.groupName}</span>
                <span className="dash-group-bar-track">
                  <span
                    className="dash-group-bar-fill"
                    style={{ width: `${gp.rate}%` }}
                  />
                </span>
                <span className="dash-group-rate">{gp.rate}%</span>
                <span className="dash-group-fraction">{gp.done}/{gp.total}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Drawers */}
      <DayTasksDrawer
        date={selectedDate}
        tasks={tasks}
        onToggleDone={handleToggleDone}
        onSaved={load}
        onClose={() => setSelectedDate(null)}
      />

      <TaskEditDrawer
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={load}
      />
    </div>
  );
}
