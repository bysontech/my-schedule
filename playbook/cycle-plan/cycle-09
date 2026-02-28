# playbook/cycle-plan/cycle-09.md
project: my-schedule
cycle: 09
goal: 検索とキーボード操作で“実行速度”を最大化する（Focus優先、Planningも最低限対応）

## Scope
### Must
- Focusに検索（タイトルのみ）
  - 入力中に即フィルタ（debounce不要）
  - 対象は Focus に表示される集合（overdue/today/thisWeekHigh）内のみ
- Focusにキーボード操作（最小）
  - `/` で検索にフォーカス
  - `Esc` で検索クリア or フォーカス解除
  - `j/k` で次/前のタスク行へ移動（ハイライト）
  - `Space` で完了トグル（done）
  - `Enter` で todo ↔ in_progress 切替（着手/戻す）
- ハイライト表示（CSS最小）
  - 色は既存ルールに従い、強調は“枠/背景薄め”程度（意味衝突させない）

### Should（余裕があれば）
- Planning(/tasks)にも検索（タイトル+メモ）
- Planningにも `/` 検索フォーカス、Escクリア（移動キーは不要）

## Out of Scope
- グローバルショートカットのカスタマイズ
- 高度な全文検索（インデックス）
- モバイル向け専用ショートカット
- テスト追加

## Definition of Done
- Focusでキーボードだけで「検索→選択→着手/完了」が回る
- build成功