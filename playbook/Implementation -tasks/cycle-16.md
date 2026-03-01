# playbook/implementation-tasks/cycle-16.md
project: my-schedule
cycle: 16
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-16-workspace-dnd`

---

## 1. Workspaceページ（スペーシャルUIの器）
### Create
- [ ] `src/pages/WorkspacePage.tsx`
  - レイアウト：横スクロール可能な “グループカラム” を並べる（Kanban風）
  - 各カラム（GroupPanel）に表示するもの
    - ヘッダ：グループ名 + 件数（filteredの件数）
    - 右端：…メニュー（グループ編集/削除はここ）
    - 「+」：このグループにタスク作成（TaskDrawer create、groupIdをデフォルト）
    - ボディ：タスクカード一覧（TaskRowのcompact/カードvariant）
  - 「未分類」カラム（groupId=null）も追加（最左 or 最右）

### Acceptance
- /workspace を開くとグループごとのパネルが並ぶ
- グループ内のタスクが表示される
- + からタスク作成（ドロワー）できる

---

## 2. Workspaceフィルタ（表示のみ）
### Create
- [ ] `src/components/WorkspaceFilters.tsx`
  - 折りたたみ（デフォルト非表示）
  - フィルタ項目（Must）
    - projectId / bucketId / priority / status
    - 期間：week / month（表示対象期間）
      - week: dueDate が “今週” に入るタスク（nullは除外 or 別扱い）
      - month: dueDate が “今月” に入るタスク
  - groupは「カラム」自体なのでフィルタ対象から外してOK（表示カラムは維持）
  - フィルタはデータ削除しない（表示のみ）

### Acceptance
- フィルタを変えると各カラムの表示タスクが変わる

---

## 3. D&D基盤（HTML5 Drag & Drop でOK）
### Create
- [ ] `src/components/dnd/useTaskDnD.ts`（または同等）
  - dragStart: taskId と sourceGroupId を保持
  - dragOver: dropを許可（preventDefault）
  - drop: targetGroupId を取得 → 変更を実行

### Acceptance
- タスクをドラッグでき、ドロップ対象が認識される

---

## 4. ドロップで groupId を更新（即時反映 + 永続化）
### Update
- [ ] WorkspacePage
  - drop時に
    1) UIを即時更新（optimistic update）
    2) tasksRepo.updateTask(taskId, { groupId: targetGroupId }) を実行
    3) 失敗時はロールバックしてトースト通知
  - targetが同一グループなら何もしない
  - 未分類カラムに落とす場合は groupId=null

### Acceptance
- D&Dでグループ移動し、即座に見た目が変わる
- ブラウザ再起動後も移動が保持される
- エラー時に元へ戻る（ロールバック）

---

## 5. ドロップ可能領域の視覚表現（最小）
### Update
- [ ] GroupPanel に dragOver時のハイライト（薄い枠）
  - 色の意味衝突を避ける（薄い枠/背景程度）

### Acceptance
- どこに落とせるか分かる

---

## 6. 「分類整理」と「運用」の統合導線（最小）
### Update
- [ ] 各GroupPanelの…メニューから
  - Group編集（MasterDrawer）
- [ ] Taskカードの…メニューから
  - 編集（TaskDrawer edit）
  - 削除（論理削除）
  - （任意）project/bucket変更は TaskDrawer に寄せてOK

### Acceptance
- Workspace内で編集導線が完結する（ページ遷移なし）

---

## 7. Final check
- [ ] `npm run build` OK
- [ ] D&Dが連続操作でも破綻しない
- [ ] フィルタ適用中でもD&Dが動く（表示対象のみ移動でOK）
- [ ] 失敗時ロールバック + 通知が出る
- [ ] モバイルではD&D非対応でもOK（落ちない/崩れない）