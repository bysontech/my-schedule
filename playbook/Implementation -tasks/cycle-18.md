# playbook/implementation-tasks/cycle-18.md
project: my-schedule
cycle: 18
owner: claude-code
priority: Must first

## 0. Branch
- branch: `feature/cycle-18-day-view-timeline`

---

## 1. データモデル拡張（startAt / endAt）
### 方針（Must）
- tasks に以下を追加
  - `startAt`: string | null  … `"HH:mm"` 形式（ローカル時刻）
  - `endAt`: string | null    … `"HH:mm"` 形式（ローカル時刻）
- 日付（dueDate）は既存の `"YYYY-MM-DD"` を利用し、Day view は `dueDate` を基準日にする  
  （※ startAt/endAt は “その日の時刻” として解釈）

### Update
- [ ] `src/types/task.ts`（または task型定義がある場所）
  - startAt/endAt を追加
- [ ] tasksRepo の保存/取得に startAt/endAt が含まれることを確認
  - IndexedDB schema upgrade が必要なら v を上げて migrate（既存データは null 埋め）

### Acceptance
- startAt/endAt を持つタスクが保存・復元できる
- 既存データは壊れず null として扱える

---

## 2. TaskDrawer に時間入力を追加（任意項目）
### Update
- [ ] `src/components/TaskDrawer.tsx`（create/edit統合ドロワー）
  - startAt/endAt の入力UIを追加（type="time" 推奨）
  - バリデーション（最小）
    - startAt と endAt 両方ある場合、startAt <= endAt（不正なら保存不可 or 自動補正）
  - 時間クリア操作（×ボタン or 空にする）を用意

### Acceptance
- タスクに開始/終了時刻を設定して保存できる
- クリアして「未定」扱いに戻せる

---

## 3. Day View コンポーネント（新規）
### Create
- [ ] `src/components/CalendarDayTimeline.tsx`
  - props:
    - `date: YYYY-MM-DD`
    - `tasks: Task[]`（原則 dueDate==date の集合）
    - `onSelectTask(taskId)`（編集用）
    - `onCreateTask(date, startAt?, endAt?)`（任意。最初は dateだけでOK）
  - UI仕様（Must）
    - 縦軸：時間 0:00〜24:00（1時間刻みでOK）
    - 上部：終日レーン（time未設定だが dueDate あり、または startAt/endAt null）
    - 「未定」エリア（dueDate=date だが time未設定）※終日と未定を分けたい場合
    - 時間ありタスク：タイムライン上にブロック表示
  - 表示ロジック（最小でOK）
    - startAt/endAt がある → ブロック
    - startAtのみ → その時刻の小ブロック（例: 30分固定）
    - endAtのみ → 未定エリア（または 6:00開始扱いにしない）
    - 両方null → 終日 or 未定

### Acceptance
- Day view が単体で表示できる
- タスクが
  - 終日/未定/時間ブロック に分かれて表示される
- クリックで onSelectTask が呼べる

---

## 4. Home（Dashboard）に Day を追加
### Update
- [ ] `src/pages/DashboardPage.tsx`
  - 既存のカレンダー切替に Day を追加（Month / Week / Day）
  - Day表示時：
    - その日の `CalendarDayTimeline` を表示
    - Prev/Next/Today の移動単位は “日”
  - Day上から
    - タスククリック → TaskDrawer edit
    - 「+」 → TaskDrawer create（defaultDueDate=当日）

### Acceptance
- Homeで Day 表示ができ、日移動できる
- Dayから作成/編集できる

---

## 5. Planning に Day を追加
### Update
- [ ] `src/pages/PlanningPage.tsx`
  - 既存切替に Day を追加（Year / Month / Week / Day）
  - Day表示時：
    - `CalendarDayTimeline` を表示
    - フィルタ適用後の tasks を表示（Planningのフィルタ結果に従う）
  - Day上から作成/編集（TaskDrawer）

### Acceptance
- Planningで Day 表示ができ、フィルタが反映される
- Dayから作成/編集できる

---

## 6. Day view のデータ抽出（重要）
### Update / Create
- [ ] `src/utils/dayView.ts`
  - `getDayTasks(tasks, date)`（dueDate==date）
  - `splitDayTasks(dayTasks)` → allDay/unscheduled/timed
  - `toMinutes("HH:mm")` などユーティリティ

### Acceptance
- 表示分類が安定し、欠損値で落ちない

---

## 7. スタイル/色ルール遵守（Must）
- [ ] 優先度：左バー（Cycle-17のルールが入っているなら維持）
- [ ] overdue/today：日付文字のみ赤
- [ ] 完了：薄く + 取り消し線
- [ ] タイムラインの色は意味混在させない（強い色で状態/優先度/期限を重ねない）

---

## 8. Final check
- [ ] `npm run build` OK
- [ ] 既存データが残ったままアップグレードできる（startAt/endAtはnull）
- [ ] Day view: 0:00〜24:00 の軸が表示される
- [ ] Home/Planning 両方で Day 表示、作成、編集ができる