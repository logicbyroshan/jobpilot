"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  Lock,
  ChevronLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { ApplicationPolicyType } from "@/lib/types";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Checkbox } from "@/app/components/ui/Checkbox";
import { useToast } from "@/lib/toast-context";

export default function AutomationSettingsPage() {
  const { showToast } = useToast();
  const [policy, setPolicy] = useState<ApplicationPolicyType | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    async function loadPolicy() {
      try {
        const data = await api.getApplicationPolicy();
        setPolicy(data);
      } catch (err) {
        console.error("Failed to load policy:", err);
      }
    }
    loadPolicy();
  }, []);

  const handleSave = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      const updated = await api.updateApplicationPolicy(policy);
      setPolicy(updated);
      setSavedNotice(true);
      showToast("Automation guardrails & policy updated!", "success");
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error("Failed to save policy:", err);
      showToast("Failed to save automation policy.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!policy) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading automation policy...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "840px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <Link
            href="/applications"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--text-dim)",
              fontSize: "12.5px",
              textDecoration: "none",
              marginBottom: "6px",
            }}
          >
            <ChevronLeft size={13} /> Back to Applications
          </Link>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Automation Settings
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            Set daily application limits, auto-apply match thresholds, and safety guardrails.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          icon={<Save size={13} />}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Success Alert */}
      {savedNotice && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "4px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#34d399",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>Automation policy saved successfully!</span>
        </div>
      )}

      {/* 1. Operating Mode Selection */}
      <Card style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Execution Mode</h3>
        <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px" }}>
          Choose how autonomously JobPilot executes applications on your behalf.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {/* MANUAL */}
          <div
            onClick={() => setPolicy({ ...policy, mode: "MANUAL" })}
            style={{
              padding: "14px",
              borderRadius: "4px",
              background: policy.mode === "MANUAL" ? "rgba(255, 255, 255, 0.08)" : "var(--bg-elevated)",
              border: policy.mode === "MANUAL" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Manual Mode</div>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
              JobPilot prepares tailored artifacts. You manually copy and submit.
            </p>
          </div>

          {/* ASSISTED (DEFAULT) */}
          <div
            onClick={() => setPolicy({ ...policy, mode: "ASSISTED" })}
            style={{
              padding: "14px",
              borderRadius: "4px",
              background: policy.mode === "ASSISTED" ? "rgba(255, 255, 255, 0.08)" : "var(--bg-elevated)",
              border: policy.mode === "ASSISTED" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Assisted Mode</span>
              <Badge variant="cyan" size="sm">Recommended</Badge>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
              JobPilot prepares everything and presents a 1-click review modal for your approval.
            </p>
          </div>

          {/* AUTONOMOUS */}
          <div
            onClick={() => setPolicy({ ...policy, mode: "AUTONOMOUS" })}
            style={{
              padding: "14px",
              borderRadius: "4px",
              background: policy.mode === "AUTONOMOUS" ? "rgba(255, 255, 255, 0.08)" : "var(--bg-elevated)",
              border: policy.mode === "AUTONOMOUS" ? "1px solid rgba(255, 255, 255, 0.25)" : "1px solid var(--border-subtle)",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px" }}>Autonomous Mode</div>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.35 }}>
              Automatically submits when all match scores and compensation rules match 100%.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Numeric & Threshold Guardrails */}
      <Card style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>Constraint Thresholds</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Input
            label="Minimum Match Score Threshold (%)"
            type="number"
            value={policy.min_match_score}
            onChange={(e) => setPolicy({ ...policy, min_match_score: parseInt(e.target.value) || 80 })}
            helperText="Only roles scoring at or above this will be processed."
          />

          <Input
            label="Daily Application Limit"
            type="number"
            value={policy.daily_application_limit}
            onChange={(e) => setPolicy({ ...policy, daily_application_limit: parseInt(e.target.value) || 5 })}
            helperText="Maximum submissions per rolling 24-hour window."
          />

          <Input
            label="Minimum Base Salary Floor ($/yr)"
            type="number"
            value={policy.salary_floor || 220000}
            onChange={(e) => setPolicy({ ...policy, salary_floor: parseInt(e.target.value) || 200000 })}
            helperText="Rejects any opportunity below this compensation level."
          />

          <div>
            <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "5px" }}>
              Restricted / Excluded Companies
            </label>
            <input
              type="text"
              defaultValue="Current Employer, Legacy Corp"
              style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
              placeholder="Comma-separated company names"
            />
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
              JobPilot will never view or submit to these companies.
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Safety Checkboxes */}
      <Card style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>Safety & Review Checks</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <Checkbox
              checked={policy.require_review_for_senior_roles !== false}
              onChange={(val: any) => setPolicy({ ...policy, require_review_for_senior_roles: typeof val === "boolean" ? val : val?.target?.checked })}
            />
            <span style={{ fontSize: "13px", color: "var(--text-main)" }}>
              Always require manual confirmation for Staff, Principal, or Architect level roles
            </span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <Checkbox
              checked={policy.auto_tailor_resume !== false}
              onChange={(val: any) => setPolicy({ ...policy, auto_tailor_resume: typeof val === "boolean" ? val : val?.target?.checked })}
            />
            <span style={{ fontSize: "13px", color: "var(--text-main)" }}>
              Automatically select relevant verified evidence bullets for each application
            </span>
          </label>
        </div>
      </Card>
    </div>
  );
}
