# playbook/implementation-tasks/cycle-11.md
project: my-schedule
cycle: 11
owner: claude-code

## 0. Branch
- branch: `feature/cycle-11-dashboard-calendar`

## 1. Calendar utilities
- [ ] `src/utils/calendar.ts`
  - getMonthGrid(year, month) -> 6x7 日付配列
  - getWeekDays(today) -> 月曜開始の7日
  - formatDate(YYYY-MM-DD)
  - tasksByDueDateMap(tasks)

## 2. Calendar components
- [ ] `src/components/CalendarMonth.tsx`
  - 日付セル + 件数（●n）
  - クリックで onSelectDate(date)
- [ ] `src/components/CalendarWeek.tsx`
  - 7日 + その日の期限タスク（TaskRowで表示）
  - クリックで onSelectDate(date)

## 3. DayDrawer
- [ ] `src/components/DayTasksDrawer.tsx`
  - 選択日付の tasks（dueDate一致）を TaskRowで表示
  - 完了トグル可能
  - …メニュー→編集（TaskEditDrawerを開く）
  - doneは薄く表示、基本は表示してOK（必要ならトグル）

## 4. Dashboard統合
- [ ] `src/pages/DashboardPage.tsx`
  - カレンダーセクション追加
  - Week/Month切替
  - 日付選択で DayTasksDrawer を開く

## 5. Final check
- [ ] build OK
- [ ] Month件数表示が正しい
- [ ] DayDrawerで完了/編集ができ、Dashboardに反映される