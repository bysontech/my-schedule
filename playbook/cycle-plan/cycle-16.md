# playbook/cycle-plan/cycle-16.md
project: my-schedule
cycle: 16
goal: Workspace（スペーシャルUI）を実装し、ドラッグ&ドロップでグループ間移動を安定動作させる

## Scope（Must）
- Workspace（/workspace）
  - グループごとのカラム/パネル（横並び）
  - 各パネルにタスクカード（TaskRow variant）を表示
  - パネル上でタスク作成（TaskDrawer create、groupIdをデフォルト）
- Drag & Drop
  - タスクを別グループへD&Dで移動（groupId更新）
  - UI即時反映 → 永続化（IndexedDB）
  - 失敗時はロールバック + トースト
- Workspace内フィルタ
  - group/project/bucket/priority/status + 期間（週/月）
  - フィルタは表示だけ変える

## Definition of Done
- D&Dでグループ移動が安定して動く（連続操作でも破綻しない）
- 移動が永続化され、再起動後も反映
- 失敗時にロールバックされ通知される
- build成功