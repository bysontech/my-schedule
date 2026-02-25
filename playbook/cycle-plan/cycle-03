# playbook/cycle-plan/cycle-03.md
project: my-schedule
cycle: 03
goal: PWA化（ホーム追加・オフライン起動）とJSONバックアップ/復元を実装し、日常運用の安定性を上げる

## Scope（このサイクルでやる）
### Must
- PWA有効化
  - manifest（名前/アイコン/テーマカラー）
  - service worker（最低限のプリキャッシュ）
  - オフライン起動（アプリシェルが開く）
- JSONエクスポート（全データ）
  - tasks / groups / projects / buckets / （将来用にrecurrenceTemplatesは無くてもOK）
  - 1ファイルでダウンロードできる
- JSONインポート（復元・移行）
  - 方式：初回は「全上書き」でOK（既存データ削除→投入）
  - 破損JSON時はエラー表示して中断
- 設定画面（/settings）
  - Exportボタン
  - Import（ファイル選択 + 実行ボタン）
  - 注意書き（上書き/戻せない等）

### Should（余裕があれば）
- インポート方式の選択（上書き / マージ）※まずは上書き優先
- バックアップに `schemaVersion` / `exportedAt` を含める
- オフライン時の簡易バナー（Offline）

## Out of Scope（やらない）
- recurrenceTemplates/繰り返し自動生成
- ダッシュボードの強化（グラフなど）
- 検索
- テスト追加
- Push通知
- 端末間同期

## Definition of Done（完了条件）
- PWAとしてインストール（ホーム追加）できる
- オフラインでアプリが起動する（最低でも /tasks が表示できる）
- ExportでJSONがダウンロードでき、Importで復元できる
- Import後に tasks/masters が正しく表示される
- `npm run build` が通る

## Deliverables（成果物）
- `src/pages/SettingsPage.tsx`
- `src/utils/exportImport.ts`（export/importロジック）
- `src/db/backupRepo.ts`（全ストア読み出し/全削除/全投入）
- PWA設定（テンプレBの方式に合わせて設定ファイル追加/更新）
- `src/router.tsx` 更新（/settings）
- README更新（PWA手順・バックアップ手順）

## Notes
- Importは「全上書き」から開始する（事故りにくい）
- 既存IndexedDBのversionは維持（v2のままでOK。ストア追加無しなら上げない）