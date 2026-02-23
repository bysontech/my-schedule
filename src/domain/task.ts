export type TaskPriority = "high" | "med" | "low";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  memo: string | null;
  dueDate: string | null; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  groupId: string | null;
  projectId: string | null;
  bucketIds: string[];
  recurrenceTemplateId: string | null;
  isDeleted: boolean;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export function createEmptyTask(): Omit<Task, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    memo: null,
    dueDate: null,
    priority: "med",
    status: "todo",
    groupId: null,
    projectId: null,
    bucketIds: [],
    recurrenceTemplateId: null,
    isDeleted: false,
  };
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 3,
  med: 2,
  low: 1,
};

export function priorityOrder(p: TaskPriority): number {
  return PRIORITY_ORDER[p];
}
