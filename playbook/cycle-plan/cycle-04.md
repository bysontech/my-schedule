# playbook/cycle-plan/cycle-04.md
project: my-schedule
cycle: 04
goal: 繰り返しテンプレを作成・管理し、アプリ起動時/表示時に次回タスクが自動生成される運用を成立させる

## Scope（このサイクルでやる）
### Must
- IndexedDB: recurrenceTemplates ストア追加（v3）
- 繰り返しテンプレ CRUD（Masters内にセクション追加 or 専用画面）
  - 週次（曜日指定）
  - 月次（日付指定）
  - 月次（第N曜日）
  - isActive のON/OFF
- 自動生成ロジック（テンプレ → Taskインスタンス生成）
  - タイミング: アプリ起動時、または Tasks画面表示時に実行
  - 方式: 「次回1件」を生成（必要なら過去分は作らない）
  - 二重生成防止:
    - 既存Taskに `recurrenceTemplateId` が一致し、かつ `dueDate` が同じものが存在すれば生成しない
    - テンプレ側の `lastGeneratedDate` を更新して安全弁にする
- Task作成フォームの繰り返し設定（新規のみでも可）
  - 「繰り返し設定あり」で保存した場合は
    - recurrenceTemplate を新規作成
    - 初回タスクも作成（通常タスク）
- Tasks画面で「繰り返し由来」表示（小さなバッジ程度でOK）

### Should（余裕があれば）
- テンプレ編集が既存生成済みタスクに影響しない（影響させない方針を明記）
- “完了時に次回生成” オプション（generateOn=COMPLETE）
  ※MVPは起動時生成のみでOK

## Out of Scope（やらない）
- 複雑な繰り返し（隔週、除外ルール、祝日移動）
- 過去未生成分の穴埋め大量生成
- 通知（Push）

## Definition of Done（完了条件）
- recurrenceTemplates を作成/編集/無効化できる
- Tasks画面を開くと、必要に応じて次回分が1件生成される
- 二重生成が起きない（リロード/再起動でも増殖しない）
- Export/Import に recurrenceTemplates が含まれる
- `npm run build` が通る

## Deliverables（成果物）
- `src/domain/recurrence.ts`
- `src/db/recurrenceRepo.ts`
- `src/utils/recurrenceEngine.ts`（次回日付計算 + 生成）
- `src/pages/RecurrenceTemplatesPage.tsx` または Masters拡張
- `src/pages/TaskFormPage.tsx` 更新（繰り返し設定UI）
- `src/pages/TasksPage.tsx` 更新（起動時生成の呼び出し）
- `src/db/backupRepo.ts` 更新（export/import対象に追加）
- README更新（繰り返しの仕様と注意点）

## Notes（仕様の割り切り）
- 生成単位は「次回1件」だけ（運用が安定するまで増やさない）
- 月次31日など存在しない日は「その月はスキップ」
- 第N曜日で第5が存在しない月は「その月はスキップ」