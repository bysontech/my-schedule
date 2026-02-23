# 基本設計（最小）

## 画面・機能一覧

### 1. ダッシュボード画面（ホーム）
- 期限別カード表示（期限切れ / 今日 / 今週 / 今月の件数）
- 状態別・優先度別の件数サマリ
- 期限切れ・今日のタスク一覧（クイックアクセス）

### 2. タスク一覧画面
- タスクの一覧表示（カード or テーブル形式）
- 並び替え：期限昇順、優先度降順
- フィルタ：期限区分（期限切れ/今日/今週/今月）、優先度、状態、グループ、プロジェクト、自由分類（Bucket）
- タスク完了トグル（ワンタップ）
- タスク削除（論理削除）

### 3. タスク作成・編集画面（モーダル or ページ）
- タイトル（必須）
- 期限（date）
- 優先度（High / Med / Low）
- 状態（未着手 / 進行中 / 完了）
- メモ（任意テキスト）
- 大グループ選択（単一）
- プロジェクト選択（任意、単一）
- 自由分類（Bucket）選択（複数付与可）
- 繰り返し設定（なし / 毎週○曜日 / 毎月○日 / 毎月第N○曜日）

### 4. マスタ管理画面
- 大グループのCRUD
- プロジェクトのCRUD（所属グループ紐付け）
- 自由分類（Bucket）のCRUD

### 5. 設定画面
- JSONエクスポート（全データ一括バックアップ）
- JSONインポート（復元・移行）

---

## データモデル（最小）

### tasks（タスク）

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (ULID) | 主キー |
| title | string | タスク名（必須） |
| memo | string \| null | メモ |
| dueDate | string (YYYY-MM-DD) \| null | 期限 |
| priority | enum: high / med / low | 優先度 |
| status | enum: todo / in_progress / done | 状態 |
| groupId | string \| null | 大グループFK |
| projectId | string \| null | プロジェクトFK |
| bucketIds | string[] | 自由分類FK（複数） |
| recurrenceTemplateId | string \| null | 生成元テンプレートID（繰り返し由来の場合） |
| isDeleted | boolean | 論理削除フラグ |
| createdAt | string (ISO8601) | 作成日時 |
| updatedAt | string (ISO8601) | 更新日時 |

### recurrenceTemplates（繰り返しテンプレート）

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (ULID) | 主キー |
| title | string | テンプレ名 |
| memo | string \| null | メモ |
| priority | enum: high / med / low | 優先度 |
| groupId | string \| null | 大グループFK |
| projectId | string \| null | プロジェクトFK |
| bucketIds | string[] | 自由分類FK |
| recurrenceType | enum: weekly / monthly_date / monthly_nth | 繰り返し種別 |
| recurrenceValue | number | 週次→曜日(0-6)、月次日付→日(1-31)、第N曜日→エンコード値 |
| recurrenceNthWeek | number \| null | 第N曜日の場合のN（1-5） |
| isActive | boolean | 有効/無効 |
| lastGeneratedDate | string (YYYY-MM-DD) \| null | 最後にインスタンス生成した日付 |
| createdAt | string (ISO8601) | 作成日時 |

### groups（大グループ）

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (ULID) | 主キー |
| name | string | グループ名 |
| createdAt | string (ISO8601) | 作成日時 |

### projects（プロジェクト）

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (ULID) | 主キー |
| name | string | プロジェクト名 |
| groupId | string \| null | 所属グループFK |
| createdAt | string (ISO8601) | 作成日時 |

### buckets（自由分類）

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (ULID) | 主キー |
| name | string | 分類名 |
| createdAt | string (ISO8601) | 作成日時 |

### ER関係（概要）

```
group 1──N project
group 1──N task
project 1──N task
bucket N──N task（bucketIds配列で表現）
recurrenceTemplate 1──N task（生成元）
```

---

## API一覧

該当なし（テンプレB：フロントのみ、IndexedDBで完結）

---

## 非機能

- **コスト上限**：0円/月（静的ホスティング＋ローカルDB。GitHub Pages / Cloudflare Pages等の無料枠）
- **ログ方針**：console.errorによるクライアントログのみ。外部送信なし
- **監視最低限**：なし（個人用のため）。PWA動作確認はLighthouseで初期チェック
- **データ保持方針**：IndexedDBにローカル永続化。バックアップはJSONエクスポートで手動。ブラウザストレージクリアでデータ消失のリスクありのため、定期エクスポートを運用ルールとする

---

## セキュリティ最低限

- **秘密情報は環境変数管理**：MVP段階では秘密情報（APIキー等）を扱わないため該当なし。将来追加時は `.env` + ビルド時注入で管理
- **権限境界を明確にする**：シングルユーザー・ローカル完結のため認証不要。データはブラウザのオリジン分離（Same-Origin Policy）で保護
- **外部公開範囲を最小化**：外部通信なし（APIコール・分析ツール・CDN外のリソース読み込みなし）。Service Workerのスコープをアプリルートに限定