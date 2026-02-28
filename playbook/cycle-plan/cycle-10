# playbook/cycle-plan/cycle-10.md
project: my-schedule
cycle: 10
goal: TaskRowを共通コンポーネント化し、操作はkebabメニューへ集約。Dashboard中心のドロワー編集基盤を作る。

## Scope（Must）
- 共通コンポーネント導入
  - TaskRow（Planning / Focus / Dashboard / Calendar drawer で共通利用）
  - KebabMenu（…）に操作を格納
  - Drawer（右ドロワー）基盤
- TaskRow仕様（最小）
  - 左：完了トグル
  - 中：タイトル（完了は取り消し線＋薄色）
  - 右：期限（期限切れ/今日のみ赤）
  - 補助：優先度アイコン（↑→↓）
  - 期限切れは「期限文字のみ赤」※行全体は赤くしない
- 行操作の整理
  - 既存の「編集/削除」常時表示を廃止
  - …メニューに格納：編集 / 削除 / 詳細（任意） / 分類変更（Cycle-11以降でもOK）
- 右ドロワー編集（Dashboardからの編集を最優先）
  - タスククリック → ドロワーで編集（ページ遷移なし）
  - 編集項目（最低限）
    - title / dueDate / priority / status / groupId / projectId / bucketIds
  - masters未登録の追加はCycle-12でOK（このCycleは“変更できる”まで）

## Scope（Should）
- Drawer内で「未着手/着手」を変更（todo/in_progress）
- Escでドロワーを閉じる（Cycle-09のキー整理と整合）

## Out of Scope
- カレンダーUI（Cycle-11）
- Masters/Repeat/Settingsの刷新（Cycle-12）
- 高度なデザイン装飾

## Definition of Done
- TaskRowが各画面で共通利用される
- 行の編集/削除ボタンが消え、…に集約される
- Dashboardからドロワーで編集→保存→反映される
- build成功