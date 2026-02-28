import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../domain/task";
import { listTasks, toggleDone, toggleStatus, upsertTask } from "../db/tasksRepo";
import { getDueBucket } from "../utils/dateBuckets";
import { priorityIcon } from "../utils/priorityIcon";
import { ensureNextInstanceForAllActiveTemplates } from "../utils/recurrenceEngine";

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
  const quickRef = useRef<HTMLInputElement>(null);

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

  // Flat list for keyboard navigation (section order: overdue → today → thisWeekHigh)
  const flatList = useMemo(
    () => [...sections.overdue, ...sections.today, ...sections.thisWeekHigh],
    [sections],
  );

  // Reset selection when list changes
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (flatList.length === 0) return -1;
      if (prev >= flatList.length) return flatList.length - 1;
      return prev;
    });
  }, [flatList]);

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

  // Check if an input element is focused (to suppress hotkeys)
  const isInputFocused = () => {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
  };

  // Global keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // "/" → focus search (unless already in an input)
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      // Esc → clear search if search is focused, otherwise blur
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

      // j/k/Space/Enter only when NOT in an input
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

  // Compute the per-row index offset for each section
  const overdueOffset = 0;
  const todayOffset = sections.overdue.length;
  const thisWeekOffset = sections.overdue.length + sections.today.length;

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
          ref={quickRef}
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
          <FocusSection
            title="期限切れ"
            tasks={sections.overdue}
            onToggleDone={handleToggleDone}
            onToggleStatus={handleToggleStatus}
            selectedIndex={selectedIndex}
            indexOffset={overdueOffset}
            alert
          />
          <FocusSection
            title="今日"
            tasks={sections.today}
            onToggleDone={handleToggleDone}
            onToggleStatus={handleToggleStatus}
            selectedIndex={selectedIndex}
            indexOffset={todayOffset}
          />
          <FocusSection
            title="今週 High"
            tasks={sections.thisWeekHigh}
            onToggleDone={handleToggleDone}
            onToggleStatus={handleToggleStatus}
            selectedIndex={selectedIndex}
            indexOffset={thisWeekOffset}
          />
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

function FocusSection({
  title,
  tasks,
  onToggleDone,
  onToggleStatus,
  selectedIndex,
  indexOffset,
  alert,
}: {
  title: string;
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onToggleStatus: (id: string) => void;
  selectedIndex: number;
  indexOffset: number;
  alert?: boolean;
}) {
  if (tasks.length === 0) return null;

  return (
    <section className="focus-section">
      <h2 className={`focus-section-title ${alert ? "focus-section-title--alert" : ""}`}>
        {title}
        <span className={`focus-count ${alert ? "focus-count--alert" : ""}`}>
          {tasks.length}
        </span>
      </h2>
      <div className="focus-list">
        {tasks.map((task, i) => {
          const globalIdx = indexOffset + i;
          const isSelected = globalIdx === selectedIndex;
          return (
            <FocusRow
              key={task.id}
              task={task}
              isSelected={isSelected}
              onToggleDone={onToggleDone}
              onToggleStatus={onToggleStatus}
            />
          );
        })}
      </div>
    </section>
  );
}

function FocusRow({
  task,
  isSelected,
  onToggleDone,
  onToggleStatus,
}: {
  task: Task;
  isSelected: boolean;
  onToggleDone: (id: string) => void;
  onToggleStatus: (id: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isSelected]);

  const classes = [
    "focus-row",
    task.status === "in_progress" ? "focus-row--active" : "",
    isSelected ? "focus-row--selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rowRef} className={classes}>
      <input
        type="checkbox"
        className="task-checkbox"
        checked={false}
        onChange={() => onToggleDone(task.id)}
      />
      <button
        className={`focus-status-btn ${task.status === "in_progress" ? "focus-status-btn--active" : ""}`}
        onClick={() => onToggleStatus(task.id)}
        title={task.status === "todo" ? "着手する" : "未着手に戻す"}
      >
        {task.status === "in_progress" ? "着手中" : "着手"}
      </button>
      <span className="focus-priority">{priorityIcon(task.priority)}</span>
      <span className="focus-title">{task.title}</span>
      {task.dueDate && (
        <span className="focus-due">{task.dueDate}</span>
      )}
    </div>
  );
}
