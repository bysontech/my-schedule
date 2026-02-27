# playbook/implementation-tasks/cycle-07.md
project: my-schedule
cycle: 07
owner: claude-code

## 0. Branch
- branch: `feature/cycle-07-dashboard-strategy`

## 1. Dashboard再設計
- [ ] `src/pages/DashboardPage.tsx` を刷新（3段構造）
- [ ] `src/utils/taskAggregations.ts` を拡張
  - total / in_progress / done
  - thisWeek total / thisWeek done
  - group別 total/done
  - danger counts（overdue/today/thisWeekHigh）
- [ ] クリック導線
  - 危険ゾーン → /focus
  - groupカード → /tasks?groupId=...（初期反映）

## 2. 色ルール（最小のCSS）
- [ ] `src/styles` かコンポーネント内で最小定義
  - danger（赤）
  - caution（黄）
  - muted（灰）
  - category（青：group表示のみ）
- [ ] 優先度は常にアイコンのみ

## 3. TasksPage クエリ初期反映の拡張（必要なら）
- [ ] groupId クエリ初期反映を安定化（既にあるなら微調整のみ）

## 4. README更新
- [ ] 3層構造と色ルール