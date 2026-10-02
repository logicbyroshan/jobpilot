"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Target,
  RefreshCw,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { FunnelAnalytics } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function OutcomesPage() {
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFunnel() {
      try {
        const data = await api.getFunnelAnalytics();
        setFunnel(data);
      } catch (err) {
        console.error("Failed to load outcomes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFunnel();
  }, []);

  const stages = [
    { label: "Submitted Applications", count: 18, rate: "100%", color: "var(--text-muted)" },
    { label: "Recruiter Screen", count: 6, rate: "33.3%", color: "var(--cyan)" },
    { label: "Technical Deep Dive", count: 4, rate: "22.2%", color: "var(--brand)" },
    { label: "Final Architecture Round", count: 2, rate: "11.1%", color: "#9d4edd" },
    { label: "Offers Received", count: 1, rate: "5.5%", color: "#10b981" },
  ];

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-sub)" }}>
        <p>Loading career intelligence and conversion analytics...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Analytics</Badge>
            <span style={{ fontSize: "12.5px", color: "var(--text-sub)" }}>Application Funnel</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Application Analytics & Funnel
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "13px", marginTop: "3px" }}>
            Track application conversion rates across interview stages and view recommendations.
          </p>
        </div>

        <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
          <Button variant="primary" size="sm" icon={<BookOpen size={13} />}>
            View Learning Plan →
          </Button>
        </Link>
      </div>

      {/* STRATEGIC BOTTLENECK DIAGNOSTIC (CLOSED LOOP TO IMPROVE) */}
      <div
        className="ui-card"
        style={{
          background: "linear-gradient(135deg, rgba(225,29,72,0.06) 0%, rgba(12,18,32,0.98) 100%)",
          borderColor: "rgba(225,29,72,0.25)",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "6px", background: "rgba(225,29,72,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0 }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--brand)", letterSpacing: "0.05em" }}>
                  Key Improvement Area
                </span>
                <Badge variant="brand" size="sm">High Impact</Badge>
              </div>
              <h2 style={{ fontSize: "16px", fontWeight: 800, marginTop: "2px" }}>
                Technical Round: GPU Cluster Scheduling & Triton Serving
              </h2>
              <p style={{ fontSize: "12.5px", color: "var(--text-sub)", marginTop: "4px", lineHeight: 1.5 }}>
                You have a 100% pass rate at recruiter screen. Building verified projects with GPU streaming concurrency and Triton dynamic batching will significantly boost technical round pass rates.
              </p>
            </div>
          </div>

          <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm" icon={<ArrowRight size={13} />}>
              Start Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Conversion Funnel Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Conversion Funnel</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
          {stages.map((stage, idx) => (
            <div key={idx} className="ui-card" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "11.5px", color: "var(--text-dim)", fontWeight: 600 }}>{stage.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)" }}>{stage.count}</div>
              <div style={{ fontSize: "11.5px", color: stage.color, fontWeight: 700 }}>
                {stage.rate} conversion
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REJECTION & FAILURE REASONS (CLOSED-LOOP FEEDBACK MATRIX) */}
      <div className="grid-2">
        <div className="ui-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={17} color="var(--brand)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Interview Feedback Intelligence</h3>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-sub)", lineHeight: 1.5 }}>
            Direct interview feedback mapped to specific competencies:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ padding: "12px", background: "var(--bg-elevated)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Anthropic (Principal Infrastructure)</span>
                <Badge variant="warning" size="sm">Outcome Gap</Badge>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-sub)", marginTop: "4px", lineHeight: 1.45 }}>
                &ldquo;Candidate demonstrated stellar Raft consensus foundations, but lacked production evidence for multi-stream dynamic GPU queuing.&rdquo;
              </p>
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "11.5px", color: "var(--brand)", fontWeight: 600 }}>Diagnosed Gap: Triton Dynamic Batching</span>
                <Link href="/improve" prefetch={true} style={{ textDecoration: "none", fontSize: "11.5px", color: "var(--brand)", fontWeight: 700 }}>
                  Fix in Learning Plan →
                </Link>
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Datadog (Staff Storage Architect)</span>
                <Badge variant="cyan" size="sm">Advancing</Badge>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-sub)", marginTop: "4px", lineHeight: 1.45 }}>
                &ldquo;Exceptional mastery in zero-copy LSM compaction algorithms. Fast-tracked to final offer committee.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Offer & Negotiation Intelligence */}
        <div className="ui-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={17} color="#10b981" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Offer & Compensation Intelligence</h3>
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--text-sub)", lineHeight: 1.5 }}>
            Current active offer benchmarked against industry peer percentiles:
          </p>

          <div style={{ padding: "14px", background: "rgba(16,185,129,0.06)", borderRadius: "6px", border: "1px solid rgba(16,185,129,0.25)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: 800 }}>Stripe (Staff Infrastructure)</span>
              <Badge variant="success" size="sm">Offer Received</Badge>
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#10b981" }}>
              $290,000 / yr <span style={{ fontSize: "12.5px", color: "var(--text-sub)", fontWeight: 500 }}>+ $140k Equity/yr</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-sub)" }}>
              📍 92nd percentile for San Francisco Staff Infrastructure Architects
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
            <span style={{ fontSize: "12.5px", color: "var(--text-sub)" }}>Career Readiness Status:</span>
            <Badge variant="brand" size="sm">82% Overall</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
