"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronLeft,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { GapItem } from "@/lib/types";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";

export default function GapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gapId = params?.id as string;

  const [gap, setGap] = useState<GapItem | null>(null);

  useEffect(() => {
    async function loadGap() {
      try {
        const data = await api.getGap(gapId);
        setGap(data);
      } catch (err) {
        console.error("Failed to load gap:", err);
      }
    }
    loadGap();
  }, [gapId]);

  if (!gap) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading gap diagnostics...
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Back Link */}
      <Link
        href="/gaps"
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
        <span>Back to Gaps</span>
      </Link>

      {/* Main Diagnostic Header */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Badge variant="brand" size="sm">Capability Diagnostic</Badge>
              <Badge variant="warning" size="sm">{gap.priority} Priority</Badge>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em" }}>{gap.title}</h1>
            <div style={{ fontSize: "13px", color: "var(--accent-amber)", marginTop: "6px", fontWeight: 600 }}>
              Career Impact: {gap.expected_impact || "Required by 74% of target roles • Blocking 12 high-signal matches"}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/improve" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md" icon={<BookOpen size={14} />}>
                Start Improvement Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Capability Metric Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", background: "var(--bg-elevated)", padding: "16px 20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Current Capability</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>
              {gap.current_level} / 10
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "16px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Target Capability</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "4px" }}>
              {gap.target_level} / 10
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "16px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Estimated Effort</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "4px" }}>
              {gap.estimated_effort_hours || 24} Hours
            </div>
          </div>
        </div>
      </Card>

      {/* STRENGTHS & MISSING REQUIREMENTS */}
      <div className="grid-2">
        <Card style={{ borderLeft: "3px solid var(--accent-emerald)", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Existing Strengths Verified</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.5 }}>
            <div>✓ High concurrency Go and Python runtime mastery.</div>
            <div>✓ Solid understanding of asynchronous microservice request-response loops.</div>
            <div>✓ Verified experience building low-latency storage primitives.</div>
          </div>
        </Card>

        <Card style={{ borderLeft: "3px solid var(--accent-amber)", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <AlertTriangle size={16} color="var(--accent-amber)" />
            <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Target Requirements to Close</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.5 }}>
            <div>! Practical experience configuring Triton C++ dynamic batching.</div>
            <div>! Multi-GPU KV-cache sharing and vLLM PagedAttention operator deployment.</div>
            <div>! Verified benchmark proof of CUDA kernel throughput.</div>
          </div>
        </Card>
      </div>

      {/* 4-PHASE RESOLUTION PLAN */}
      <Card style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>
          Diagnostic Remediation Plan
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Phase 1: Learn</div>
            <div style={{ fontSize: "14px", fontWeight: 700, margin: "6px 0 4px" }}>Fundamentals</div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.45 }}>
              Read Triton architecture docs and dynamic scheduler algorithms.
            </p>
          </div>

          <div style={{ padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-emerald)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Phase 2: Practice</div>
            <div style={{ fontSize: "14px", fontWeight: 700, margin: "6px 0 4px" }}>Architecture Lab</div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.45 }}>
              Deploy a local Triton container with dynamic batching.
            </p>
          </div>

          <div style={{ padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Phase 3: Build</div>
            <div style={{ fontSize: "14px", fontWeight: 700, margin: "6px 0 4px" }}>GitHub Artifact</div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.45 }}>
              Publish a verified benchmarking repo with reproducible latency metrics.
            </p>
          </div>

          <div style={{ padding: "14px", borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#fda4af", textTransform: "uppercase", letterSpacing: "0.04em" }}>Phase 4: Prove</div>
            <div style={{ fontSize: "14px", fontWeight: 700, margin: "6px 0 4px" }}>Stage 5 Verification</div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.45 }}>
              Pass the Stage 5 diagnostic assessment to calibrate verified level.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
