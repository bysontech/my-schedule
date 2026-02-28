import { useState, useRef } from "react";
import { downloadExport, importFromFile } from "../utils/exportImport";

type MessageType = "success" | "error" | null;

export function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [importing, setImporting] = useState(false);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleExport = async () => {
    try {
      await downloadExport();
      showMessage("エクスポートが完了しました。", "success");
    } catch (e) {
      showMessage(`エクスポートに失敗しました: ${e instanceof Error ? e.message : String(e)}`, "error");
    }
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      showMessage("ファイルを選択してください。", "error");
      return;
    }
    setImporting(true);
    try {
      await importFromFile(file);
      showMessage("インポートが完了しました。ページを再読み込みしてください。", "success");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="settings-page">
      <h2 className="dash-section-title">Settings</h2>

      {/* Message */}
      {messageType && (
        <div className={`settings-message settings-message--${messageType}`}>
          {message}
        </div>
      )}

      {/* Export / Import: 2-column on PC */}
      <div className="settings-grid">
        {/* Export */}
        <section className="settings-section">
          <h3 className="settings-section-title">Export (バックアップ)</h3>
          <p className="settings-description">
            全データ（タスク・グループ・プロジェクト・Bucket）をJSONファイルとしてダウンロードします。
          </p>
          <button onClick={handleExport}>JSONエクスポート</button>
        </section>

        {/* Import */}
        <section className="settings-section">
          <h3 className="settings-section-title">Import (復元)</h3>
          <div className="settings-warning">
            インポートすると既存データは全て上書きされます。この操作は取り消せません。事前にエクスポートすることを推奨します。
          </div>
          <div className="settings-import-row">
            <input type="file" accept=".json" ref={fileRef} />
            <button
              className="btn-danger"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? "処理中..." : "インポート実行"}
            </button>
          </div>
        </section>
      </div>

      {/* PWA Info */}
      <section className="settings-section">
        <h3 className="settings-section-title">PWAインストール</h3>
        <p className="settings-description">
          ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選択すると、
          オフラインでも利用できるアプリとしてインストールできます。
        </p>
      </section>
    </div>
  );
}
