# cycle-plan/cycle-01.md
project: my-schedule
cycle: 01
goal: タスクCRUD（論理削除含む）＋IndexedDB永続化＋タスク一覧の基本フィルタ/ソートまでを最小UIで完成させる

## Scope（このサイクルでやる）
### Must
- Vite + React + TS の土台（テンプレB想定）
- ルーティング（最低限）
  - /tasks（タスク一覧）
  - /tasks/new（作成）
  - /tasks/:id/edit（編集）
  ※ダッシュボード/マスタ管理/設定は次サイクル以降
- IndexedDB 永続化
  - tasks ストアのみ実装（groups/projects/buckets/recurrenceTemplatesは未実装でOK）
- タスクCRUD
  - 追加/編集/完了トグル/論理削除
- 一覧操作（最小）
  - ソート：期限昇順、優先度降順（同順位は updatedAt desc）
  - フィルタ：状態、優先度、期限区分（期限切れ/今日/今週/今月）
  - ※グループ/プロジェクト/バケットのUIは未実装 or ダミーでOK（次サイクル）
- 型定義（Task）
- 最低限のUI（見た目は素朴でOK、使えること優先）

### Should（余裕があれば）
- 空状態（0件時）/ エラー表示
- localStorage 等ではなく IndexedDB を必須にする（idb等の薄いラッパー利用は可）
- seed（初回起動時にサンプルタスクを1〜2件作る）は任意

## Out of Scope（やらない）
- PWA（manifest / service worker / offline cache）
- ダッシュボード
- マスタ管理（groups/projects/buckets）
- 繰り返しテンプレートと自動生成
- JSON import/export
- 検索
- テスト（unit/e2e）

## Definition of Done（完了条件）
- ブラウザ再起動後も tasks が残る（IndexedDB）
- タスクを追加→一覧に表示→編集→完了→削除（論理削除）まで一通り動く
- フィルタ（状態/優先度/期限区分）とソートが機能する
- TypeScript で型エラーなくビルドできる

## Deliverables（成果物）
- `src/domain/task.ts`（Task型・enum）
- `src/db/indexedDb.ts`（DB初期化）
- `src/db/tasksRepo.ts`（tasks CRUD）
- `src/pages/TasksPage.tsx`（一覧）
- `src/pages/TaskFormPage.tsx`（作成/編集）
- `src/router.tsx`（ルーティング）
- `README.md` にローカル起動手順（最低限）

## Notes（実装メモ）
- id: ULID推奨（ライブラリ追加が嫌なら crypto.randomUUID() でもOK）
- 日付は `YYYY-MM-DD` 文字列で統一
- 期限区分の判定はローカルタイム（Asia/Tokyo前提）でOK