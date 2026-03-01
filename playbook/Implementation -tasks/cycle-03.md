# playbook/implementation-tasks/cycle-03.md
project: my-schedule
cycle: 03
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-03-pwa-and-backup`

---

## 1. Routing / Nav
### Update
- [ ] `/settings` を追加
- [ ] ナビに Settings を追加

### Acceptance
- Settings画面へ遷移できる

---

## 2. Backupデータ形式（JSON）
### Create
- [ ] `src/utils/exportImport.ts`
  - export形式（例）
    - schemaVersion: number（2）
    - exportedAt: string（ISO）
    - data:
      - tasks: Task[]
      - groups: Group[]
      - projects: Project[]
      - buckets: Bucket[]
  - JSON stringify（prettyは任意）
  - file download（Blob）

### Acceptance
- 形式が固定され、将来の互換に備えられる

---

## 3. DB: 全件取得 / 全削除 / 一括投入
### Create
- [ ] `src/db/backupRepo.ts`
  - `exportAll(): Promise<BackupJson>`
  - `importAll(backup: BackupJson): Promise<void>`
    - バリデーション（最低限：必要キー、配列、id/title など）
    - 全上書き：全ストアクリア → bulk put
  - bulk put は transaction でまとめる

### Acceptance
- Import後にすべて復元される
- 壊れたJSONなら途中で止まり、既存DBを壊さない（可能なら先に検証→実行）

---

## 4. Settings UI
### Create
- [ ] `src/pages/SettingsPage.tsx`
  - Export: ボタン→ダウンロード
  - Import:
    - file input
    - 実行ボタン
    - 成功/失敗のメッセージ
  - 注意書き（Importは全上書き）

### Acceptance
- UIでバックアップ/復元が完結

---

## 5. PWA有効化（テンプレBに合わせる）
### Tasks
- [ ] manifest追加/更新（名前、short_name、icons、start_url、display）
- [ ] service worker / vite設定（利用しているPWA方式に合わせて最小導入）
- [ ] オフライン起動確認（アプリシェルが開く）
- [ ] 外部通信なしを維持

### Acceptance
- ブラウザで「ホーム画面に追加」できる
- 機内モードでも起動できる

---

## 6. README更新
- [ ] PWA導入手順（インストール方法）
- [ ] Export/Import手順（運用ルールの推奨：定期Export）

---

## 7. Final check
- [ ] build OK
- [ ] Export→ファイル保存→DBクリア（手動）→Import→復元確認
- [ ] オフライン起動確認