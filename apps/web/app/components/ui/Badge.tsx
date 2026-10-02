import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "primary" | "neutral" | "success" | "emerald" | "warning" | "amber" | "cyan" | "purple" | "danger" | "rose";
  size?: "sm" | "md";
  dot?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  icon,
  className = "",
  style = {},
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, { bg: string; color: string; border: string; dotColor: string }> = {
    brand: {
      bg: "rgba(225, 29, 72, 0.12)",
      color: "#fda4af",
      border: "rgba(225, 29, 72, 0.25)",
      dotColor: "#e11d48",
    },
    primary: {
      bg: "rgba(225, 29, 72, 0.12)",
      color: "#fda4af",
      border: "rgba(225, 29, 72, 0.25)",
      dotColor: "#e11d48",
    },
    neutral: {
      bg: "rgba(255, 255, 255, 0.05)",
      color: "var(--text-muted)",
      border: "var(--border-subtle)",
      dotColor: "var(--text-dim)",
    },
    success: {
      bg: "rgba(16, 185, 129, 0.1)",
      color: "#34d399",
      border: "rgba(16, 185, 129, 0.25)",
      dotColor: "#10b981",
    },
    emerald: {
      bg: "rgba(16, 185, 129, 0.1)",
      color: "#34d399",
      border: "rgba(16, 185, 129, 0.25)",
      dotColor: "#10b981",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.1)",
      color: "#fbbf24",
      border: "rgba(245, 158, 11, 0.25)",
      dotColor: "#f59e0b",
    },
    amber: {
      bg: "rgba(245, 158, 11, 0.1)",
      color: "#fbbf24",
      border: "rgba(245, 158, 11, 0.25)",
      dotColor: "#f59e0b",
    },
    cyan: {
      bg: "rgba(6, 182, 212, 0.1)",
      color: "#22d3ee",
      border: "rgba(6, 182, 212, 0.25)",
      dotColor: "#06b6d4",
    },
    purple: {
      bg: "rgba(168, 85, 247, 0.1)",
      color: "#d8b4fe",
      border: "rgba(168, 85, 247, 0.25)",
      dotColor: "#a855f7",
    },
    danger: {
      bg: "rgba(239, 68, 68, 0.12)",
      color: "#fca5a5",
      border: "rgba(239, 68, 68, 0.3)",
      dotColor: "#ef4444",
    },
    rose: {
      bg: "rgba(244, 63, 94, 0.12)",
      color: "#fda4af",
      border: "rgba(244, 63, 94, 0.3)",
      dotColor: "#f43f5e",
    },
  };

  const current = variantStyles[variant] || variantStyles.neutral;
  const padding = size === "sm" ? "1px 6px" : "2px 7px";
  const fontSize = size === "sm" ? "10.5px" : "11.5px";

  return (
    <span
      className={`ui-badge ui-badge-${variant} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: "4px",
        background: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            backgroundColor: current.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
}
