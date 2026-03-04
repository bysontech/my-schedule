# playbook/cycle-plan/cycle-21.md
project: my-schedule
cycle: 21
goal: 最終調整（Dashboard中心UX強化 / カレンダーUI改善 / 階層表示統一）

## Scope（Must）
1. Dashboard中心UX
- Dashboard上の操作はページ遷移ではなく Drawer/Modal で完結する範囲を拡大
  - タスク詳細/編集（既存のTaskDrawerを継続）
  - 日付タスク一覧（DayDrawer）
  - グループ/プロジェクト情報（新規Drawer or 既存MasterDrawer流用）

2. カレンダーUI改善
- 表示切替ボタン順序を `日 → 週 → 月 → 年` に統一（Dashboard/Planning共通）
- Day表示の時間軸を `0:00〜24:00` に変更（1時間刻み）
- 日付クリックのドロワー内タスク表示を階層化
  - グループ枠 → プロジェクト枠 → タスク

3. 階層構造の統一（重要）
- 「プロジェクトが出るところ」は必ずグループ枠内に表示
  - Workspace: プロジェクト表示モードを「グループ枠の中にプロジェクト列」
  - Home進捗: プロジェクト表示でも「グループ枠 → プロジェクト進捗」

4. 優先度表示（最終確定）
- 優先度は左バー + H/M/L小バッジ
- 期限切れは日付文字のみ赤、完了は薄く＋取り消し線（維持）

## Out of Scope
- 外部カレンダー連携 / 通知 / マルチユーザー / ガント / 依存関係

## Definition of Done
- カレンダー切替で日が左端
- Day表示が0:00-24:00
- DayDrawerがグループ→プロジェクト→タスクで表示
- Workspaceのプロジェクト表示がグループ枠内
- Homeのプロジェクト進捗がグループ枠内
- build成功