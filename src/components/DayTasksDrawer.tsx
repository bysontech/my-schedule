import { useState, useMemo, useEffect } from "react";
import type { Task } from "../domain/task";
import type { Group, Project } from "../domain/master";
import { listGroups } from "../db/groupsRepo";
import { listProjects } from "../db/projectsRepo";
import { groupByGroupProject } from "../utils/taskHierarchy";
import { Drawer } from "./Drawer";
import { TaskRow } from "./TaskRow";
import { KebabMenu, type KebabItem } from "./KebabMenu";
import { TaskDrawer } from "./TaskDrawer";

// TaskDrawer state: null=closed, undefined=create, Task=edit
type TaskDrawerState = Task | null | undefined;

interface DayTasksDrawerProps {
  date: string | null;   // YYYY-MM-DD or null (closed)
  tasks: Task[];
  onToggleDone: (id: string) => void;
  onSaved: () => void;
  onClose: () => void;
}

export function DayTasksDrawer({ date, tasks, onToggleDone, onSaved, onClose }: DayTasksDrawerProps) {
  const [taskDrawerState, setTaskDrawerState] = useState<TaskDrawerState>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!date) return;
    listGroups().then(setGroups);
    listProjects().then(setProjects);
  }, [date]);

  const dayTasks = useMemo(() => {
    if (!date) return [];
    return tasks.filter((t) => t.dueDate === date);
  }, [tasks, date]);

  const hierarchy = useMemo(
    () => groupByGroupProject(dayTasks, groups, projects),
    [dayTasks, groups, projects],
  );

  const renderTaskRow = (t: Task) => {
    const items: KebabItem[] = [
      { label: "編集", onClick: () => setTaskDrawerState(t) },
    ];
    return (
      <TaskRow
        key={t.id}
        task={t}
        onToggleDone={onToggleDone}
        extra={<KebabMenu items={items} />}
      />
    );
  };

  return (
    <>
      <Drawer open={!!date} onClose={onClose} title={date ?? ""}>
        <div className="day-drawer">
          <button
            className="btn-sm"
            onClick={() => setTaskDrawerState(undefined)}
            style={{ alignSelf: "flex-start", marginBottom: "0.5rem" }}
          >
            + タスク作成
          </button>

          {dayTasks.length === 0 ? (
            <p className="day-drawer-empty">この日の期限タスクはありません</p>
          ) : (
            <div className="hier-sections">
              {hierarchy.map((gs) => (
                <div key={gs.groupId ?? "__null__"} className="hier-group">
                  <div className="hier-group-label">{gs.groupName}</div>
                  {gs.projects.map((ps) => (
                    <div key={ps.projectId ?? "__null__"} className="hier-project">
                      <div className="hier-project-label">{ps.projectName}</div>
                      <div className="hier-task-list">
                        {ps.tasks.map(renderTaskRow)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      {/* Nested task drawer (create/edit) */}
      <TaskDrawer
        task={taskDrawerState}
        defaultDueDate={date ?? undefined}
        onClose={() => setTaskDrawerState(null)}
        onSaved={onSaved}
      />
    </>
  );
}
