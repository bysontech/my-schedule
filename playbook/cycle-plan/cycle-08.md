# playbook/cycle-plan/cycle-08.md
project: my-schedule
cycle: 08
goal: Focus Modeを“実行の主戦場”として完成させ、実行の摩擦を最小化する（軽量・安全・迷わない）

## Scope
### Must
- Focusの表示安定化（並び順/グルーピング）
  - セクション順：overdue → today → thisWeekHigh
  - セクション内：dueDate昇順（nullは最後）
- Focusでの行操作を最小追加
  - 完了トグル（既存）
  - status を todo ↔ in_progress を切り替える（編集なしで着手状態にできる）
- Focusの“今日の実行”を強化
  - セクションヘッダに件数表示（例：Today (3)）
  - 完了済みは表示しない（todo/in_progressのみ）

### Should（余裕があれば）
- Focusで「今日の新規追加」だけ許可（タイトルだけのクイック追加）
  - 追加したら dueDate=today, priority=med, status=todo
- FocusからPlanningへの導線（小さなリンク）
  - 「設計室で整理」→ /tasks

## Out of Scope
- 検索
- キーボードショートカット（Cycle-09でやる）
- 繰り返し仕様変更
- デザイン装飾の高度化

## Definition of Done
- Focusが3セクションで安定表示される
- Focus上で「着手(in_progress)」「完了(done)」が最短操作でできる
- build成功