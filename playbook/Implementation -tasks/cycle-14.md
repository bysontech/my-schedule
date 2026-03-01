# playbook/implementation-tasks/cycle-14.md
project: my-schedule
cycle: 14
owner: claude-code

## 0. Branch
- branch: `feature/cycle-14-dashboard-week-calendar`

## 1. CalendarWeekGrid
- [ ] `src/components/CalendarWeekGrid.tsx`
  - 7列グリッド
  - 各日：date label + counts + tasks（due一致のみ）
  - tasks表示はコンパクト（TaskRowのvariant）

## 2. Navigation
- [ ] Dashboardに
  - Prev/Next
  - Today
  - Week/Month toggle
- [ ] 週/月で移動単位が変わる

## 3. DayDrawer強化
- [ ] DayDrawerに「+」追加（選択日でTaskDrawer create）
- [ ] 既存タスククリックで edit drawer

## 4. Final check
- [ ] build OK
- [ ] 週表示が縦リストになっていない