# My Schedule

個人用タスク管理PWA。Vite + React + TypeScript で構築し、データは IndexedDB にローカル保存。オフラインでも利用可能。

## 主な機能

- **タスク管理** … 追加・編集・完了トグル・削除。期限・優先度・状態（未着手/進行中/完了）・グループ/プロジェクト/Bucket での分類。
- **ダッシュボード** … 全体サマリ（件数・完了率）、期限切れ/今日/今週のクイック一覧、カレンダー（日/週/月）、分野別進捗。
- **ワークスペース** … グループまたはプロジェクトごとのカンバン表示。ドラッグ＆ドロップでタスク移動、フィルタ。
- **Planning** … 日/週/月/年表示のカレンダーとタスク一覧。フィルタ・日付クリックでその日のタスクを表示。
- **繰り返し** … 毎週・毎月などのテンプレートでタスクを自動生成。ダッシュボード表示時に次回分を生成。
- **マスタ** … グループ・プロジェクト・Bucket の CRUD。タスクに紐づけて分類。
- **バックアップ** … 全データを JSON でエクスポート/インポート（Settings 画面）。

## 技術スタック

- **フロント** … React 18, React Router, TypeScript
- **ストレージ** … Dexie（IndexedDB）
- **ビルド** … Vite 6
- **PWA** … vite-plugin-pwa（manifest, Service Worker, オフラインキャッシュ）

## ローカル起動

```bash
npm ci
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## PWA インストール

1. `npm run build && npm run preview` でプロダクションビルドを起動
2. ブラウザの「ホーム画面に追加」または「アプリをインストール」を選択
3. インストール後はオフラインでも起動可能

## データ・バックアップ

- データは **IndexedDB**（DB名: `my-schedule-db`）に保存。ブラウザを閉じても保持される。
- **Settings** から全データを JSON でエクスポート/インポート可能。ストレージクリアに備え、定期的なエクスポートを推奨。

## 依存・脆弱性

- 主要ライブラリ: react-router-dom, dexie, react-virtuoso
- `npm audit fix` で安全に直せる脆弱性は随時対応。残りは vite-plugin-pwa のビルド時依存にあり、upstream の更新を待つか `npm audit fix --force`（非推奨）で解消可能。定期的に `npm audit` を実行することを推奨。
