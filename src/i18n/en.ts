import type { Translations } from "./types";

export const en: Translations = {
  // ── App / Nav ──
  appTitle: "My Schedule",
  navHome: "Home",
  navWorkspace: "Workspace",
  navPlanning: "Planning",
  navSettings: "Settings",
  loading: "Loading…",

  // ── Common ──
  create: "Create",
  save: "Save",
  cancel: "Cancel",
  back: "Back",
  edit: "Edit",
  delete_: "Delete",
  none: "None",
  all: "All",
  today: "Today",
  menu: "Menu",
  uncategorized: "Uncategorized",
  unknown: "Unknown",
  noTasks: "No tasks",
  noTargetTasks: "No matching tasks",
  nameRequired: "Name is required",

  // ── Task status ──
  statusTodo: "To Do",
  statusInProgress: "In Progress",
  statusDone: "Done",

  // ── Priority ──
  priorityHigh: "High",
  priorityMed: "Med",
  priorityLow: "Low",

  // ── Due buckets ──
  dueOverdue: "Overdue",
  dueToday: "Today",
  dueThisWeek: "This Week",
  dueThisMonth: "This Month",

  // ── Calendar ──
  calendar: "Calendar",
  calDay: "Day",
  calWeek: "Week",
  calMonth: "Month",
  calYear: "Year",
  calToday: "Today",
  weekdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  weekdaysSun: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

  // ── Dashboard ──
  strategySummary: "Strategy Summary",
  totalTasks: "Total Tasks",
  inProgress: "In Progress",
  completionRate: "Completion Rate",
  weeklyRate: "Weekly Rate",
  dangerZone: "Danger Zone",
  overdue: "Overdue",
  todayDue: "Due Today",
  thisWeekHigh: "This Week High",
  fieldProgress: "Progress by Field",
  group: "Group",
  project: "Project",
  thisWeek: "This Week",
  thisMonth: "This Month",
  createTask: "Create Task",
  undoMarkedNotDone: "Marked as not done",
  undoMarkedDone: "Marked as done",
  undo: "Undo",

  // ── Calendar title format ──
  calMonthTitle: (year, month) => `${month}/${year}`,
  calYearTitle: (year) => `${year}`,

  // ── Workspace ──
  groupBoard: "Group",
  singleGroup: "Single",
  projectBoard: "Project",
  filter: "Filter",
  selectGroup: "Select group…",
  range: "Range",
  undoneOnly: "Not done only",
  priority: "Priority",
  status: "Status",
  bucket: "Bucket",
  selectGroupPrompt: "Select a group from the selector above",
  editGroup: "Edit Group",
  moveFailed: "Move failed. Reverted.",

  // ── Planning ──
  planning: "Planning",
  hideFilter: "Hide Filter",
  detailFilter: "Detail Filter",
  filterActive: "Filter active",

  // ── Settings ──
  settings: "Settings",
  exportBackup: "Export (Backup)",
  exportDesc: "Download all data (tasks, groups, projects, buckets) as a JSON file.",
  jsonExport: "Export JSON",
  importRestore: "Import (Restore)",
  importWarning: "Importing will overwrite all existing data. This cannot be undone. We recommend exporting first.",
  importExecute: "Import",
  processing: "Processing...",
  pwaInstall: "Install PWA",
  pwaDesc: "Select \"Add to Home Screen\" or \"Install App\" from your browser menu to install as an offline-capable app.",
  exportSuccess: "Export completed.",
  exportError: "Export failed: ",
  selectFile: "Please select a file.",
  importSuccess: "Import completed. Please reload the page.",
  jsonParseError: "Failed to parse JSON. The file may be corrupted.",
  backupFormatError: "Invalid backup format. Please select a valid export file.",
  language: "Language / 言語",
  languageDesc: "Switch the display language of the app.",

  // ── Task Drawer ──
  taskCreate: "Create Task",
  taskEdit: "Edit Task",
  title: "Title",
  taskNamePlaceholder: "Task name",
  titleRequired: "Title is required",
  dueDate: "Due Date",
  startTime: "Start Time",
  endTime: "End Time",
  endAfterStart: "End time must be after start time",
  memo: "Memo",
  memoPlaceholder: "Memo (optional)",
  groupCreate: "Create Group",
  projectCreate: "Create Project",
  groupNamePlaceholder: "Group name",
  projectNamePlaceholder: "Project name",
  belongsToGroup: "Belongs to Group",

  // ── Master Drawer ──
  masterCreate: (type) => `Create ${type}`,
  masterEdit: (type) => `Edit ${type}`,
  masterNameLabel: (type) => `${type} Name`,
  masterNamePlaceholder: (type) => `Enter ${type.toLowerCase()} name`,
  masterTypeGroup: "Group",
  masterTypeProject: "Project",
  masterTypeBucket: "Bucket",

  // ── FabMenu ──
  createMenu: "Create menu",

  // ── DayTasksDrawer ──
  noDueTasks: "No tasks due on this day",
  addTask: "+ Create Task",

  // ── CalendarDayTimeline ──
  unscheduled: "Unscheduled",
  noTasksThisDay: "No tasks on this day",

  // ── Recurrence ──
  weeklyRecurrence: (weekday) => `Weekly on ${weekday}`,
  monthlyDateRecurrence: (day) => `Monthly on day ${day}`,
  monthlyNthRecurrence: (nth, weekday) => `Monthly on ${nth}th ${weekday}`,
};
