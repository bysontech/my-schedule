# playbook/cycle-plan/cycle-20.md
project: my-schedule
cycle: 20
goal: 作成導線をWorkspaceに統合（FAB/列ヘッダ+/フォーム内新規作成）し、Homeの進捗切替とWorkspace連動を完成させる。

## Scope（Must）
- Workspace: 右下FABメニュー
  - タスク作成 / グループ作成 / プロジェクト作成
- 列ヘッダにも「+」設置（列に紐づくタスク作成）
- TaskDrawer内に group/project の「+新規作成」導線
- Home進捗の切替
  - グループ別 / プロジェクト別
  - 今週 / 今月
- Home→Workspaceへ条件引き継ぎ（クエリ or state）

## Definition of Done
- Workspace内でグループ/プロジェクト作成ができる
- Home進捗が切替でき、条件を持ってWorkspaceへ遷移できる
- build成功