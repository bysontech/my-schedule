import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Task } from "../domain/task";
import { listTasks } from "../db/tasksRepo";
import { ensureNextInstanceForAllActiveTemplates } from "../utils/recurrenceEngine";
import { aggregateCounts, getQuickList } from "../utils/taskAggregations";
import { DUE_BUCKET_LABELS } from "../utils/dateBuckets";

const PRIORITY_LABELS = { high: "High", med: "Med", low: "Low" } as const;
const STATUS_LABELS = { todo: "未着手", in_progress: "進行中", done: "完了" } as const;

export function DashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    ensureNextInstanceForAllActiveTemplates().then(() => {
      listTasks().then(setTasks);
    });
  }, []);

  const agg = useMemo(() => aggregateCounts(tasks), [tasks]);
  const overdueList = useMemo(() => getQuickList(tasks, "overdue", 10), [tasks]);
  const todayList = useMemo(() => getQuickList(tasks, "today", 10), [tasks]);

  const goFiltered = (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    navigate(`/tasks?${qs}`);
  };

  return (
    <div className="dashboard">
      {/* 期限別 */}
      <section className="dash-section">
        <h2 className="dash-section-title">期限別</h2>
        <div className="dash-cards">
          {(["overdue", "today", "thisWeek", "thisMonth"] as const).map((key) => (
            <button
              key={key}
              className={`dash-card ${key === "overdue" && agg.dueCounts.overdue > 0 ? "dash-card--alert" : ""}`}
              onClick={() => goFiltered({ due: key })}
            >
              <span className="dash-card-count">{agg.dueCounts[key]}</span>
              <span className="dash-card-label">{DUE_BUCKET_LABELS[key]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 状態別 */}
      <section className="dash-section">
        <h2 className="dash-section-title">状態別</h2>
        <div className="dash-cards">
          {(["todo", "in_progress", "done"] as const).map((key) => (
            <button
              key={key}
              className="dash-card"
              onClick={() => goFiltered({ status: key })}
            >
              <span className="dash-card-count">{agg.statusCounts[key]}</span>
              <span className="dash-card-label">{STATUS_LABELS[key]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 優先度別 */}
      <section className="dash-section">
        <h2 className="dash-section-title">優先度別</h2>
        <div className="dash-cards">
          {(["high", "med", "low"] as const).map((key) => (
            <button
              key={key}
              className="dash-card"
              onClick={() => goFiltered({ priority: key })}
            >
              <span className="dash-card-count">{agg.priorityCounts[key]}</span>
              <span className="dash-card-label">{PRIORITY_LABELS[key]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* クイック一覧: 期限切れ */}
      <QuickSection
        title="期限切れ"
        tasks={overdueList}
        onClickTask={(id) => navigate(`/tasks/${id}/edit`)}
        onShowAll={() => goFiltered({ due: "overdue" })}
        alert
      />

      {/* クイック一覧: 今日 */}
      <QuickSection
        title="今日のタスク"
        tasks={todayList}
        onClickTask={(id) => navigate(`/tasks/${id}/edit`)}
        onShowAll={() => goFiltered({ due: "today" })}
      />
    </div>
  );
}

function QuickSection({
  title,
  tasks,
  onClickTask,
  onShowAll,
  alert,
}: {
  title: string;
  tasks: Task[];
  onClickTask: (id: string) => void;
  onShowAll: () => void;
  alert?: boolean;
}) {
  if (tasks.length === 0) return null;

  return (
    <section className="dash-section">
      <div className="dash-quick-header">
        <h2 className={`dash-section-title ${alert ? "dash-section-title--alert" : ""}`}>
          {title}
          <span className="dash-quick-count">{tasks.length}</span>
        </h2>
        <button className="btn-sm btn-ghost" onClick={onShowAll}>
          すべて表示
        </button>
      </div>
      <div className="dash-quick-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="dash-quick-item"
            onClick={() => onClickTask(task.id)}
          >
            <span className={`badge badge-priority-${task.priority} dash-quick-badge`}>
              {PRIORITY_LABELS[task.priority]}
            </span>
            <span className="dash-quick-title">{task.title}</span>
            {task.dueDate && (
              <span className="dash-quick-due">{task.dueDate}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
