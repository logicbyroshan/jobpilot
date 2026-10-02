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
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">Analytics</Badge>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Application Funnel</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Application Analytics & Funnel
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "14px", marginTop: "4px", lineHeight: 1.55 }}>
            Track application conversion rates across interview stages and view recommendations.
          </p>
        </div>

        <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
          <Button variant="primary" size="md" icon={<BookOpen size={15} />}>
            View Learning Plan →
          </Button>
        </Link>
      </div>

      {/* STRATEGIC BOTTLENECK DIAGNOSTIC (CLOSED LOOP TO IMPROVE) */}
      <Card
        style={{
          background: "linear-gradient(135deg, rgba(230,57,70,0.08) 0%, rgba(20,22,30,0.95) 100%)",
          borderColor: "rgba(230,57,70,0.3)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(230,57,70,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0 }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--brand)", letterSpacing: "0.06em" }}>
                  Key Improvement Area
                </span>
                <Badge variant="brand">High Impact</Badge>
              </div>
              <h2 style={{ fontSize: "19px", fontWeight: 800, marginTop: "4px" }}>
                Technical Round: GPU Cluster Scheduling & Triton Serving
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-sub)", marginTop: "6px", lineHeight: 1.6 }}>
                You have a 100% pass rate at recruiter screen. Building verified projects with GPU streaming concurrency and Triton dynamic batching will significantly boost technical round pass rates.
              </p>
            </div>
          </div>

          <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="primary" size="md" icon={<ArrowRight size={15} />}>
              Start Recommended Task
            </Button>
          </Link>
        </div>
      </Card>

      {/* Conversion Funnel Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Conversion Funnel Analytics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
          {stages.map((stage, idx) => (
            <Card key={idx} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
              <div style={{ fontSize: "12px", color: "var(--text-sub)", fontWeight: 600 }}>{stage.label}</div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-main)" }}>{stage.count}</div>
              <div style={{ fontSize: "12px", color: stage.color, fontWeight: 700 }}>
                {stage.rate} conversion
              </div>
              {idx < stages.length - 1 && (
                <div style={{ position: "absolute", right: "-12px", top: "50%", transform: "translateY(-50%)", zIndex: 2, color: "var(--text-muted)" }}>
                  →
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* REJECTION & FAILURE REASONS (CLOSED-LOOP FEEDBACK MATRIX) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={20} style={{ color: "var(--brand)" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 800 }}>Outcome Gap Intelligence</h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.6 }}>
            Direct interview feedback analyzed and mapped to specific competencies:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700 }}>Anthropic (Principal Infrastructure)</span>
                <Badge variant="warning">Outcome Gap</Badge>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-sub)", marginTop: "6px", lineHeight: 1.5 }}>
                &ldquo;Candidate demonstrated stellar Raft consensus foundations, but lacked production evidence for multi-stream dynamic GPU queuing.&rdquo;
              </p>
              <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "12px", color: "var(--brand)", fontWeight: 600 }}>Diagnosed Gap: Triton Dynamic Batching</span>
                <Link href="/improve" prefetch={true} style={{ textDecoration: "none", fontSize: "12px", color: "var(--brand)", fontWeight: 700 }}>
                  Fix in Improve →
                </Link>
              </div>
            </div>

            <div style={{ padding: "14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700 }}>Datadog (Staff Storage Architect)</span>
                <Badge variant="cyan">Advancing</Badge>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.5 }}>
                &ldquo;Exceptional mastery in zero-copy LSM compaction algorithms. Fast-tracked to final offer committee.&rdquo;
              </p>
            </div>
          </div>
        </Card>

        {/* Offer & Negotiation Intelligence */}
        <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={20} style={{ color: "#10b981" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 800 }}>Offer & Compensation Intelligence</h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.6 }}>
            Current active offer benchmarked against industry peer percentiles:
          </p>

          <div style={{ padding: "16px", background: "rgba(16,185,129,0.06)", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.25)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "15px", fontWeight: 800 }}>Stripe (Staff Infrastructure)</span>
              <Badge variant="success">Offer Received</Badge>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 900, color: "#10b981" }}>
              $290,000 / yr <span style={{ fontSize: "14px", color: "var(--text-sub)", fontWeight: 500 }}>+ $140k Equity/yr</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-sub)" }}>
              📍 92nd percentile for San Francisco Staff Infrastructure Architects
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Career Operating Loop Status:</span>
            <Badge variant="brand">82% Overall Readiness</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
