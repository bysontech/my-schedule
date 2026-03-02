# playbook/cycle-plan/cycle-17.md
project: my-schedule
cycle: 17
goal: 画面構成を最終形に整理し、不要画面を削除。優先度表示を矢印→左バーへ統一する。

## Scope（Must）
- 画面再編
  - Focus / Tasks / Repeat / Masters を削除
  - 残す：/dashboard /workspace /planning /settings
  - router/nav を刷新（リンク・タブ・メニューから撤去）
  - 旧ルートは 404 にせず /dashboard へリダイレクト
- 優先度表示の再設計
  - ↑→↓ を全廃
  - TaskRow の優先度表現を「左端の細いカラーバー」へ
    - High: 濃色 / Med: 中 / Low: 薄（3段階）
  - 期限切れは日付文字のみ赤（維持）
  - 完了は行全体を薄く + 取り消し線（維持）
- 既存のTaskDrawer/DayDrawer/Calendarの見た目を TaskRow仕様に合わせる

## Out of Scope
- 日表示タイムライン（Cycle-18）
- Workspace表示モード（Cycle-19）
- FAB統合（Cycle-20）

## Definition of Done
- Focus/Tasks/Repeat/Mastersが消えており、遷移できない
- /dashboard から /workspace /planning /settings に遷移できる
- TaskRowが優先度バー表現になり、矢印が一切残っていない
- build成功