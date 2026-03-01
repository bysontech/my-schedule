# playbook/cycle-plan/cycle-13.md
project: my-schedule
cycle: 13
goal: IA刷新の土台を作り、「+New専用ページ廃止」と「ドロワーで作成/編集が完結」を全画面で成立させる

## Scope（Must）
- 画面構成を最終形の骨格に寄せる（ルート/ナビ整理）
  - Dashboard（Home）
  - Planning（新：カレンダー中心）
  - Workspace（新設：空間UIの器だけ用意、D&DはCycle-16）
  - Repeat
  - Settings
- 「+ New」専用ページ（/tasks/new等）を廃止
  - 既存ルートがあれば削除 or リダイレクト
- ドロワー作成/編集の共通化
  - TaskCreate/EditDrawer を単一コンポーネントに統合（mode=create|edit）
  - Group/Project/Bucket の Create/EditDrawer を用意（同様に統合）
- ドロワーを閉じても元画面状態を保持
  - ページ遷移なしで開閉
  - （URLに状態を入れるのは任意。まずはコンポーネントstateでOK）

## Scope（Should）
- Undo（完了トグルの戻し）を最小実装
  - トースト「Undo」押下で元に戻せる（1件だけでOK）

## Out of Scope
- Dashboard週カレンダー再設計（Cycle-14）
- Planningカレンダー（Cycle-15）
- WorkspaceのD&D（Cycle-16）

## Definition of Done
- Dashboardからタスク新規作成→編集→完了がページ遷移無しで回る
- New専用ページが無くなる
- masters作成/編集もドロワーで呼べる（最低限: Dashboardから導線）
- build成功