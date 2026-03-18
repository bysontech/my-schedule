import type { Translations } from "./types";

export const ja: Translations = {
  // ── App / Nav ──
  appTitle: "My Schedule",
  navHome: "Home",
  navWorkspace: "Workspace",
  navPlanning: "Planning",
  navSettings: "Settings",
  loading: "読み込み中…",

  // ── Common ──
  create: "作成",
  save: "保存",
  cancel: "キャンセル",
  back: "戻る",
  edit: "編集",
  delete_: "削除",
  none: "なし",
  all: "すべて",
  today: "今日",
  menu: "メニュー",
  uncategorized: "未分類",
  unknown: "不明",
  noTasks: "タスクなし",
  noTargetTasks: "対象タスクなし",
  nameRequired: "名前は必須です",

  // ── Task status ──
  statusTodo: "未着手",
  statusInProgress: "進行中",
  statusDone: "完了",

  // ── Priority ──
  priorityHigh: "High",
  priorityMed: "Med",
  priorityLow: "Low",

  // ── Due buckets ──
  dueOverdue: "期限切れ",
  dueToday: "今日",
  dueThisWeek: "今週",
  dueThisMonth: "今月",

  // ── Calendar ──
  calendar: "カレンダー",
  calDay: "日",
  calWeek: "週",
  calMonth: "月",
  calYear: "年",
  calToday: "今日",
  weekdaysShort: ["月", "火", "水", "木", "金", "土", "日"],
  weekdaysSun: ["日", "月", "火", "水", "木", "金", "土"],
  monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],

  // ── Dashboard ──
  strategySummary: "戦略サマリー",
  totalTasks: "総タスク",
  inProgress: "進行中",
  completionRate: "完了率",
  weeklyRate: "今週達成率",
  dangerZone: "危険ゾーン",
  overdue: "期限切れ",
  todayDue: "今日期限",
  thisWeekHigh: "今週 High",
  fieldProgress: "分野別進捗",
  group: "グループ",
  project: "プロジェクト",
  thisWeek: "今週",
  thisMonth: "今月",
  createTask: "タスク作成",
  undoMarkedNotDone: "未完了に戻しました",
  undoMarkedDone: "完了にしました",
  undo: "元に戻す",

  // ── Calendar title format ──
  calMonthTitle: (year, month) => `${year}年${month}月`,
  calYearTitle: (year) => `${year}年`,

  // ── Workspace ──
  groupBoard: "グループ",
  singleGroup: "単一",
  projectBoard: "プロジェクト",
  filter: "フィルタ",
  selectGroup: "グループを選択…",
  range: "範囲",
  undoneOnly: "未完了のみ",
  priority: "優先度",
  status: "状態",
  bucket: "Bucket",
  selectGroupPrompt: "上のセレクタからグループを選択してください",
  editGroup: "グループ編集",
  moveFailed: "移動に失敗しました。元に戻しました。",

  // ── Planning ──
  planning: "Planning",
  hideFilter: "フィルタを隠す",
  detailFilter: "詳細フィルタ",
  filterActive: "フィルタ適用中",

  // ── Settings ──
  settings: "Settings",
  exportBackup: "Export (バックアップ)",
  exportDesc: "全データ（タスク・グループ・プロジェクト・Bucket）をJSONファイルとしてダウンロードします。",
  jsonExport: "JSONエクスポート",
  importRestore: "Import (復元)",
  importWarning: "インポートすると既存データは全て上書きされます。この操作は取り消せません。事前にエクスポートすることを推奨します。",
  importExecute: "インポート実行",
  processing: "処理中...",
  pwaInstall: "PWAインストール",
  pwaDesc: "ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選択すると、オフラインでも利用できるアプリとしてインストールできます。",
  exportSuccess: "エクスポートが完了しました。",
  exportError: "エクスポートに失敗しました: ",
  selectFile: "ファイルを選択してください。",
  importSuccess: "インポートが完了しました。ページを再読み込みしてください。",
  jsonParseError: "JSONの解析に失敗しました。ファイルが壊れている可能性があります。",
  backupFormatError: "バックアップ形式が不正です。正しいエクスポートファイルを選択してください。",
  language: "言語 / Language",
  languageDesc: "アプリの表示言語を切り替えます。",

  // ── Task Drawer ──
  taskCreate: "タスク作成",
  taskEdit: "タスク編集",
  title: "タイトル",
  taskNamePlaceholder: "タスク名",
  titleRequired: "タイトルは必須です",
  dueDate: "期限",
  startTime: "開始時刻",
  endTime: "終了時刻",
  endAfterStart: "終了は開始より後にしてください",
  memo: "メモ",
  memoPlaceholder: "メモ（任意）",
  groupCreate: "グループ作成",
  projectCreate: "プロジェクト作成",
  groupNamePlaceholder: "グループ名",
  projectNamePlaceholder: "プロジェクト名",
  belongsToGroup: "所属グループ",

  // ── Master Drawer ──
  masterCreate: (type) => `${type}作成`,
  masterEdit: (type) => `${type}編集`,
  masterNameLabel: (type) => `${type}名`,
  masterNamePlaceholder: (type) => `${type}名を入力`,
  masterTypeGroup: "グループ",
  masterTypeProject: "プロジェクト",
  masterTypeBucket: "Bucket",

  // ── FabMenu ──
  createMenu: "作成メニュー",

  // ── DayTasksDrawer ──
  noDueTasks: "この日の期限タスクはありません",
  addTask: "+ タスク作成",

  // ── CalendarDayTimeline ──
  unscheduled: "未定",
  noTasksThisDay: "この日のタスクはありません",

  // ── Recurrence ──
  weeklyRecurrence: (weekday) => `毎週${weekday}曜日`,
  monthlyDateRecurrence: (day) => `毎月${day}日`,
  monthlyNthRecurrence: (nth, weekday) => `毎月第${nth}${weekday}曜日`,
};
