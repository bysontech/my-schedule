import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../domain/task";
import { listTasks, toggleDone, toggleStatus, upsertTask } from "../db/tasksRepo";
import { getDueBucket } from "../utils/dateBuckets";
import { ensureNextInstanceForAllActiveTemplates } from "../utils/recurrenceEngine";
import { TaskRow } from "../components/TaskRow";

function sortByDueAsc(a: Task, b: Task): number {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate.localeCompare(b.dueDate);
}

export function FocusPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quickTitle, setQuickTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLInputElement>(null);
  const selectedRowRef = useRef<HTMLDivElement>(null);

  const load = () => {
    listTasks().then(setTasks);
  };

  useEffect(() => {
    ensureNextInstanceForAllActiveTemplates().then(() => load());
  }, []);

  const sections = useMemo(() => {
    const active = tasks.filter((t) => t.status !== "done");

    const q = searchQuery.trim().toLowerCase();
    const matched = q
      ? active.filter((t) => t.title.toLowerCase().includes(q))
      : active;

    const overdue = matched
      .filter((t) => getDueBucket(t.dueDate) === "overdue")
      .sort(sortByDueAsc);

    const today = matched
      .filter((t) => getDueBucket(t.dueDate) === "today")
      .sort(sortByDueAsc);

    const thisWeekHigh = matched
      .filter(
        (t) =>
          getDueBucket(t.dueDate) === "thisWeek" && t.priority === "high",
      )
      .sort(sortByDueAsc);

    return { overdue, today, thisWeekHigh };
  }, [tasks, searchQuery]);

  const flatList = useMemo(
    () => [...sections.overdue, ...sections.today, ...sections.thisWeekHigh],
    [sections],
  );

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (flatList.length === 0) return -1;
      if (prev >= flatList.length) return flatList.length - 1;
      return prev;
    });
  }, [flatList]);

  useEffect(() => {
    if (selectedIndex >= 0 && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const handleToggleDone = useCallback(async (id: string) => {
    await toggleDone(id);
    load();
  }, []);

  const handleToggleStatus = useCallback(async (id: string) => {
    await toggleStatus(id);
    load();
  }, []);

  const handleQuickAdd = async () => {
    const title = quickTitle.trim();
    if (!title) return;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      memo: null,
      dueDate: todayStr,
      priority: "med",
      status: "todo",
      groupId: null,
      projectId: null,
      bucketIds: [],
      recurrenceTemplateId: null,
      isDeleted: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    await upsertTask(task);
    setQuickTitle("");
    load();
  };

  const isInputFocused = () => {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (e.key === "Escape") {
        if (document.activeElement === searchRef.current) {
          if (searchQuery) {
            setSearchQuery("");
          } else {
            searchRef.current?.blur();
          }
          return;
        }
        if (isInputFocused()) {
          (document.activeElement as HTMLElement)?.blur();
          return;
        }
      }

      if (isInputFocused()) return;

      if (e.key === "j") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
        return;
      }

      if (e.key === "k") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (e.key === " " && selectedIndex >= 0 && selectedIndex < flatList.length) {
        e.preventDefault();
        handleToggleDone(flatList[selectedIndex].id);
        return;
      }

      if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < flatList.length) {
        e.preventDefault();
        handleToggleStatus(flatList[selectedIndex].id);
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchQuery, flatList, selectedIndex, handleToggleDone, handleToggleStatus]);

  const total = flatList.length;

  const overdueOffset = 0;
  const todayOffset = sections.overdue.length;
  const thisWeekOffset = sections.overdue.length + sections.today.length;

  const renderSection = (
    sectionTitle: string,
    sectionTasks: Task[],
    offset: number,
    alert?: boolean,
  ) => {
    if (sectionTasks.length === 0) return null;
    return (
      <section className="focus-section">
        <h2 className={`focus-section-title ${alert ? "focus-section-title--alert" : ""}`}>
          {sectionTitle}
          <span className={`focus-count ${alert ? "focus-count--alert" : ""}`}>
            {sectionTasks.length}
          </span>
        </h2>
        <div className="focus-list">
          {sectionTasks.map((task, i) => {
            const globalIdx = offset + i;
            const isSelected = globalIdx === selectedIndex;
            return (
              <TaskRow
                key={task.id}
                ref={isSelected ? selectedRowRef : undefined}
                task={task}
                onToggleDone={handleToggleDone}
                selected={isSelected}
                extra={
                  <button
                    className={`focus-status-btn ${task.status === "in_progress" ? "focus-status-btn--active" : ""}`}
                    onClick={() => handleToggleStatus(task.id)}
                    title={task.status === "todo" ? "着手する" : "未着手に戻す"}
                  >
                    {task.status === "in_progress" ? "着手中" : "着手"}
                  </button>
                }
              />
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="focus-page">
      {/* Search */}
      <div className="focus-search">
        <input
          ref={searchRef}
          type="text"
          className="focus-search-input"
          placeholder="検索 ( / )"
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

      {/* Quick add */}
      <div className="focus-quick-add">
        <input
          type="text"
          className="focus-quick-input"
          placeholder="今日やることを追加..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleQuickAdd();
          }}
        />
        <button
          className="btn-sm"
          onClick={handleQuickAdd}
          disabled={!quickTitle.trim()}
        >
          追加
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="focus-hints">
        <span><kbd>/</kbd> 検索</span>
        <span><kbd>j</kbd><kbd>k</kbd> 移動</span>
        <span><kbd>Space</kbd> 完了</span>
        <span><kbd>Enter</kbd> 着手切替</span>
        <span><kbd>Esc</kbd> 解除</span>
      </div>

      {total === 0 ? (
        <div className="empty-state">
          <p>{searchQuery ? "一致するタスクはありません" : "今やるべきタスクはありません"}</p>
          <Link to="/tasks" className="focus-planning-link">
            設計室で整理 →
          </Link>
        </div>
      ) : (
        <>
          {renderSection("期限切れ", sections.overdue, overdueOffset, true)}
          {renderSection("今日", sections.today, todayOffset)}
          {renderSection("今週 High", sections.thisWeekHigh, thisWeekOffset)}
          <div className="focus-footer">
            <Link to="/tasks" className="focus-planning-link">
              設計室で整理 →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
