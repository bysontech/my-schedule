import { useState, useEffect, useCallback } from "react";
import { useI18n } from "../i18n/I18nContext";

interface FabMenuProps {
  onCreateTask: () => void;
  onCreateGroup: () => void;
  onCreateProject: () => void;
}

export function FabMenu({ onCreateTask, onCreateGroup, onCreateProject }: FabMenuProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, close]);

  const handleAction = (action: () => void) => {
    close();
    action();
  };

  return (
    <>
      {open && <div className="fab-overlay" onClick={close} />}
      <div className="fab-menu-container">
        {open && (
          <div className="fab-menu-items">
            <button className="fab-menu-item" onClick={() => handleAction(onCreateTask)}>
              {t.createTask}
            </button>
            <button className="fab-menu-item" onClick={() => handleAction(onCreateGroup)}>
              {t.groupCreate}
            </button>
            <button className="fab-menu-item" onClick={() => handleAction(onCreateProject)}>
              {t.projectCreate}
            </button>
          </div>
        )}
        <button
          className="fab"
          onClick={() => setOpen((v) => !v)}
          aria-label={t.createMenu}
        >
          {open ? "×" : "+"}
        </button>
      </div>
    </>
  );
}
