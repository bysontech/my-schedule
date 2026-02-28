# playbook/cycle-plan/cycle-11.md
project: my-schedule
cycle: 11
goal: Dashboardにカレンダー（週/月切替）を追加し、日付セル→期限タスク一覧→完了/編集までをドロワーで完結させる。

## Scope（Must）
- Dashboardにカレンダーセクション追加
  - 表示切替：Week / Month（トグル or タブ）
- 月間（Month）
  - 日付セルに「件数（dueDate一致タスク数）」表示（例：●2）
  - セルクリック → 右ドロワー（DayDrawer）でその日の期限タスク一覧
- 週間（Week）
  - 週の各日 + その日の期限タスクをリスト表示（TaskRow使用）
  - 日クリックで同じDayDrawerを開く
- DayDrawer（その日の期限タスク一覧）
  - TaskRowで表示（完了トグル可能）
  - …メニュー→編集（TaskEditDrawerを開く / または同一ドロワー内で編集）
- “ダッシュボード中心運用”を守る
  - 期限タスクの完了/編集がページ遷移なしでできる

## Scope（Should）
- カレンダーに「today」ハイライト（薄い枠程度）
- 週の開始：月曜固定

## Out of Scope
- 外部カレンダー連携
- ドラッグ&ドロップ
- グラフ

## Definition of Done
- Monthで件数表示→日付クリック→DayDrawer→完了/編集できる
- Weekでも同様に操作できる
- TaskRow/Drawer基盤を流用できている
- build成功