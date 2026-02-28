import { useState, useRef, useEffect } from "react";

export interface KebabItem {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

interface KebabMenuProps {
  items: KebabItem[];
}

export function KebabMenu({ items }: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="kebab" ref={ref}>
      <button
        className="kebab-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="メニュー"
      >
        …
      </button>
      {open && (
        <div className="kebab-menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={`kebab-menu-item ${item.danger ? "kebab-menu-item--danger" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
