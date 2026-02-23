# My Schedule

個人用タスク管理PWA（Vite + React + TypeScript + IndexedDB）

## ローカル起動

```bash
npm ci
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## データ保存

IndexedDB（DB名: `my-schedule-db`）にローカル永続化。ブラウザを閉じてもデータは保持される。

## 依存ライブラリ

- **react-router-dom** - ページルーティング
- **dexie** - IndexedDBラッパー

## 現在の実装状況（Cycle-01）

- タスクCRUD（追加/編集/完了トグル/論理削除）
- 一覧のフィルタ（状態/優先度/期限区分）
- 一覧のソート（期限昇順/優先度降順/更新日降順）

## 未対応（次サイクル以降）

- PWA（manifest / Service Worker / オフラインキャッシュ）
- ダッシュボード
- マスタ管理（グループ/プロジェクト/自由分類）
- 繰り返しタスク
- JSONエクスポート/インポート
- 検索
- テスト
