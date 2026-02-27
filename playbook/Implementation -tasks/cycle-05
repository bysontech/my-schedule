# playbook/implementation-tasks/cycle-05.md
project: my-schedule
cycle: 05
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-05-dashboard`

---

## 1. Routing / Nav
### Update
- [ ] `src/router.tsx`
  - `/dashboard` を追加
  - `/` を `/dashboard` にリダイレクト（または `/` をDashboardに）
- [ ] ナビに Dashboard を追加（先頭）

### Acceptance
- ダッシュボードに遷移できる

---

## 2. Aggregation utilities
### Create
- [ ] `src/utils/taskAggregations.ts`
  - `getDueBucket(task, today): "none" | "overdue" | "today" | "thisWeek" | "thisMonth"`
  - `aggregateCounts(tasks)`
    - dueCounts: { overdue, today, thisWeek, thisMonth }
    - statusCounts: { todo, in_progress, done }
    - priorityCounts: { high, med, low }
  - “今週”は月曜開始、today含む

### Acceptance
- Dashboard/Tasksで再利用できる

---

## 3. Dashboard page
### Create
- [ ] `src/pages/DashboardPage.tsx`
  - tasksRepo.listTasks() で取得（isDeleted=falseのみ）
  - 集計カード表示（期限/状態/優先度）
  - クイック一覧
    - overdue（todo + in_progress）上限10
    - today（todo + in_progress）上限10
  - カードクリックで `/tasks?...` に遷移（クエリ付与）
  - クイック一覧クリック:
    - クリックで編集へ（/tasks/:id/edit）でもOK
    - もしくはTasksへ遷移でもOK（どちらか統一）

### Acceptance
- 開いた瞬間に “今やるべき” が見える

---

## 4. TasksPage: query param 初期フィルタ対応
### Update
- [ ] `src/pages/TasksPage.tsx`
  - 対応クエリ例
    - due=overdue|today|thisWeek|thisMonth
    - status=todo|in_progress|done
    - priority=high|med|low
    - groupId / projectId / bucketId も余裕があれば
  - URLクエリがある場合は初期状態に反映
  - フィルタUI操作でクエリを更新する必要は無し（初期反映だけでOK）

### Acceptance
- Dashboard→Tasks遷移でフィルタが効く

---

## 5. README更新
- [ ] 画面導線（Dashboard / Tasks / Masters / Repeat / Settings）
- [ ] “今日やること”の見方（Dashboard推奨）

---

## 6. Final check
- [ ] build OK
- [ ] Dashboardの件数がTasksの絞り込みと整合
- [ ] カード→Tasksの初期フィルタが反映