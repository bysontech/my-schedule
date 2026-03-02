# playbook/implementation-tasks/cycle-17.md
project: my-schedule
cycle: 17
owner: claude-code

## 0. Branch
- branch: `feature/cycle-17-structure-and-priority-bar`

## 1. Routing / Nav 整理
- [ ] `src/router.tsx`
  - 残す: /dashboard /workspace /planning /settings
  - 削除対象: /focus /tasks /repeat /masters（存在するなら）
  - 旧ルートは /dashboard へリダイレクト
- [ ] ナビUI（ヘッダ/サイドバー等）から削除画面への導線を撤去

## 2. 優先度矢印の完全撤去
- [ ] `src/utils/priorityIcon.ts` を削除 or 未使用化
- [ ] 全画面/全コンポーネントで ↑→↓ を使っていないことを確認

## 3. TaskRow を優先度バーへ変更
- [ ] `src/components/TaskRow.tsx`
  - 左端に細いバー（priority=high/med/lowで3段階）
  - 完了表現（薄く/取り消し線）維持
  - overdue/today は期限文字のみ赤を維持
- [ ] TaskRow variant（compact/card）があるなら同様に適用

## 4. 影響範囲の調整
- [ ] Dashboard/Workspace/Planning/DayDrawer/TaskDrawer の一覧表示が TaskRow統一で崩れないよう調整
- [ ] CSSの色責務が混在しない（期限=赤、優先度=バー、完了=薄）

## 5. Final check
- [ ] `npm run build` OK
- [ ] app内に「Focus/Tasks/Repeat/Masters」文言・導線が無い
- [ ] 優先度矢印が表示されない