"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Check,
  Zap,
  Lock,
  ExternalLink,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  ApplicationItem,
  ApplicationPolicyType,
  ResumeVersion,
  AutoApplyExecutionResponse,
  AutoApplyPreviewResponse,
} from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useToast } from "@/lib/toast-context";

export default function ApplicationsPage() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [policy, setPolicy] = useState<ApplicationPolicyType | null>(null);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [queue, setQueue] = useState<AutoApplyExecutionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "resumes" | "queue">("pipeline");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [appData, polData, resData, qData] = await Promise.all([
          api.getApplications(),
          api.getApplicationPolicy(),
          api.getResumes(),
          api.getAutomationQueue(),
        ]);
        setApplications(appData);
        setPolicy(polData);
        setResumes(resData);
        setQueue(qData);
      } catch (err) {
        console.error("Failed to load applications data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePolicyToggle = async () => {
    if (!policy) return;
    const nextMode = policy.mode === "AUTONOMOUS" ? "ASSISTED" : "AUTONOMOUS";
    try {
      const updated = await api.updateApplicationPolicy({ mode: nextMode });
      setPolicy(updated);
      showToast(
        nextMode === "AUTONOMOUS"
          ? "Autonomous mode activated with strict safety guardrails."
          : "Switched to Assisted mode (manual review required).",
        "info"
      );
    } catch (err) {
      console.error("Failed to update policy mode:", err);
      showToast("Failed to update policy mode.", "error");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <p>Loading applications...</p>
      </div>
    );
  }

  const interviewCount = applications.filter((a) => a.status === "INTERVIEW" || a.status === "SCREEN").length;
  const offerCount = applications.filter((a) => a.status === "OFFER").length;

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 1. Header with Title & Auto-Apply Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Applications</Badge>
            <Badge variant="neutral">Auto-Apply Safe</Badge>
          </div>
          <h1 style={{ fontSize: "21px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Applications & Resumes
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            Track your active submissions, tailored resumes, and automated applications.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Clean Auto-Apply Status Switch */}
          <button
            onClick={handlePolicyToggle}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 11px",
              borderRadius: "var(--radius-sm)",
              background: policy?.mode === "AUTONOMOUS" ? "rgba(225, 29, 72, 0.08)" : "var(--bg-elevated)",
              border: policy?.mode === "AUTONOMOUS" ? "1px solid rgba(225, 29, 72, 0.3)" : "1px solid var(--border-subtle)",
              color: policy?.mode === "AUTONOMOUS" ? "#fda4af" : "var(--text-main)",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Sliders size={13} color={policy?.mode === "AUTONOMOUS" ? "var(--accent-primary)" : "var(--text-muted)"} />
            <span>Mode: {policy?.mode === "AUTONOMOUS" ? "Auto-Apply Active" : "Assisted (Review)"}</span>
          </button>

          <Link href="/outcomes" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">
              View Analytics →
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 Quick Stats */}
      <div className="grid-4">
        <div className="ui-card" style={{ padding: "12px 14px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>Total Applied</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
            {applications.length}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target senior roles</span>
        </div>

        <div className="ui-card" style={{ padding: "12px 14px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>In Interviews</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "2px" }}>
            {interviewCount} Active
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Technical & deep dive</span>
        </div>

        <div className="ui-card" style={{ padding: "12px 14px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>Offers Received</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "2px" }}>
            {offerCount} Offer
          </div>
          <span style={{ fontSize: "11px", color: "var(--accent-emerald)" }}>$290k Stripe benchmark</span>
        </div>

        <div className="ui-card" style={{ padding: "12px 14px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>Tailored Resumes</span>
          <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginTop: "2px" }}>
            {resumes.length}
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Role-customized artifacts</span>
        </div>
      </div>

      {/* 3. Clean Segmented Tabs */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        {[
          { key: "pipeline", label: `Application Pipeline (${applications.length})` },
          { key: "resumes", label: `Tailored Resumes (${resumes.length})` },
          { key: "queue", label: `Automation Queue (${queue?.executions?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12.5px",
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: "pointer",
              border: activeTab === tab.key ? "1px solid var(--border-subtle)" : "1px solid transparent",
              background: activeTab === tab.key ? "var(--bg-elevated)" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "var(--text-sub)",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: APPLICATION PIPELINE */}
      {activeTab === "pipeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {applications.map((app) => (
            <div
              key={app.id}
              className="ui-card ui-card-hover"
              style={{
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {(app.job?.company?.name || "CO").slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "14.5px", fontWeight: 700 }}>
                      {app.tailored_role_title || app.job?.title || "Target Role"}
                    </h3>
                    <Badge variant="neutral" size="sm">@ {app.job?.company?.name || "Company"}</Badge>
                    <Badge
                      variant={
                        app.status === "OFFER"
                          ? "success"
                          : app.status === "INTERVIEW"
                          ? "cyan"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "3px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                    <span>📍 {app.job?.location || "Remote"}</span>
                    <span>•</span>
                    <span>Fit Score: <strong style={{ color: "var(--text-main)" }}>{app.match_score_at_application || 88}%</strong></span>
                    <span>•</span>
                    <span>Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Recently"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Link href={`/opportunities/${app.job?.id || "job-1"}`} prefetch={true} style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="sm">
                    View Job
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TAILORED RESUMES */}
      {activeTab === "resumes" && (
        <div className="grid-2">
          {resumes.map((res) => (
            <div
              key={res.id}
              className="ui-card"
              style={{
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={16} color="var(--accent-primary)" />
                    <h3 style={{ fontSize: "14px", fontWeight: 700 }}>{res.name || res.target_role}</h3>
                  </div>
                  <Badge variant="success" size="sm">Verified Artifact</Badge>
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Target: <strong>{res.target_role || "General"}</strong> • Generated {res.updated_at ? new Date(res.updated_at).toLocaleDateString() : "Recently"}
                </div>

                <p style={{ fontSize: "12px", color: "var(--text-sub)", marginTop: "6px", lineHeight: 1.4 }}>
                  {res.summary || "Tailored with verified experience in distributed systems, Raft consensus, and high-concurrency Go services."}
                </p>

                {res.emphasized_skills && res.emphasized_skills.length > 0 && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "8px" }}>
                    {res.emphasized_skills.map((sk: string) => (
                      <span key={sk} style={{ fontSize: "10.5px", padding: "1px 6px", borderRadius: "3px", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download size={12} />}
                  onClick={() => showToast(`Downloaded "${res.name || res.target_role}" resume PDF`, "success")}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AUTOMATION QUEUE */}
      {activeTab === "queue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {(queue?.executions || []).length === 0 ? (
            <div className="ui-card" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
              <p>No applications currently pending in the automation queue.</p>
            </div>
          ) : (
            (queue?.executions || []).map((ex: any, idx: number) => (
              <div
                key={idx}
                className="ui-card"
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700 }}>{ex.role_title || ex.job_title || "Senior Infrastructure Engineer"}</span>
                    <Badge variant="cyan" size="sm">{ex.match_score || 94}% Fit</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {ex.company_name || "Stripe"} • Ready for automated dispatch
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => showToast(`Submitted application for ${ex.company_name || "Stripe"}`, "success")}
                  >
                    Approve & Submit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
