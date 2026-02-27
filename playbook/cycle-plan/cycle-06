# playbook/cycle-plan/cycle-06.md
project: my-schedule
cycle: 06
goal: Planning / Focus のモード分離をUIとして成立させ、実行時の認知負荷を最小化する

## Scope
### Must
- モード3層の導線を確立
  - Dashboard = 戦略室（既存 /dashboard を継続）
  - Planning = 設計室（既存 /tasks をPlanningとして位置付け）
  - Focus = 実行室（新規 /focus）
- Focus Mode（/focus）新規実装
  - 表示対象
    - overdue（期限切れ）
    - today（今日期限）
    - thisWeek AND priority=high
  - UI制約
    - フィルタ非表示
    - グループ/プロジェクト/bucket 非表示
    - 編集/削除 非表示
    - 表示は「タイトル + 期限 + 優先度アイコン（↑/→/↓）」のみ
    - 行は1〜2行で収める
  - 操作
    - 完了トグルは可能（実行が主目的）
    - クリックで詳細展開は “無し” でOK（最小に寄せる）
- Planning Mode（/tasks）のUIノイズ削減（崩しすぎない）
  - フィルタはデフォルト非表示
  - 「詳細フィルタ」ボタンで展開/折りたたみ
  - タスク行の通常表示を最小化
    - 通常：タイトル + 期限 + 優先度アイコン
    - 詳細：展開（クリック/トグル）で従来情報（状態、分類、編集削除など）を表示

### Should
- Focus Modeの表示順（例）
  - overdue → today → thisWeekHigh の順
  - それぞれ dueDate 昇順
- Focus Mode では done を表示しない（todo / in_progressのみ）

## Out of Scope
- 色設計の全面反映（Cycle-07で統一）
- Dashboard再設計（Cycle-07）
- キーボードショートカット/検索

## Definition of Done
- /focus が実装され、対象タスクが最小情報で見える
- /tasks のフィルタはデフォルトで隠れ、必要時だけ展開できる
- /tasks の行は通常表示が最小化され、詳細は展開で見られる
- build成功