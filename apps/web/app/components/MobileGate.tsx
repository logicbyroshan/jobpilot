"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, Download, ArrowRight, Eye } from "lucide-react";
import { Button } from "./ui/Button";

export function MobileGate() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("jobpilot_mobile_gate_dismissed") === "true";
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("jobpilot_mobile_gate_dismissed", "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="mobile-gate-screen">
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          padding: "32px 24px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Brand */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "8px",
              background: "#131929",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
            }}
          >
            <img src="/logo-dark.png" alt="JobPilot" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "-0.02em" }}>
              <span style={{ color: "#f8fafc" }}>Job</span>
              <span style={{ color: "var(--accent-primary)" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "10.5px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Career OS
            </div>
          </div>
        </div>

        {/* Icon & Status */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(6, 182, 212, 0.12)",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <Smartphone size={30} color="var(--accent-cyan)" />
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px", color: "#f8fafc" }}>
          Optimized for Desktop Workstations
        </h2>

        <p style={{ fontSize: "14px", color: "var(--text-sub)", lineHeight: 1.55, marginBottom: "20px" }}>
          JobPilot&apos;s career intelligence workspace is built for multi-column comparison on screens <strong>1000px and wider</strong>.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
          <Button
            variant="primary"
            size="md"
            style={{ width: "100%", justifyContent: "center" }}
            icon={<Eye size={15} />}
            onClick={handleDismiss}
          >
            Continue to Web Workspace
          </Button>

          <Button
            variant="secondary"
            size="md"
            style={{ width: "100%", justifyContent: "center" }}
            icon={<Download size={15} />}
          >
            Download Mobile App
          </Button>
        </div>

        <div style={{ fontSize: "12px", color: "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <Monitor size={14} />
          <span>Desktop recommended • Tap above to preview</span>
        </div>
      </div>
    </div>
  );
}

