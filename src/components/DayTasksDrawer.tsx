import { useState, useMemo } from "react";
import type { Task } from "../domain/task";
import { Drawer } from "./Drawer";
import { TaskRow } from "./TaskRow";
import { KebabMenu, type KebabItem } from "./KebabMenu";
import { TaskEditDrawer } from "./TaskEditDrawer";

interface DayTasksDrawerProps {
  date: string | null;   // YYYY-MM-DD or null (closed)
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onSaved: () => void;
  onClose: () => void;
}

export function DayTasksDrawer({ date, tasks, onToggleDone, onSaved, onClose }: DayTasksDrawerProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const dayTasks = useMemo(() => {
    if (!date) return [];
    return tasks.filter((t) => t.dueDate === date);
  }, [tasks, date]);

  const activeTasks = dayTasks.filter((t) => t.status !== "done");
  const doneTasks = dayTasks.filter((t) => t.status === "done");

  return (
    <>
      <Drawer open={!!date} onClose={onClose} title={date ?? ""}>
        <div className="day-drawer">
          {dayTasks.length === 0 ? (
            <p className="day-drawer-empty">この日の期限タスクはありません</p>
          ) : (
            <>
              {activeTasks.length > 0 && (
                <div className="day-drawer-section">
                  {activeTasks.map((t) => {
                    const items: KebabItem[] = [
                      { label: "編集", onClick: () => setEditingTask(t) },
                    ];
                    return (
                      <TaskRow
                        key={t.id}
                        task={t}
                        onToggleDone={onToggleDone}
                        extra={<KebabMenu items={items} />}
                      />
                    );
                  })}
                </div>
              )}
              {doneTasks.length > 0 && (
                <div className="day-drawer-section">
                  <span className="day-drawer-section-label">完了</span>
                  {doneTasks.map((t) => {
                    const items: KebabItem[] = [
                      { label: "編集", onClick: () => setEditingTask(t) },
                    ];
                    return (
                      <TaskRow
                        key={t.id}
                        task={t}
                        onToggleDone={onToggleDone}
                        extra={<KebabMenu items={items} />}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </Drawer>

      {/* Nested edit drawer */}
      <TaskEditDrawer
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={onSaved}
      />
    </>
  );
}
