# playbook/cycle-plan/cycle-02.md
project: my-schedule
cycle: 02
goal: グループ/プロジェクト/BucketのマスタCRUDを実装し、タスクに紐付けて一覧で絞り込める状態にする（整理軸の導入）

## Scope（このサイクルでやる）
### Must
- IndexedDB ストア追加
  - groups / projects / buckets
- マスタ管理画面（CRUD）
  - /masters（タブ or セクションで3種を管理）
  - Group: 追加/編集/削除（論理削除 or 物理削除どちらでも可。MVPは物理削除OK）
  - Project: 追加/編集/削除 + groupId紐付け
  - Bucket: 追加/編集/削除
- タスク作成・編集フォームを拡張
  - groupId（単一選択）
  - projectId（単一選択、groupIdに依存して絞り込み）
  - bucketIds（複数選択）
- タスク一覧のフィルタ拡張
  - groupId / projectId / bucketId（bucketIdsに含む）で絞り込み
- 最小ナビに「Masters」追加

### Should（余裕があれば）
- 削除ガード
  - Group削除時：紐付くProject/Taskがある場合は削除不可 or 警告
  - Project削除時：紐付くTaskがある場合は警告
  - Bucket削除時：紐付くTaskがある場合は警告
- “未分類” の扱い
  - groupId=null のタスクを一覧で「未分類」扱いできるフィルタ
- マスタ名の重複チェック（同一種別内でname重複を警告）

## Out of Scope（やらない）
- PWA（manifest / service worker）
- JSON import/export
- recurrenceTemplates と自動生成
- 検索（全文）
- ダッシュボード強化（Cycle-03以降）
- テスト追加

## Definition of Done（完了条件）
- groups/projects/buckets を作成・編集・削除できる
- タスクに group/project/bucket を付与して保存できる（IndexedDBに永続化）
- 一覧で group/project/bucket フィルタが動く
- ブラウザ再起動後もマスタ/タスクが保持される
- `npm run build` が通る

## Deliverables（成果物）
- `src/domain/master.ts`（Group/Project/Bucket型）
- `src/db/*Repo.ts`（groupsRepo/projectsRepo/bucketsRepo）
- `src/pages/MastersPage.tsx`（マスタ管理画面）
- `src/pages/TaskFormPage.tsx` 更新（選択UI追加）
- `src/pages/TasksPage.tsx` 更新（フィルタ追加）
- `src/router.tsx` 更新（/masters 追加）
- README更新（Cycle-02で追加された使い方）

## Notes
- タスクの groupId/projectId は null 許容のまま（運用に合わせて後で必須化も可）
- Bucketは複数付与が前提。UIはチェックボックス/タグ選択の簡易でOK