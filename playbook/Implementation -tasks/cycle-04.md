# playbook/implementation-tasks/cycle-04.md
project: my-schedule
cycle: 04
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-04-recurrence`

---

## 1. Domain（recurrence）
### Create
- [ ] `src/domain/recurrence.ts`
  - `RecurrenceType = "weekly" | "monthly_date" | "monthly_nth"`
  - `RecurrenceTemplate`
    - id, title, memo, priority, groupId, projectId, bucketIds
    - recurrenceType
    - recurrenceValue（週: weekday 0-6 / 月日: 1-31 / nth用weekday 0-6）
    - recurrenceNthWeek（1-5, monthly_nthのみ）
    - isActive
    - lastGeneratedDate（YYYY-MM-DD | null）
    - createdAt
  - helper: `encodeNthWeekday(nth, weekday)` は不要（値分離でOK）

### Acceptance
- 型がUI/DB/エンジンで共通利用される

---

## 2. IndexedDB（v3）
### Update
- [ ] `src/db/indexedDb.ts` version を 3 に上げる
- [ ] objectStore `recurrenceTemplates` を追加（keyPath: id）
  - index: isActive
  - index: recurrenceType

### Acceptance
- v2の tasks/masters が消えない
- 新ストアが作成される

---

## 3. Repo
### Create
- [ ] `src/db/recurrenceRepo.ts`
  - listAll / listActive / get / upsert / delete（削除は物理でOK）
  - updateLastGeneratedDate(id, date)

### Acceptance
- テンプレCRUDが動く

---

## 4. Recurrence engine（次回日付計算 + 生成）
### Create
- [ ] `src/utils/recurrenceEngine.ts`
  - `computeNextDueDate(template, today): string | null`
    - weekly: 次の指定weekday（今日が該当でも「次回」は来週扱いでOK or 今日扱い。MVPは「今日含む」推奨）
    - monthly_date: 次の dayOfMonth（存在しない日はスキップ）
    - monthly_nth: 次の第Nweekday（存在しない月はスキップ）
  - `ensureNextInstanceForAllActiveTemplates()`
    - activeテンプレ一覧→ nextDueDate算出
    - 既に tasks に同一 templateId + dueDate があればスキップ
    - 無ければ Task を生成（status=todo、isDeleted=false、recurrenceTemplateIdセット）
    - template.lastGeneratedDate を更新（dueDateでOK）

### Acceptance
- Tasks画面表示時に呼ぶと、必要に応じて次回が1件生成される
- リロードしても増殖しない

---

## 5. UI: テンプレ管理画面
### Create（どちらか選択）
A) `src/pages/RecurrenceTemplatesPage.tsx` を新設（推奨）
B) Masters画面にセクション追加

必須項目
- 一覧（isActive、タイプ、値、タイトル、紐付け分類）
- 追加/編集
  - title（必須）
  - type選択（weekly/monthly_date/monthly_nth）
  - weekly: weekday選択
  - monthly_date: dayOfMonth入力
  - monthly_nth: nth(1-5) + weekday選択
  - priority/statusはテンプレではpriorityのみ（statusは生成時todo固定でOK）
  - group/project/bucketsも選択可（Taskと同じように）
- 有効/無効トグル
- 削除

### Acceptance
- テンプレを作れて無効化できる

---

## 6. TaskForm: 繰り返し設定を追加
### Update
- [ ] `src/pages/TaskFormPage.tsx`
  - 新規作成時のみ「繰り返し: なし/週次/月次/第N曜日」UIを表示（編集時は一旦非表示でもOK）
  - 「繰り返しあり」で保存したら
    - recurrenceTemplate を新規作成（task内容をコピー）
    - そのタスク自体も通常タスクとして作成（recurrenceTemplateIdはnullでもOK / または紐付けてもOK）
  - UIは最小でOK（select + number input）

### Acceptance
- フォームからテンプレを作れる（導線ができる）

---

## 7. TasksPage: 自動生成呼び出し
### Update
- [ ] `src/pages/TasksPage.tsx`
  - 初回マウント時に `ensureNextInstanceForAllActiveTemplates()` を呼ぶ
  - 生成後に listTasks を再ロード

### Acceptance
- Tasksを開くと次回分が生える

---

## 8. Backup対応
### Update
- [ ] `src/db/backupRepo.ts`
  - export/import に recurrenceTemplates を追加

### Acceptance
- Export/Importでテンプレも復元される

---

## 9. README
- [ ] 繰り返し仕様（割り切り、二重生成防止、スキップルール）
- [ ] 使い方（テンプレ作成→Tasks開く→次回生成）

---

## 10. Final check
- [ ] build OK
- [ ] テンプレ作成→Tasks開く→生成→再読込しても増殖しない
- [ ] Export→DBクリア→Import→テンプレ/タスク復元→生成動作OK