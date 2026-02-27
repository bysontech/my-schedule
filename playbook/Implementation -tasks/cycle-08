# playbook/implementation-tasks/cycle-08.md
project: my-schedule
cycle: 08
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-08-focus-polish`

## 1. Focus表示の安定化
- [ ] `src/pages/FocusPage.tsx`
  - セクション順を固定（overdue/today/thisWeekHigh）
  - 各セクションに件数表示
  - セクション内ソート：dueDate asc（null last）

Acceptance:
- 毎回同じ順で出る

## 2. status 切替（編集なし）
- [ ] Focus行に「着手/戻す」操作を追加
  - todo → in_progress
  - in_progress → todo
- [ ] doneは表示しない

Acceptance:
- Focusだけで実行状態管理が回る

## 3. （Should）Focusクイック追加
- [ ] タイトル入力1つだけの追加欄
- [ ] 保存で dueDate=today, priority=med, status=todo
- [ ] 追加後はリストに反映

Acceptance:
- “今日やる”が即追加できる

## 4. Final check
- [ ] build OK
- [ ] overdue/today/thisWeekHigh の抽出条件が崩れていない
- [ ] 連打しても状態が破綻しない