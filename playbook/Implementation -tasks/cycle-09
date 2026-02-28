# playbook/implementation-tasks/cycle-09.md
project: my-schedule
cycle: 09
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-09-search-and-hotkeys`

## 1. Focus検索
- [ ] `src/pages/FocusPage.tsx`
  - search input 追加（タイトル検索）
  - 入力で Focus対象リストを絞り込み

Acceptance:
- Focus内の対象が即絞れる

## 2. キーボード操作（Focus）
- [ ] `src/pages/FocusPage.tsx` で keydown をハンドリング（window or wrapper div）
  - `/` → 検索inputへfocus（デフォルトのブラウザ検索は抑止）
  - `Esc` → 検索クリア（or blur）
  - `j/k` → selectionIndex を増減（範囲内クランプ）
  - `Space` → 選択中タスクを done トグル
  - `Enter` → 選択中タスクを todo ↔ in_progress 切替
- [ ] 選択中行にハイライト（class付与）

Acceptance:
- マウス無しで操作できる

## 3. UI最小ハイライト
- [ ] CSS最小（既存色ルールと衝突しない薄い背景 or 枠線）

Acceptance:
- 選択が視認できる

## 4. （Should）Planning検索
- [ ] `src/pages/TasksPage.tsx`
  - 検索input（タイトル+メモ）
  - `/` でフォーカス、Escでクリア
  - フィルタとは独立でAND条件で絞る

Acceptance:
- Planningでも探し物が速い

## 5. README更新
- [ ] Focusのショートカット一覧
- [ ] （追加した場合）Planning検索の使い方

## 6. Final check
- [ ] build OK
- [ ] 入力中にショートカットが暴発しない（input focus中は j/k/space/enter を無効化など）
- [ ] 日本語IME入力中（composition中）に誤動作しない（可能なら考慮）