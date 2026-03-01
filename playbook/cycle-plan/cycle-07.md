# playbook/cycle-plan/cycle-07.md
project: my-schedule
cycle: 07
goal: 戦略室（Dashboard）を再設計し、色の意味を単一化して「戦略進捗」を定量表示できるようにする

## Scope
### Must
- Dashboard再設計（/dashboard）
  - 上段：戦略サマリー
    - 総タスク数
    - 進行中数（in_progress）
    - 完了率（done / total）
    - 今週達成率（thisWeekのdone / thisWeek total）
  - 中段：危険ゾーン
    - overdue件数
    - today件数
    - thisWeekHigh件数
  - 下段：分野別進捗（Group別）
    - 各Groupの完了率（done / total）
    - 表示はカード/リストでOK（グラフ不要）
- 色ルールの適用（最低限、意味の衝突排除）
  - 赤：期限切れ/今日（危険の強調）
  - 黄：今週注意（thisWeekHigh など）
  - 灰：状態（done等の弱表示）
  - 青：分野（Group）※ダッシュボードの分野別のみで使用（優先度に使わない）
- 禁止事項を守る
  - 優先度に色を使わない（アイコンのみ）
  - 同一タスクに複数強調色を使わない
  - 色に複数意味を持たせない

### Should
- Dashboardから Focus へ導線（危険ゾーンのクリックで /focus へ）
- Group別進捗は「未分類」も表示（groupId=null）

## Out of Scope
- グラフ（棒/円）
- 高度な進捗（推移、期間比較）
- デザイン装飾の高度化

## Definition of Done
- Dashboardが指定の3段構造になる
- 進捗が定量で見える（率と分母分子が妥当）
- 色の意味が衝突しない（優先度はアイコンのみ）
- build成功