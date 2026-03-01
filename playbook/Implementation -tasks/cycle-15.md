# playbook/implementation-tasks/cycle-15.md
project: my-schedule
cycle: 15
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-15-planning-calendar`

---

## 1. Planning 画面をカレンダー中心に刷新
### Update / Create
- [ ] `src/pages/PlanningPage.tsx`
  - 初期表示はカレンダー（Month推奨）
  - 表示切替：Week / Month / Year（トグル or タブ）
  - 画面上部にナビ
    - Prev / Next（表示単位に応じて週/月/年で移動）
    - Today（今日へジャンプ）
  - 右側 or 下部に「選択日タスク」表示（任意）
    - まずは DayDrawer を流用してもOK

### Acceptance
- /planning を開くとカレンダーが出る
- Week/Month/Year 切替と Prev/Next/Today が動く

---

## 2. フィルタ（折りたたみ）実装
### Update / Create
- [ ] `src/components/PlanningFilters.tsx`（新規） or `PlanningPage` 内で実装
  - 折りたたみ：デフォルト非表示、「詳細フィルタ」で展開
  - フィルタ項目
    - groupId（単一）
    - projectId（単一、groupに応じて絞り込み）
    - bucketId（単一でも可。余裕あれば複数）
    - priority（high/med/low）
    - status（todo/in_progress/done）
  - 既存mastersRepoを利用して選択肢を取得

### Acceptance
- フィルタがUIとして存在し、開閉できる

---

## 3. フィルタ連動（カレンダー上の印が変わる）
### Update / Create
- [ ] `src/utils/planningFilter.ts`
  - `applyPlanningFilter(tasks, filterState): Task[]`
- [ ] `src/utils/calendarTaskMap.ts`（既存があれば統合）
  - `buildDueDateCountMap(tasks): Map<YYYY-MM-DD, number>`
  - `buildDueDateHighCountMap(tasks): Map<YYYY-MM-DD, number>`（任意）
- [ ] `PlanningPage` で
  - tasksRepo.listTasks() 取得（isDeleted=false）
  - applyPlanningFilter → filteredTasks
  - filteredTasks を元に “タスクあり印（ドット/件数）” を描画

### 印（実装方針）
- Month/Year: 日付セルに `●n` or `n` を表示（nはfilteredTasksのdue一致件数）
- Week: 7列グリッド（Cycle-14のCalendarWeekGridを流用可）
  - 日ごとに件数/タスクを表示（filteredTasksベース）

### Acceptance
- フィルタを変えると、セルの件数/ドットが即座に変わる

---

## 4. カレンダーセルからタスク作成（ドロワー）
### Update
- [ ] `PlanningPage`
  - 日付セルクリックで DayDrawer を開く（その日の期限タスク一覧）
  - DayDrawer の「+」から TaskDrawer create を開く
    - `defaultDueDate = 選択日`
  - もしくはセル内に「+」を置いて直接 TaskDrawer create でもOK

### Acceptance
- Planningからページ遷移なしで “その日付のタスク作成” ができる

---

## 5. Year 表示（最小）
### Create
- [ ] `src/components/CalendarYear.tsx`
  - 12ヶ月のミニMonthグリッドを並べる（簡易でOK）
  - 各月セルに “その日の件数” を表示する必要はない
    - 最小は「各月の総件数（filteredTasksでdueがその月にある数）」の表示でもOK
  - 月クリックで Month 表示へ切替 + 対象月へ移動

### Acceptance
- Yearに切替でき、Monthへ遷移できる

---

## 6. 状態保持（最低限）
- [ ] PlanningPage内 state で
  - viewMode（week/month/year）
  - cursorDate（表示基準日）
  - filterState
  - selectedDate（DayDrawer用）
  を保持し、ドロワー開閉で崩れないようにする

### Acceptance
- ドロワーを閉じても表示月/フィルタが維持される

---

## 7. Final check
- [ ] `npm run build` OK
- [ ] Week/Month/Year 切替 OK
- [ ] Prev/Next/Today OK
- [ ] フィルタ連動で件数が変化 OK
- [ ] セル→DayDrawer→+→TaskDrawer create OK
- [ ] 保存後に印/一覧が更新される