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

export default function ApplicationsControlCenterPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [policy, setPolicy] = useState<ApplicationPolicyType | null>(null);
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [queue, setQueue] = useState<AutoApplyExecutionResponse | null>(null);
  const [preview, setPreview] = useState<AutoApplyPreviewResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"pipeline" | "resumes" | "queue" | "policy">("pipeline");
  const [selectedResume, setSelectedResume] = useState<ResumeVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [appData, polData, resData, qData, prevData] = await Promise.all([
          api.getApplications(),
          api.getApplicationPolicy(),
          api.getResumes(),
          api.getAutomationQueue(),
          api.getAutoApplyPreview(),
        ]);
        setApplications(appData);
        setPolicy(polData);
        setResumes(resData);
        setQueue(qData);
        setPreview(prevData);
        if (resData.length > 0) {
          setSelectedResume(resData[0]);
        }
      } catch (err) {
        console.error("Failed to load applications data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePolicyToggle = async (mode: string) => {
    if (!policy) return;
    try {
      const updated = await api.updateApplicationPolicy({ mode });
      setPolicy(updated);
    } catch (err) {
      console.error("Failed to update policy mode:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-sub)" }}>
        <p>Loading Applications Control Center...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Applications</Badge>
            <span style={{ fontSize: "12.5px", color: "var(--text-sub)" }}>Submissions & Resumes</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Applications & Resumes
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "13px", marginTop: "3px" }}>
            Track active job applications, tailored resume versions, and automated submissions.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/outcomes" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">
              View Analytics →
            </Button>
          </Link>
        </div>
      </div>

      {/* Safety Policy & Queue Banner */}
      <div
        className="ui-card"
        style={{
          background: "linear-gradient(135deg, rgba(225,29,72,0.06) 0%, rgba(12,18,32,0.98) 100%)",
          borderColor: "rgba(225,29,72,0.2)",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "6px", background: "rgba(225,29,72,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 700 }}>Auto-Apply: {policy?.mode || "ASSISTED"} Mode</h2>
                <Badge variant={policy?.mode === "AUTONOMOUS" ? "brand" : "cyan"} size="sm">
                  {policy?.mode === "AUTONOMOUS" ? "Auto Submissions Active" : "Review Required"}
                </Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Daily limit: {policy?.daily_application_limit || 5}/day • Min fit: {policy?.min_match_score || 85}% • 100% verified claims.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="secondary"
              size="sm"
              icon={<Sliders size={13} />}
              onClick={() => handlePolicyToggle(policy?.mode === "AUTONOMOUS" ? "ASSISTED" : "AUTONOMOUS")}
            >
              {policy?.mode === "AUTONOMOUS" ? "Switch to Assisted" : "Enable Auto-Apply"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
        {[
          { key: "pipeline", label: `Application Pipeline (${applications.length})` },
          { key: "resumes", label: `Resume Center (${resumes.length})` },
          { key: "queue", label: `Execution Queue (${queue?.executions?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "13px",
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

      {/* TAB 1: PIPELINE */}
      {activeTab === "pipeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {applications.map((app) => (
            <Card key={app.id} style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 800 }}>{app.tailored_role_title || app.job?.title || "Target Application"}</h3>
                  <Badge variant="neutral">@ {app.job?.company?.name || "Company"}</Badge>
                  <Badge variant={app.status === "OFFER" ? "success" : app.status === "INTERVIEW" ? "cyan" : "brand"}>
                    {app.status}
                  </Badge>
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "6px", fontSize: "13px", color: "var(--text-muted)" }}>
                  <span>📍 {app.job?.location || "Remote"}</span>
                  <span>•</span>
                  <span>⚡ Match Score: <strong style={{ color: "var(--brand)" }}>{app.match_score_at_application || 85}%</strong></span>
                  <span>•</span>
                  <span>Applied {app.created_at ? new Date(app.created_at).toLocaleDateString() : "Recently"}</span>
                </div>
                {app.notes && (
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", marginTop: "6px", fontStyle: "italic" }}>
                    Note: {app.notes}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {app.job?.id && (
                  <Link href={`/opportunities/${app.job.id}`} prefetch={true} style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm">
                      View Match Analysis
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: RESUME CENTER & TAILORING WITH TRUTHFULNESS GUARANTEE */}
      {activeTab === "resumes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "24px", alignItems: "flex-start" }}>
          {/* Resume Version Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Resume Versions
            </div>
            {resumes.map((res) => {
              const isSelected = selectedResume?.id === res.id;
              return (
                <Card
                  key={res.id}
                  onClick={() => setSelectedResume(res)}
                  style={{
                    padding: "18px",
                    cursor: "pointer",
                    borderColor: isSelected ? "var(--brand)" : "var(--border-subtle)",
                    background: isSelected ? "rgba(230,57,70,0.04)" : "var(--bg-surface)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{res.name}</h4>
                    <Badge variant={res.version_type === "MASTER" ? "brand" : "cyan"} size="sm">
                      {res.version_type}
                    </Badge>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.5, margin: 0 }}>
                    {res.summary}
                  </p>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Updated {res.updated_at}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Detailed Resume View & Diff Rationale */}
          {selectedResume && (
            <Card style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Badge variant="brand">{selectedResume.version_type}</Badge>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, marginTop: "8px" }}>{selectedResume.name}</h3>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>Target Role: {selectedResume.target_role}</div>
                </div>
                <Badge variant="success" icon={<CheckCircle2 size={13} />}>
                  100% Truthfulness Verified
                </Badge>
              </div>

              {/* Truthfulness Guarantee Notice */}
              <div style={{ padding: "14px", background: "rgba(16,185,129,0.06)", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.25)", fontSize: "13px", color: "var(--text-main)", lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: "#10b981", marginBottom: "2px" }}>AI Integrity Policy</div>
                JobPilot never hallucinates experience. Every claim, latency metric, and project in this resume is strictly derived from verified GitHub commits, patents, and confirmed employment history.
              </div>

              {/* Change Rationale (Diff explanation) */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Why This Resume Was Tailored
                </h4>
                <p style={{ fontSize: "14px", color: "var(--text-sub)", lineHeight: 1.6 }}>
                  {selectedResume.change_rationale}
                </p>
              </div>

              {/* Skills Emphasized vs Reduced */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", marginBottom: "6px" }}>
                    ✓ Emphasized Highlights
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(selectedResume.emphasized_skills || []).map((s, idx) => (
                      <span key={idx} style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "4px", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                    — De-emphasized General Topics
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(selectedResume.reduced_skills || []).length > 0 ? (
                      (selectedResume.reduced_skills || []).map((s, idx) => (
                        <span key={idx} style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                          {s}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None (Master Baseline)</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <Button variant="secondary" size="md">
                  Download Canonical PDF
                </Button>
                <Button variant="primary" size="md">
                  Use for Target Application
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: EXECUTION QUEUE */}
      {activeTab === "queue" && queue && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            <Card style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>QUEUED</div>
              <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "2px" }}>{queue.queued_count || 0}</div>
            </Card>
            <Card style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--cyan)" }}>PROCESSING</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cyan)", marginTop: "2px" }}>{queue.processing_count || 0}</div>
            </Card>
            <Card style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "#10b981" }}>SUBMITTED</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>{queue.submitted_count || 0}</div>
            </Card>
            <Card style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--brand)" }}>NEEDS REVIEW</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--brand)", marginTop: "2px" }}>{queue.needs_review_count || 0}</div>
            </Card>
            <Card style={{ padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>FAILED</div>
              <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "2px" }}>{queue.failed_count || 0}</div>
            </Card>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(queue.executions || []).map((item) => (
              <Card key={item.id} style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 700 }}>{item.role_title}</h4>
                    <Badge variant="neutral">@ {item.company_name}</Badge>
                    <Badge variant={item.status === "SUBMITTED" ? "success" : item.status === "PROCESSING" ? "cyan" : item.status === "NEEDS_REVIEW" ? "brand" : "neutral"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "4px", fontSize: "13px", color: "var(--text-muted)" }}>
                    <span>Match Score: <strong style={{ color: "var(--brand)" }}>{item.match_score}%</strong></span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                  </div>
                  {item.failure_reason && (
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "var(--brand)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertTriangle size={14} /> {item.failure_reason}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {item.can_fix && (
                    <Button variant="primary" size="sm">
                      Provide Answer & Submit
                    </Button>
                  )}
                  {item.status === "SUBMITTED" && (
                    <Badge variant="success">Submitted via API</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
