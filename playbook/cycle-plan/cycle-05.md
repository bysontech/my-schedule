# playbook/cycle-plan/cycle-05.md
project: my-schedule
cycle: 05
goal: ダッシュボード（ホーム）で期限別/状態別/優先度別の件数と、期限切れ・今日のタスクを即表示して「迷わず着手」を実現する

## Scope（このサイクルでやる）
### Must
- ダッシュボード画面（/dashboard もしくは / をダッシュボードに）
  - 期限別件数カード
    - 期限切れ / 今日 / 今週 / 今月
  - 状態別件数
    - todo / in_progress / done
  - 優先度別件数
    - high / med / low
  - クイックアクセス一覧
    - 期限切れタスク（上限10件）
    - 今日のタスク（上限10件）
- カード/一覧はクリックで Tasks 画面に遷移し、該当フィルタが初期適用される
  - 実装方式: URLクエリ（例: /tasks?due=overdue&status=todo）
- 集計はクライアントでOK（tasksRepo.listTasks() から集計）

### Should（余裕があれば）
- 「未分類」件数（groupId=null）
- Doneはダッシュボード上のクイック一覧からは除外（todo/in_progressのみ表示）
- 今週/今月の定義を分かりやすく（週の開始: 月曜）

## Out of Scope（やらない）
- グラフ描画（棒グラフ等）
- 高度な分析（推移、達成率など）
- ウィジェット化
- 通知

## Definition of Done（完了条件）
- /dashboard を開くと、期限別/状態別/優先度別の件数が表示される
- 期限切れ/今日のタスクが即表示され、クリックで編集 or Tasksへ移動できる
- カードクリックで Tasks に遷移するとフィルタが反映される（クエリ連携）
- `npm run build` が通る

## Deliverables（成果物）
- `src/pages/DashboardPage.tsx`
- `src/utils/taskAggregations.ts`（期限区分判定/集計）
- `src/pages/TasksPage.tsx` 更新（クエリ初期フィルタ対応）
- `src/router.tsx` 更新（/dashboard + /の扱い）
- README更新（画面導線）

## Notes
- ダッシュボードは“速い”が命。重い描画はしない
- 期限判定はローカルタイム、週の開始は月曜で統一