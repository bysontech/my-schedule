# playbook/implementation-tasks/cycle-19.md
project: my-schedule
cycle: 19
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-19-workspace-modes-and-filters`

---

## 1. 未分類の常時選択状態バグ修正（最優先）
### 背景
- 初期状態で「未分類」が選択枠表示になってしまう
- `null` と `"unassigned"` を混同しない
- 初期状態は「選択なし」

### Update
- [ ] `src/pages/WorkspacePage.tsx`
  - 選択状態のstateを明確化
    - `selectedGroupId: string | null` の初期値は `null`
    - “未分類カラム” は `groupId=null` として扱うが、**選択状態とは別物**
  - 選択枠の表示条件を修正
    - `selectedGroupId !== null` の時だけ選択枠を描画
    - 未分類カラムは特別扱いせず、ユーザーが選んだ場合のみ枠
- [ ] `"unassigned"` のようなダミー値が入っていないか検索して排除

### Acceptance
- 初期表示でどのカラムにも「選択枠」が出ない
- ユーザーが選んだ時だけ枠が出る
- 未分類でも同様

---

## 2. Workspace 表示モード切替（3種類）
### Must modes
1) グループボード（列 = グループ）※既存を基準
2) 単一グループ表示（列 = 1つ）
3) プロジェクトボード（列 = プロジェクト）

### Create / Update
- [ ] `src/types/workspace.ts`
  - `WorkspaceViewMode = "group_board" | "single_group" | "project_board"`
- [ ] `src/components/WorkspaceModeSwitch.tsx`（新規）
  - トグル/タブで切替
  - single_group の場合は対象選択UI（select）を表示
- [ ] `src/pages/WorkspacePage.tsx`
  - viewMode state を追加し、表示ロジックを分岐
  - group_board:
    - 列: groups + unassigned
  - single_group:
    - 列: 選択グループのみ（未分類も選べる）
    - 初期は “選択なし” → 何も出さず、選択を促す（ここで勝手に未分類を選ばない）
  - project_board:
    - 列: projects + unassigned_project（projectId=null）
    - project列のヘッダには所属group名が分かる補助表示（任意）
- [ ] D&Dの扱い
  - group_board / single_group: D&Dで groupId を変更（既存仕様）
  - project_board: D&Dで projectId を変更（新規）
    - 未分類に落とす → projectId=null
  - モードに応じて “どのフィールドを更新するか” を切替

### Acceptance
- 3モードを切替できる
- モードごとに列の構成が変わる
- D&Dがモードに応じて groupId / projectId を更新する

---

## 3. 表示範囲フィルタ（表示のみ）
### Must filter presets
- すべて（All）
- 単一選択（Single）
- 今週（ThisWeek）
- 今月（ThisMonth）
- 未完了のみ（UndoneOnly）

### Create / Update
- [ ] `src/types/workspace.ts`
  - `WorkspaceRangeFilter = "all" | "single" | "this_week" | "this_month" | "undone_only"`
- [ ] `src/components/WorkspaceRangeFilter.tsx`
  - UI（segmented control / select）
  - Single時の対象選択（group or project：viewModeに応じる）
- [ ] `src/utils/workspaceFilter.ts`
  - 入力: tasks, filterState（既存の project/bucket/priority/status + 新range）
  - 期間判定:
    - this_week: dueDate が今週に入るもの（dueDate nullは除外）
    - this_month: dueDate が今月に入るもの（dueDate nullは除外）
    - undone_only: status != done
  - single:
    - viewModeに応じて対象を1つに絞る
    - group_board/single_group: groupId一致（nullも可）
    - project_board: projectId一致（nullも可）

### Acceptance
- range filter を変えると表示が変わる
- データは消えない（表示だけ）

---

## 4. D&Dの安定性（連続操作・フィルタ中）
### Update
- [ ] `src/components/dnd/useTaskDnD.ts`（Cycle-16のもの）
  - drag payload に `mode`（group/project）を含める
  - drop時に「フィルタで非表示になった場合」も落ちないようにする
- [ ] optimistic update のロールバックを確実に
  - 直前スナップショット保存 → 失敗時復元
- [ ] トースト通知
  - 成功時は不要（静かでOK）
  - 失敗時は必須

### Acceptance
- 連続D&Dで破綻しない
- フィルタ中でも drop が成立する（表示から消えるのはOK）

---

## 5. UI最小（情報密度維持）
### Update
- [ ] 各列ヘッダに件数表示（filtered件数）
- [ ] 選択枠/dragOver枠/hover枠の優先順位を整理（枠がチカチカしない）

### Acceptance
- 見た目が破綻しない
- 選択枠バグが再発しない

---

## 6. Final check
- [ ] `npm run build` OK
- [ ] 初期で選択枠が出ない（未分類も含む）
- [ ] 3モード切替 OK
- [ ] range filter OK（all/single/this_week/this_month/undone_only）
- [ ] D&Dがモードに応じて groupId / projectId を更新し永続化される
- [ ] 失敗時ロールバック + 通知が出る