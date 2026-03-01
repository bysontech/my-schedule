# playbook/implementation-tasks/cycle-06.md
project: my-schedule
cycle: 06
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-06-focus-and-planning-ui`

---

## 1. Routing / Nav（3層の導線）
- [ ] `src/router.tsx` に `/focus` を追加
- [ ] ナビ構成を3層に合わせる（例）
  - Dashboard
  - Focus
  - Planning（Tasks）
  - Masters / Repeat / Settings は Planning 側に置く（並びは任意）

Acceptance:
- 3画面（Dashboard/Focus/Tasks）へ迷わず移動できる

---

## 2. 優先度アイコン（色ではなく記号）
- [ ] `src/utils/priorityIcon.ts`（または同等）
  - high: "↑"
  - med: "→"
  - low: "↓"

Acceptance:
- Tasks/Focus 両方で共通利用できる

---

## 3. Task row の通常表示最小化 + 詳細展開（Planning: /tasks）
- [ ] `src/pages/TasksPage.tsx` を更新
  - フィルタ領域を折りたたみ式にする
    - ボタン「詳細フィルタ」→ 展開/非表示
  - タスク行を最小表示に変更
    - タイトル / dueDate / priorityIcon のみ
  - 詳細展開（accordion的な簡易でOK）
    - 展開時に：status, group/project/buckets, memo, 編集/削除ボタン等を表示
  - 既存のフィルタ/ソート機能は保持（UIが隠れるだけ）

Acceptance:
- デフォルトで情報量が減る
- 必要時だけ詳細が見える
- 機能自体は落ちない

---

## 4. Focus Mode（/focus）新規ページ
- [ ] `src/pages/FocusPage.tsx` を追加
  - tasksRepo.listTasks() 取得
  - overdue / today / thisWeekHigh を抽出
    - overdue: due<today かつ status!=done
    - today: due==today かつ status!=done
    - thisWeekHigh: thisWeek && priority=high && status!=done
  - 表示は最小（タイトル + due + priorityIcon）
  - 操作は完了トグルのみ（編集/削除なし）

Acceptance:
- 実行用に情報が絞られている
- 迷わず完了トグルできる
- リロードしても増殖等は無し（表示だけ）

---

## 5. README更新（任意だが推奨）
- [ ] 3層構造の説明と使い分け
  - 設計室(Planning) / 実行室(Focus) / 戦略室(Dashboard)

---

## 6. Final check
- [ ] build OK
- [ ] Focus対象の抽出が要件通り
- [ ] Tasksの詳細フィルタ折りたたみ動作
- [ ] Tasksの行が通常/詳細で情報量が切り替わる