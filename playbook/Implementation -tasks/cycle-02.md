# playbook/implementation-tasks/cycle-02.md
project: my-schedule
cycle: 02
owner: claude-code
priority: Must first

## 0. Branch / Commit
- branch: `feature/cycle-02-masters-and-filters`

---

## 1. Domain model（masters）
### Create
- [ ] `src/domain/master.ts`
  - `Group { id, name, createdAt }`
  - `Project { id, name, groupId, createdAt }`
  - `Bucket { id, name, createdAt }`

### Acceptance
- Taskフォーム/一覧/マスタ画面で共通利用される

---

## 2. IndexedDB store追加
### Update
- [ ] `src/db/indexedDb.ts` を version: 2 に上げる
- [ ] objectStore追加
  - `groups`（keyPath: id）
  - `projects`（keyPath: id） index: groupId
  - `buckets`（keyPath: id）
- [ ] 既存 `tasks` は維持（マイグレーションで壊さない）

### Acceptance
- 既存tasksが消えない
- DevToolsで新ストアが見える

---

## 3. Repo実装
### Create
- [ ] `src/db/groupsRepo.ts`
  - list / get / upsert / delete
- [ ] `src/db/projectsRepo.ts`
  - list / listByGroup(groupId) / get / upsert / delete
- [ ] `src/db/bucketsRepo.ts`
  - list / get / upsert / delete

### Acceptance
- CRUDが動作し、再起動後も残る

---

## 4. Masters UI
### Create
- [ ] `src/pages/MastersPage.tsx`
  - セクション3つ（Groups / Projects / Buckets）
  - それぞれ
    - 一覧
    - 追加（name入力）
    - 編集（name更新）
    - 削除
  - Projectは groupId を選択して作成/編集できる

### Should（余裕があれば）
- [ ] 削除ガード（紐付くTaskがあれば警告 or արգել）

### Acceptance
- 3種類のマスタを管理できる

---

## 5. TaskForm拡張（マスタ紐付け）
### Update
- [ ] `src/pages/TaskFormPage.tsx`
  - groups を読み込み、groupId選択（select）
  - groupIdに応じて projects を絞り込み（select）
  - buckets を読み込み、bucketIds 複数選択（checkbox でOK）
  - 保存時に task.groupId / task.projectId / task.bucketIds を保持

### Acceptance
- タスクに分類を付けて保存できる

---

## 6. TasksPage フィルタ拡張
### Update
- [ ] `src/pages/TasksPage.tsx`
  - groupフィルタ
  - projectフィルタ（group選択時はその配下だけ表示）
  - bucketフィルタ（task.bucketIds.includes(bucketId)）
  - フィルタUIのラベルは簡易でOK（名前表示）

### Acceptance
- 分類で絞り込みができる

---

## 7. Routing / Nav
### Update
- [ ] `src/router.tsx` に `/masters` を追加
- [ ] ナビに Masters を追加

### Acceptance
- 画面遷移できる

---

## 8. README更新
- [ ] Mastersの使い方（作ってからタスクに付与する流れ）
- [ ] Cycle-02時点の未対応（PWA/繰り返し/バックアップ）

---

## 9. Final check
- [ ] npm run build
- [ ] 既存tasksが消えていないこと
- [ ] masters作成→タスクに紐付け→一覧フィルタ→再起動後も保持