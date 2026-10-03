"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Send,
  Award,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";
import { MatchItem, Job } from "@/lib/types";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchItem | null>(null);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const matches = await api.getMatches();
        const found = matches.find((m) => m.job.id === jobId) || matches[0];
        setMatch(found);
        setJob(found.job);
      } catch (err) {
        console.error("Failed to load opportunity:", err);
      }
    }
    loadOpportunity();
  }, [jobId]);

  const handlePrepareApplication = async () => {
    setPreparing(true);
    try {
      if (job) {
        await api.createApplication({
          job_id: job.id,
          tailored_role_title: job.title,
          notes: "Prepared via Opportunity Intelligence deep dive.",
        });
        router.push("/applications");
      }
    } catch (err) {
      console.error("Prepare application error:", err);
    } finally {
      setPreparing(false);
    }
  };

  if (!job || !match) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading opportunity intelligence...
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back Link */}
      <Link
        href="/opportunities"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-sub)",
          fontSize: "13px",
          fontWeight: 600,
          textDecoration: "none",
          width: "fit-content",
        }}
      >
        <ChevronLeft size={15} />
        <span>Back to Opportunities</span>
      </Link>

      {/* Hero Opportunity Card */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                color: "var(--accent-primary)",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              {(job.company?.name || "CO").slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>{job.title}</h1>
                <Badge variant={(match.overall_score || 0) >= 90 ? "success" : "cyan"} size="sm">
                  {(match.overall_score || 0).toFixed(0)}% Overall Fit
                </Badge>
              </div>

              <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--text-sub)", marginTop: "6px", flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Building2 size={14} style={{ color: "var(--text-muted)" }} /> {job.company?.name || "Company"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <MapPin size={14} style={{ color: "var(--text-muted)" }} /> {job.location || "Remote"}
                </span>
                {job.salary_min && (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--accent-emerald)", fontWeight: 600 }}>
                    <DollarSign size={14} /> ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} / yr
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="primary"
              size="md"
              onClick={handlePrepareApplication}
              disabled={preparing}
              icon={<Send size={14} />}
            >
              {preparing ? "Tailoring..." : "Prepare Application"}
            </Button>
          </div>
        </div>

        {/* 4-Dimensional Fit Radar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", background: "var(--bg-elevated)", padding: "14px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Technical Fit</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "4px" }}>
              {(match.technical_fit || 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Experience Fit</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "4px" }}>
              {(match.experience_fit || 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Preference Fit</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-primary)", marginTop: "4px" }}>
              {(match.preference_fit || 0).toFixed(0)}%
            </div>
          </div>
          <div style={{ textAlign: "center", borderLeft: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Evidence Proof</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
              {(match.evidence_confidence || 94).toFixed(0)}%
            </div>
          </div>
        </div>
      </Card>

      {/* WHY YOU MATCH & SKILL DEFICITS */}
      <div className="grid-2">
        {/* Why You Match */}
        <Card style={{ borderLeft: "3px solid var(--accent-emerald)", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Why You Match</h3>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.5 }}>
            {match.explanation || "Strong technical and architectural alignment with verified evidence provenance."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(match.matched_skills_json || []).map((sk) => (
              <div
                key={sk}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(16, 185, 129, 0.05)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>✓ {sk}</span>
                <Badge variant="success" size="sm">Verified</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Skill Deficits */}
        <Card style={{ borderLeft: "3px solid var(--accent-amber)", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <AlertTriangle size={16} color="var(--accent-amber)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Skill Gaps & Deficits</h3>
          </div>

          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.5 }}>
            Competency deficits identified for this position. Closing these increases your match ranking and offer probability.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {match.missing_skills_json && match.missing_skills_json.length > 0 ? (
              match.missing_skills_json.map((sk) => (
                <div
                  key={sk}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(245, 158, 11, 0.05)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{sk}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>Required by hiring team • Target 6.5+</div>
                  </div>
                  <Link href="/improve" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm">
                      Close Gap →
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div style={{ fontSize: "13px", color: "var(--accent-emerald)", fontWeight: 600 }}>
                ✓ No critical skill deficits detected for this role.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Role Responsibilities & Requirements Matrix */}
      <Card style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "14px" }}>Role Responsibilities & Technical Scope</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(job.responsibilities_json || [
            "Architect and lead scalable distributed systems with low latency SLAs.",
            "Collaborate with infrastructure and engineering teams on high-throughput services."
          ]).map((resp, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                fontSize: "13px",
                lineHeight: 1.5,
                color: "var(--text-sub)",
              }}
            >
              • {resp}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
