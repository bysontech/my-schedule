# playbook/implementation-tasks/cycle-10.md
project: my-schedule
cycle: 10
owner: claude-code

## 0. Branch
- branch: `feature/cycle-10-unified-taskrow-and-drawer`

## 1. UIコンポーネント追加
- [ ] `src/components/TaskRow.tsx`
  - props: task, onToggleDone, onClickTitle, menuItems（or onEdit/onDelete）
  - 表示は最小（チェック/タイトル/期限/優先度アイコン）
  - 完了表現（取り消し線＋薄色＋薄背景）
  - 期限色：overdue/todayのみ赤（期限文字だけ）
- [ ] `src/components/KebabMenu.tsx`
  - …ボタン → メニュー表示（編集/削除など）
- [ ] `src/components/Drawer.tsx`
  - 右ドロワー基盤（open/close、Escで閉じる）

## 2. Task編集ドロワー
- [ ] `src/components/TaskEditDrawer.tsx`
  - フォーム：title / dueDate / priority / status / group / project / buckets
  - 保存で tasksRepo.upsertTask
  - group変更時に project選択を絞り込み（既存仕様維持）
  - 削除は …メニュー側に残してOK

## 3. 既存画面を TaskRow に置換
- [ ] Dashboard：危険ゾーン/クイック一覧などを TaskRow に統一
- [ ] Focus：TaskRowに統一（表示情報はTaskRow準拠）
- [ ] Planning(/tasks)：行表示をTaskRowに統一
  - 既存の詳細展開は当面維持でもOKだが、編集/削除は…へ寄せる
  - “ボタン過多”を解消することが優先

## 4. Dashboardからドロワー編集導線
- [ ] Dashboardのタスククリックで TaskEditDrawer を開く
- [ ] 保存後に一覧更新

## 5. Final check
- [ ] build OK
- [ ] 完了/未完了の視覚が統一されている
- [ ] overdue/today の赤は期限文字のみ
- [ ] …メニューに編集/削除が集約されている