import { useState, useRef } from "react";
import { downloadExport, importFromFile, ImportError } from "../utils/exportImport";
import { useI18n } from "../i18n/I18nContext";
import type { Locale } from "../i18n/types";

type MessageType = "success" | "error" | null;

export function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
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
      showMessage(t.exportSuccess, "success");
    } catch (e) {
      showMessage(`${t.exportError}${e instanceof Error ? e.message : String(e)}`, "error");
    }
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      showMessage(t.selectFile, "error");
      return;
    }
    setImporting(true);
    try {
      await importFromFile(file);
      showMessage(t.importSuccess, "success");
    } catch (e) {
      if (e instanceof ImportError) {
        showMessage(e.code === "json_parse_error" ? t.jsonParseError : t.backupFormatError, "error");
      } else {
        showMessage(e instanceof Error ? e.message : String(e), "error");
      }
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="settings-page">
      <h2 className="dash-section-title">{t.settings}</h2>

      {/* Message */}
      {messageType && (
        <div className={`settings-message settings-message--${messageType}`}>
          {message}
        </div>
      )}

      {/* Language */}
      <section className="settings-section">
        <h3 className="settings-section-title">{t.language}</h3>
        <p className="settings-description">{t.languageDesc}</p>
        <div className="settings-lang-toggle">
          {(["ja", "en"] as Locale[]).map((l) => (
            <button
              key={l}
              className={`cal-view-btn ${locale === l ? "cal-view-btn--active" : ""}`}
              onClick={() => setLocale(l)}
            >
              {l === "ja" ? "日本語" : "English"}
            </button>
          ))}
        </div>
      </section>

      {/* Export / Import: 2-column on PC */}
      <div className="settings-grid">
        {/* Export */}
        <section className="settings-section">
          <h3 className="settings-section-title">{t.exportBackup}</h3>
          <p className="settings-description">{t.exportDesc}</p>
          <button onClick={handleExport}>{t.jsonExport}</button>
        </section>

        {/* Import */}
        <section className="settings-section">
          <h3 className="settings-section-title">{t.importRestore}</h3>
          <div className="settings-warning">{t.importWarning}</div>
          <div className="settings-import-row">
            <input type="file" accept=".json" ref={fileRef} />
            <button
              className="btn-danger"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? t.processing : t.importExecute}
            </button>
          </div>
        </section>
      </div>

      {/* PWA Info */}
      <section className="settings-section">
        <h3 className="settings-section-title">{t.pwaInstall}</h3>
        <p className="settings-description">{t.pwaDesc}</p>
      </section>
    </div>
  );
}
