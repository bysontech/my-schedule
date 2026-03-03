# playbook/cycle-plan/cycle-18.md
project: my-schedule
cycle: 18
goal: 日表示タイムスケジュール（0:00-24:00）をHome/Planningに導入し、startAt/endAtをデータモデルへ追加する。

## Scope（Must）
- taskに startAt/endAt を追加（任意）
  - ISO8601 or "HH:mm" + date の方針を決めて統一（実装しやすい方でOK）
- Day view（新規）
  - 縦軸：時間（0:00〜24:00）
  - 終日タスク：上部レーン
  - 時間未設定：未定エリア
  - 時間あり：タイムライン上にブロック表示（重なりは簡易でOK、まずは縦積みでも可）
- Home/Planning のカレンダーに Day を追加
  - 週/月/日（Home）
  - 年/月/週/日（Planning）
- Dayから TaskDrawer create/edit 可能

## Definition of Done
- startAt/endAt が保存・復元される（IndexedDB）
- Day view がHome/Planningで表示できる
- Day上のタスクから編集できる
- build成功