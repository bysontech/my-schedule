# playbook/implementation-tasks/cycle-20.md
project: my-schedule
cycle: 20
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-20-create-flows-and-home-progress-link`

---

## 1. Workspace: 右下FABメニュー（作成機能の統合）
### Goal
Workspace内で「タスク/グループ/プロジェクト」を一箇所から作れるようにする。

### Create
- [ ] `src/components/FabMenu.tsx`
  - 右下固定（safe area考慮）
  - クリックでメニュー展開（overlay可）
  - アクション（Must）
    - Create Task
    - Create Group
    - Create Project
  - キーボード/クリックで閉じられる（Esc/外側クリック）

### Update
- [ ] `src/pages/WorkspacePage.tsx`
  - FabMenuを配置
  - 各アクションで該当Drawerを開く
    - TaskDrawer create（デフォルト紐付け無し）
    - MasterDrawer（Group create）
    - MasterDrawer（Project create）
  - 現在の viewMode / rangeFilter がある場合は、それを崩さない（state保持）

### Acceptance
- WorkspaceでFABから3種作成ドロワーが開く

---

## 2. Workspace: 列ヘッダの「+」で列に紐づくタスク作成
### Update
- [ ] GroupBoard列ヘッダに「+」
  - その列の groupId をデフォルトで TaskDrawer create に渡す
- [ ] ProjectBoard列ヘッダに「+」
  - その列の projectId をデフォルトで TaskDrawer create に渡す
- [ ] SingleGroup表示でも同様

### Acceptance
- 列ヘッダの+で「その列に紐づいたタスク」が作成できる

---

## 3. TaskDrawer内：グループ/プロジェクトの「+新規作成」導線
### Goal
Masters画面を削除した状態で、作成フローが詰まらないようにする。

### Update
- [ ] `src/components/TaskDrawer.tsx`
  - groupId選択UIの横に「+」を配置
    - クリックで Group create drawer を開く
    - 作成完了後、その新規groupを自動選択
  - projectId選択UIの横に「+」を配置
    - クリックで Project create drawer を開く（groupIdが選ばれていればデフォルトに）
    - 作成完了後、その新規projectを自動選択
  - 追加制約（最小）
    - group未選択でもproject作成は可能（groupId=null）でOK
- [ ] Drawerのネスト
  - TaskDrawerを閉じずにサブDrawerを重ねる or 一時的に切り替える
  - 実装しやすい方式でOK。ただし「戻ったら入力が消えない」こと

### Acceptance
- TaskDrawerからグループ/プロジェクトを新規作成でき、戻った時に選択される
- TaskDrawerの入力が消えない

---

## 4. Home: 分野別進捗の切替（グループ/プロジェクト）
### Goal
Homeで「どの切り口で進捗を見るか」を切替可能にする。

### Update
- [ ] `src/pages/DashboardPage.tsx`
  - 分野別進捗セクションに切替UIを追加
    - Group view / Project view
  - 集計は “期間フィルタ” と連動（次項）

### Acceptance
- Homeでグループ別/プロジェクト別を切り替えできる

---

## 5. Home: 期間切替（今週/今月）
### Update
- [ ] Dashboardに期間切替UI（This Week / This Month）
- [ ] 進捗・集計の対象タスクは期間に従う
  - 基本は dueDate ベース
  - dueDate null は “対象外” でOK（後回し）

### Acceptance
- 今週/今月で進捗数値が変わる

---

## 6. Home → Workspace 連動（条件を維持して遷移）
### Goal
Homeで見ていた条件をWorkspaceへ持ち込む。

### Update（推奨）
- [ ] Homeの進捗セクションの各行（例: 特定グループ/プロジェクト）をクリックできるようにする
- [ ] 遷移時にクエリで条件を渡す（実装しやすい方）
  - 例：`/workspace?mode=group_board&range=this_week&groupId=xxx`
  - project viewなら `mode=project_board&projectId=yyy`
- [ ] Workspace側でクエリを読み取り初期stateに反映
  - mode/range/single対象

### Acceptance
- Homeで選んだ条件のままWorkspaceが開く
- Workspace側で state が維持される（再ロードしてもクエリが残る限り復元されるのが理想）

---

## 7. Undo（望ましい）
- [ ] 完了トグルのUndoが既にあるなら、Workspace/DayDrawerでも同様に効くようにする（最小でOK）
  - 無ければこのCycleでは無理に入れない

---

## 8. Final check
- [ ] `npm run build` OK
- [ ] Workspace: FABで Task/Group/Project作成OK
- [ ] Workspace: 列ヘッダ + で紐付け付きタスク作成OK
- [ ] TaskDrawer: group/projectの+新規作成が動き、戻っても入力保持
- [ ] Home: 進捗が group/project で切替できる
- [ ] Home: 今週/今月で進捗が変わる
- [ ] Home→Workspace: 条件が引き継がれる