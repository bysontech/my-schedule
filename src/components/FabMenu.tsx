import { useState, useEffect, useCallback } from "react";

interface FabMenuProps {
  onCreateTask: () => void;
  onCreateGroup: () => void;
  onCreateProject: () => void;
}

export function FabMenu({ onCreateTask, onCreateGroup, onCreateProject }: FabMenuProps) {
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
              タスク作成
            </button>
            <button className="fab-menu-item" onClick={() => handleAction(onCreateGroup)}>
              グループ作成
            </button>
            <button className="fab-menu-item" onClick={() => handleAction(onCreateProject)}>
              プロジェクト作成
            </button>
          </div>
        )}
        <button
          className="fab"
          onClick={() => setOpen((v) => !v)}
          aria-label="作成メニュー"
        >
          {open ? "×" : "+"}
        </button>
      </div>
    </>
  );
}
