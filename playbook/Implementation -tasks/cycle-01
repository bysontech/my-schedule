# implementation-tasks/cycle-01.md
project: my-schedule
cycle: 01
owner: claude-code
priority: Must first

## 0. Branch / Commit
- branch: `feature/cycle-01-core-tasks`
- commits: 小さめに分割（db層→pages→routing→仕上げ）

---

## 1. Project bootstrap（既に雛形があるならスキップ可）
### Tasks
- [ ] Vite + React + TypeScript プロジェクトとして起動確認
- [ ] eslint/tsconfig が標準で動く状態（追加ルールは最小）
- [ ] 依存追加は最小限（idb/ulid 等を入れる場合は理由をREADMEに一言）

### Acceptance
- `npm run dev` で起動できる
- `npm run build` が通る

---

## 2. Domain model（Task）
### Create
- [ ] `src/domain/task.ts`
  - `TaskPriority = "high" | "med" | "low"`
  - `TaskStatus = "todo" | "in_progress" | "done"`
  - `Task` interface
    - id, title, memo, dueDate, priority, status, groupId, projectId, bucketIds, recurrenceTemplateId, isDeleted, createdAt, updatedAt
  - `createEmptyTask()`（フォーム初期値用）
  - `priorityOrder()`（high>med>low）

### Acceptance
- Task型がUI/DBで共通利用される

---

## 3. IndexedDB layer（tasksのみ）
### Create
- [ ] `src/db/indexedDb.ts`
  - DB名: `my-schedule-db`
  - version: 1
  - objectStore: `tasks`（keyPath: `id`）
  - indexes（最低限）: `dueDate`, `status`, `priority`, `isDeleted`, `updatedAt`
- [ ] `src/db/tasksRepo.ts`
  - `listTasks(): Promise<Task[]>`（isDeleted=falseのみ）
  - `getTask(id): Promise<Task | null>`
  - `upsertTask(task): Promise<void>`
  - `toggleDone(id): Promise<void>`
  - `softDeleteTask(id): Promise<void>`

### Implementation rules
- isDeleted=true で論理削除
- updatedAt は更新時に必ず更新
- list は「まず全部取得→UI側でフィルタ/ソート」でもOK（最初は簡単に）

### Acceptance
- DevToolsでIndexedDBにtasksが作られ、CRUDで反映される

---

## 4. Routing（最小）
### Create
- [ ] `src/router.tsx`（React Router）
  - `/tasks` 一覧
  - `/tasks/new` 作成
  - `/tasks/:id/edit` 編集
  - `/` は `/tasks` にリダイレクト

### Acceptance
- URLでページ遷移できる

---

## 5. UI: Tasks list page
### Create
- [ ] `src/pages/TasksPage.tsx`
  - 初回ロードで `listTasks()` を取得して表示
  - 表示項目: title, dueDate, priority, status
  - 操作:
    - 完了トグル（todo/in_progress→done、done→todo でOK。in_progress扱いはフォームで変更）
    - 編集へ遷移
    - 削除（論理削除）
  - フィルタ（MVP最小）:
    - status（all/todo/in_progress/done）
    - priority（all/high/med/low）
    - dueBucket（all/overdue/today/thisWeek/thisMonth）
  - ソート:
    - dueDate asc（nullは最後）
    - priority desc
    - updatedAt desc

### Notes
- 期限区分判定は helper に切り出し
  - `src/utils/dateBuckets.ts` 等

### Acceptance
- 追加したタスクが一覧に出て、フィルタ/ソートが効く

---

## 6. UI: Task form (create/edit)
### Create
- [ ] `src/pages/TaskFormPage.tsx`
  - new/edit 両対応
  - フィールド:
    - title（必須バリデーション）
    - dueDate（date）
    - priority（select）
    - status（select）
    - memo（textarea）
    - groupId/projectId/bucketIds は未実装でOK（hidden or placeholder）
  - 保存で upsert → 一覧へ戻る
  - キャンセルで戻る

### Acceptance
- 新規作成と編集ができる
- title未入力は保存できない

---

## 7. Minimal layout / navigation
### Tasks
- [ ] `src/App.tsx` に最低限のナビ（Tasks / New）
- [ ] 余計なデザインは不要。使いやすさ優先（ボタン配置と余白だけ整える）

### Acceptance
- 迷わず操作できる

---

## 8. README
### Update
- [ ] ローカル起動手順
- [ ] データ保存がIndexedDBであること
- [ ] Cycle-01で未対応の範囲（PWA/繰り返し/マスタ/バックアップ）

### Acceptance
- 初見で起動できる

---

## 9. Final check
- [ ] build が通る
- [ ] 一連動作（追加→編集→完了→削除→リロード）確認
- [ ] `feature/cycle-01-core-tasks` をPR化できる状態にする（CIがあればgreen）