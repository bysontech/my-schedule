import { useEffect } from "react";

interface ToastProps {
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, action, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className="toast">
      <span className="toast-message">{message}</span>
      {action && (
        <button className="toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button className="toast-close" onClick={onDismiss}>×</button>
    </div>
  );
}
