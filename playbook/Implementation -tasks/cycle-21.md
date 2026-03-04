# playbook/implementation-tasks/cycle-21.md
project: my-schedule
cycle: 21
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-21-final-polish-hierarchy-calendar`

---

## 1. カレンダー表示切替ボタン順序の統一
### Update
- [ ] `src/pages/DashboardPage.tsx`
- [ ] `src/pages/PlanningPage.tsx`
- [ ] （共通コンポーネントがあるなら）`src/components/CalendarViewSwitch.tsx`
  - 切替順：`day -> week -> month -> year`
  - Dayが一番左
  - 既存のviewMode値は維持し、UI並びだけ変える

### Acceptance
- Dashboard/Planning両方で並びが同一

---

## 2. Day表示の時間軸を 0:00〜24:00 に変更
### Update
- [ ] `src/components/CalendarDayTimeline.tsx`
  - 時間軸：0:00〜24:00（1時間刻み）
  - ラベル表示：`0:00, 1:00, ... 24:00`
  - ブロック配置ロジックは現状のままでOK（開始/終了があれば配置）

### Acceptance
- Day viewの縦軸が0:00〜24:00

---

## 3. DayDrawer（カレンダードロワー）のタスク表示を階層化
### Goal
日付クリックのタスク一覧が「所属構造」を一目で理解できるようにする。

### Create / Update
- [ ] `src/utils/taskHierarchy.ts`
  - `groupByGroupProject(tasks, groups, projects)` を追加
  - 出力形式例：
    - `{ groupKey: { group, projects: { projectKey: { project, tasks[] }, ... }, unassignedTasks[] } }`
  - groupId=null は "未分類" として1グループ枠にまとめる（枠名は未分類だが“選択”とは無関係）
  - projectId=null は "未分類" プロジェクト枠にまとめる
- [ ] `src/components/DayTasksDrawer.tsx`（名称は現状に合わせる）
  - 従来のフラット表示をやめて、階層UIに変更
  - UI構造：
    - GroupSection（枠）
      - ProjectSection（枠）
        - TaskRow（共通）
  - Group/Project枠は折りたたみ可能（任意、まずは常時展開でもOK）
  - 既存の「+」は維持（当日作成）
  - Taskクリックで編集ドロワー（既存連携維持）

### Acceptance
- 日付クリック→DayDrawerで階層表示される
- 各TaskRowの操作（完了トグル/…/編集）が壊れない

---

## 4. TaskRow：優先度バー + H/M/Lバッジ（最終確定）
### Update
- [ ] `src/components/TaskRow.tsx`
  - 左バー：high/med/low の3段階（強色は避ける）
  - H/M/L小バッジ（テキスト）
  - 期限切れは日付文字のみ赤
  - 完了は薄く＋取り消し線
- [ ] どこかに残る矢印表示を検索して削除（↑→↓）

### Acceptance
- すべての一覧/ドロワーで優先度が左バー＋HML
- 矢印が一切出ない

---

## 5. Workspace：プロジェクト表示を「グループ枠内プロジェクト列」に変更
### Update
- [ ] `src/pages/WorkspacePage.tsx`
  - project_boardモードを再定義
    - 最上位：Group枠（横並び or 縦積み、実装しやすい方）
    - Group枠の中に Project列（横スクロール可）
    - 各Project列に Taskカード
  - projectId=null はグループ枠内の「未分類プロジェクト」列に入れる
  - groupId=null のタスクは「未分類グループ」枠を1つ作り、その中にプロジェクト列を表示

### Acceptance
- project_boardで必ずグループ枠が存在し、その中にプロジェクトが出る

---

## 6. Home：プロジェクト進捗表示もグループ枠内に統一
### Update
- [ ] `src/pages/DashboardPage.tsx`
  - 進捗表示が project view のとき
    - Group枠 → Project進捗行 の構造で描画
  - 今週/今月の期間フィルタを維持

### Acceptance
- project viewでもグループ枠があり、そこでプロジェクト進捗が並ぶ

---

## 7. Dashboard中心UX（遷移最小化の追加調整）
### Update（最小）
- [ ] Dashboard上の要素クリック時
  - 可能なものはDrawerで完結（既存を壊さない範囲で）
  - 例：グループ/プロジェクト名クリック→情報Drawer（任意・余力）
- [ ] 既存の /workspace 遷移リンクは残してOK（“極力減らす”なのでゼロ必須ではない）

### Acceptance
- Dashboard中心で編集/詳細/日付一覧がドロワーで完結している

---

## 8. Final check
- [ ] `npm run build` OK
- [ ] カレンダー切替の並びが day/week/month/year
- [ ] Dayが0:00〜24:00
- [ ] DayDrawerが階層表示（group→project→task）
- [ ] Workspace project_board がグループ枠内プロジェクト
- [ ] Home project view がグループ枠内
- [ ] 未分類の選択枠バグが再発していない