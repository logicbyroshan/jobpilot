"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          const borderColor = isSuccess
            ? "rgba(16, 185, 129, 0.4)"
            : isError
            ? "rgba(225, 29, 72, 0.4)"
            : isWarning
            ? "rgba(245, 158, 11, 0.4)"
            : "rgba(6, 182, 212, 0.4)";

          const bgColor = isSuccess
            ? "rgba(16, 185, 129, 0.12)"
            : isError
            ? "rgba(225, 29, 72, 0.12)"
            : isWarning
            ? "rgba(245, 158, 11, 0.12)"
            : "rgba(6, 182, 212, 0.12)";

          const iconColor = isSuccess
            ? "#10b981"
            : isError
            ? "#f43f5e"
            : isWarning
            ? "#f59e0b"
            : "#06b6d4";

          const IconComponent = isSuccess
            ? CheckCircle2
            : isError
            ? AlertCircle
            : isWarning
            ? AlertTriangle
            : Info;

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "6px",
                background: "#0d1322",
                border: `1px solid ${borderColor}`,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                color: "#f8fafc",
                fontSize: "13px",
                fontWeight: 500,
                minWidth: "260px",
                maxWidth: "380px",
                animation: "pageFadeIn 0.2s ease-out",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "4px",
                  background: bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconComponent size={14} color={iconColor} />
              </div>

              <span style={{ flex: 1 }}>{toast.message}</span>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (message: string) => console.log("Toast:", message),
    };
  }
  return context;
}
