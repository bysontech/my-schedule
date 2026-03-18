export type Locale = "ja" | "en";

export interface Translations {
  // ── App / Nav ──
  appTitle: string;
  navHome: string;
  navWorkspace: string;
  navPlanning: string;
  navSettings: string;
  loading: string;

  // ── Common ──
  create: string;
  save: string;
  cancel: string;
  back: string;
  edit: string;
  delete_: string;
  none: string;
  all: string;
  today: string;
  menu: string;
  uncategorized: string;
  unknown: string;
  noTasks: string;
  noTargetTasks: string;
  nameRequired: string;

  // ── Task status ──
  statusTodo: string;
  statusInProgress: string;
  statusDone: string;

  // ── Priority ──
  priorityHigh: string;
  priorityMed: string;
  priorityLow: string;

  // ── Due buckets ──
  dueOverdue: string;
  dueToday: string;
  dueThisWeek: string;
  dueThisMonth: string;

  // ── Calendar ──
  calendar: string;
  calDay: string;
  calWeek: string;
  calMonth: string;
  calYear: string;
  calToday: string;
  weekdaysShort: string[]; // Mon-Sun (7 items, Monday first)
  weekdaysSun: string[];   // Sun-Sat (7 items, Sunday first)
  monthNames: string[];    // 12 months

  // ── Dashboard ──
  strategySummary: string;
  totalTasks: string;
  inProgress: string;
  completionRate: string;
  weeklyRate: string;
  dangerZone: string;
  overdue: string;
  todayDue: string;
  thisWeekHigh: string;
  fieldProgress: string;
  group: string;
  project: string;
  thisWeek: string;
  thisMonth: string;
  createTask: string;
  undoMarkedNotDone: string;
  undoMarkedDone: string;
  undo: string;

  // ── Calendar title format ──
  calMonthTitle: (year: number, month: number) => string;
  calYearTitle: (year: number) => string;

  // ── Workspace ──
  groupBoard: string;
  singleGroup: string;
  projectBoard: string;
  filter: string;
  selectGroup: string;
  range: string;
  undoneOnly: string;
  priority: string;
  status: string;
  bucket: string;
  selectGroupPrompt: string;
  editGroup: string;
  moveFailed: string;

  // ── Planning ──
  planning: string;
  hideFilter: string;
  detailFilter: string;
  filterActive: string;

  // ── Settings ──
  settings: string;
  exportBackup: string;
  exportDesc: string;
  jsonExport: string;
  importRestore: string;
  importWarning: string;
  importExecute: string;
  processing: string;
  pwaInstall: string;
  pwaDesc: string;
  exportSuccess: string;
  exportError: string;
  selectFile: string;
  importSuccess: string;
  jsonParseError: string;
  backupFormatError: string;
  language: string;
  languageDesc: string;

  // ── Task Drawer ──
  taskCreate: string;
  taskEdit: string;
  title: string;
  taskNamePlaceholder: string;
  titleRequired: string;
  dueDate: string;
  startTime: string;
  endTime: string;
  endAfterStart: string;
  memo: string;
  memoPlaceholder: string;
  groupCreate: string;
  projectCreate: string;
  groupNamePlaceholder: string;
  projectNamePlaceholder: string;
  belongsToGroup: string;

  // ── Master Drawer ──
  masterCreate: (type: string) => string;
  masterEdit: (type: string) => string;
  masterNameLabel: (type: string) => string;
  masterNamePlaceholder: (type: string) => string;
  masterTypeGroup: string;
  masterTypeProject: string;
  masterTypeBucket: string;

  // ── FabMenu ──
  createMenu: string;

  // ── DayTasksDrawer ──
  noDueTasks: string;
  addTask: string;

  // ── CalendarDayTimeline ──
  unscheduled: string;
  noTasksThisDay: string;

  // ── Recurrence ──
  weeklyRecurrence: (weekday: string) => string;
  monthlyDateRecurrence: (day: number) => string;
  monthlyNthRecurrence: (nth: number, weekday: string) => string;
}
