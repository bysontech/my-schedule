# playbook/implementation-tasks/cycle-13.md
project: my-schedule
cycle: 13
owner: claude-code

## 0. Branch
- branch: `feature/cycle-13-ia-and-drawer-unification`

## 1. Routing / Nav 整理
- [ ] `src/router.tsx` 更新
  - Home=Dashboard
  - `/planning`（中身は仮でもOK、Cycle-15で本実装）
  - `/workspace`（器だけ、Cycle-16で本実装）
  - 旧 `/tasks/new` などを削除 or `/dashboard` へリダイレクト

## 2. Task drawer 統合
- [ ] `src/components/TaskDrawer.tsx`（create/edit統合）
  - props: mode, initialTask?, defaultDueDate?, onClose
  - create: 新規保存
  - edit: 更新保存
- [ ] 呼び出し元（Dashboard/Planning/Workspace/DayDrawerなど）から同一APIで開けるようにする

## 3. Master drawers
- [ ] `src/components/MasterDrawer.tsx` もしくは
  - `GroupDrawer.tsx`, `ProjectDrawer.tsx`, `BucketDrawer.tsx`
  - create/edit統合
- [ ] Dashboardから masters 編集導線を作る（例：分野別進捗の…メニューから）

## 4. Undo（Should）
- [ ] `src/components/Toast.tsx`（既存が無ければ最小）
- [ ] 完了トグル時にトースト表示 → Undoで復帰（直近1件）

## 5. Final check
- [ ] build OK
- [ ] Dashboardから新規作成/編集/完了が遷移無しで完結
- [ ] Newページが存在しない/リダイレクトされる