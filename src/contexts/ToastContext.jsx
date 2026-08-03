import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

const COLORS = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-slate-700",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = "success") => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);

    // Start the exit animation slightly before removal, matching the
    // original 3000ms visible + 200ms fade-out timing.
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    }, 3000);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${COLORS[t.type] || COLORS.info} text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg transition-all duration-200 max-w-xs ${
              t.leaving ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
