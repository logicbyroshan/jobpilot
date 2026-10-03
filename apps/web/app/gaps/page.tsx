"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { GapItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function GapsPage() {
  const [gaps, setGaps] = useState<GapItem[]>([]);

  useEffect(() => {
    async function loadGaps() {
      try {
        const data = await api.getGaps();
        setGaps(data);
      } catch (err) {
        console.error("Failed to load gaps:", err);
      }
    }
    loadGaps();
  }, []);

  const criticalGaps = gaps.filter((g) => g.priority === "CRITICAL");
  const highGaps = gaps.filter((g) => g.priority === "HIGH");
  const primaryGaps = criticalGaps.length > 0 ? criticalGaps : (highGaps.length > 0 ? highGaps.slice(0, 1) : []);
  const secondaryGaps = gaps.filter((g) => !primaryGaps.some((p) => p.id === g.id));

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">Skill Gaps</Badge>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Target Role Analysis</span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Identified Skill Gaps
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "14px", marginTop: "4px", lineHeight: 1.55 }}>
            Key technical areas to develop to increase your match ranking for target senior roles.
          </p>
        </div>

        <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
          <Button variant="primary" size="sm" icon={<BookOpen size={14} />}>
            View Learning Plan
          </Button>
        </Link>
      </div>

      {gaps.length === 0 ? (
        <Card style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
          <Sparkles size={28} style={{ color: "var(--accent-emerald)", margin: "0 auto 12px auto" }} />
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
            No Blocking Skill Gaps Identified
          </h3>
          <p style={{ fontSize: "13px" }}>Your current capability graph matches 100% of required competencies for your target roles.</p>
        </Card>
      ) : (
        <>
          {/* Primary High-Impact Blockers Section */}
          {primaryGaps.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Badge variant="warning" size="sm">
                  {criticalGaps.length > 0 ? "Critical Priority" : "High Priority Blockers"}
                </Badge>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                  {criticalGaps.length > 0
                    ? "Actively blocking top-tier compensation roles"
                    : "Key opportunity unlockers for senior infra & backend positions"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {primaryGaps.map((gap) => (
                  <Card
                    key={gap.id}
                    style={{
                      borderLeft: "3px solid var(--accent-amber)",
                      padding: "18px 20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{gap.title}</h3>
                          <Badge variant="warning" size="sm">{gap.priority}</Badge>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--accent-amber)", fontWeight: 600 }}>
                          Impact: {gap.expected_impact || "Required by 74% of target roles • Blocking high-signal matches"}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
                          Level {gap.current_level} → <span style={{ color: "var(--accent-emerald)" }}>{gap.target_level} Target</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                          Est. Effort: {gap.estimated_effort_hours || gap.estimated_hours_to_close || 24} Hours
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45, marginBottom: "12px" }}>
                      {gap.rationale}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "11.5px", color: "var(--text-dim)", fontWeight: 600 }}>Missing:</span>
                        <Badge variant="neutral" size="sm">Triton Inference Server</Badge>
                        <Badge variant="neutral" size="sm">vLLM PagedAttention</Badge>
                        <Badge variant="neutral" size="sm">CUDA Kernel Optimization</Badge>
                      </div>

                      <Link href={`/gaps/${gap.id}`} style={{ textDecoration: "none" }}>
                        <Button variant="primary" size="sm" icon={<ArrowRight size={13} />} iconPosition="right">
                          Close This Gap
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Optimization Opportunities */}
          {secondaryGaps.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", marginTop: "10px" }}>
                <Badge variant="warning" size="sm">Secondary Optimization</Badge>
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Secondary optimization opportunities</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                {secondaryGaps.map((gap) => (
                  <Card key={gap.id} style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <h4 style={{ fontSize: "14.5px", fontWeight: 700 }}>{gap.title}</h4>
                      <Badge variant="warning" size="sm">{gap.priority}</Badge>
                    </div>

                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginBottom: "8px" }}>
                      Level {gap.current_level} → Target {gap.target_level}
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4, marginBottom: "12px" }}>
                      {gap.rationale}
                    </p>

                    <Link href={`/gaps/${gap.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary" size="sm" style={{ width: "100%" }}>
                        Inspect Diagnostic Plan
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
