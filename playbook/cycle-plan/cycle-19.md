# playbook/cycle-plan/cycle-19.md
project: my-schedule
cycle: 19
goal: Workspaceを“整理の中心”として強化し、表示モード切替・範囲フィルタ・未分類選択バグを解消する。

## Scope（Must）
- 未分類の常時選択状態バグ修正
  - 初期状態：選択なし（null）
  - ユーザー選択時のみ枠
  - null と "unassigned" を混同しない
- 表示モード切替
  1) グループボード（列=グループ）
  2) 単一グループ表示
  3) プロジェクトボード（列=プロジェクト）
- 表示範囲フィルタ
  - すべて / 単一選択 / 今週 / 今月 / 未完了のみ

## Definition of Done
- 3モード切替が動き、D&Dも破綻しない
- 未分類が勝手に選択表示されない
- build成功