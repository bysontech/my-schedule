# playbook/cycle-plan/cycle-14.md
project: my-schedule
cycle: 14
goal: Dashboardの週カレンダーを“見やすさ最優先”で再設計し、移動（前後/今日）と作成/編集導線を完成させる

## Scope（Must）
- Dashboardカレンダー
  - Week/Month切替（維持）
  - Monthは現状の良さ維持
  - Weekは再設計（縦リスト禁止）
    - 7列グリッド（推奨）
      - 各日セルにタスクを並べる（TaskRowのコンパクト版）
      - 上部に日付 + 件数 + “High件数”など最小バッジ
- カレンダー操作
  - 前/次（週・月）
  - 今日へジャンプ
  - 日付クリック → DayDrawer
- DayDrawerから
  - タスク編集（TaskDrawer）
  - タスク作成（defaultDueDate=選択日）

## Definition of Done
- 週表示が一目で把握できる（7日×タスク量）
- 前後移動/今日ジャンプが動く
- 日付から作成/編集が遷移無しでできる
- build成功