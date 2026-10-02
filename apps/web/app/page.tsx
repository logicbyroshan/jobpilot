"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Send,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  UserProfile,
  MatchItem,
  GapItem,
  LearningPlanType,
  ApplicationItem,
  FunnelAnalytics,
  CareerGoal,
  ActivityItem,
} from "@/lib/types";
import { Button } from "./components/ui/Button";
import { Badge } from "./components/ui/Badge";
import { Card } from "./components/ui/Card";
import { useToast } from "@/lib/toast-context";
import { Edit3, X, Check, DollarSign, Building } from "lucide-react";

export default function OverviewPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState<CareerGoal | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [plans, setPlans] = useState<LearningPlanType[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [funnel, setFunnel] = useState<FunnelAnalytics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recalculating, setRecalculating] = useState(false);

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editRole, setEditRole] = useState("");
  const [editComp, setEditComp] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, goalData, matchData, gapData, planData, appData, funData] = await Promise.all([
          api.getProfile(),
          api.getCareerGoal(),
          api.getMatches(),
          api.getGaps(),
          api.getLearningPlans(),
          api.getApplications(),
          api.getFunnelAnalytics(),
        ]);
        setProfile(profData);
        setGoal(goalData);
        setEditRole(goalData?.target_role || "Staff Distributed Systems Architect");
        setEditComp(goalData?.target_salary_range || "$240k – $320k + Equity");
        setMatches(matchData);
        setGaps(gapData);
        setPlans(planData);
        setApplications(appData);
        setFunnel(funData);
        setActivities(api.getRecentActivities());
      } catch (err) {
        console.error("Error loading overview data:", err);
      }
    }
    loadData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const updatedMatches = await api.recalculateMatches();
      setMatches(updatedMatches);
      showToast("Career radar & match fit scores recalculated!", "success");
    } catch (err) {
      console.error("Error recalculating matches:", err);
      showToast("Failed to recalculate matches.", "error");
    } finally {
      setRecalculating(false);
    }
  };

  const handleSaveGoal = async () => {
    if (!editRole.trim()) return;
    setSavingGoal(true);
    try {
      const updated = await api.updateCareerGoal({
        target_role: editRole,
        target_salary_range: editComp,
      });
      setGoal(updated);
      setIsGoalModalOpen(false);
      showToast(`Target goal updated to "${editRole}"!`, "success");
      // Auto trigger recalculation
      handleRecalculate();
    } catch (err) {
      console.error("Error saving goal:", err);
      showToast("Failed to update career goal.", "error");
    } finally {
      setSavingGoal(false);
    }
  };

  const stages = [
    { num: "01", name: "Profile", href: "/know", tag: "8 Skills", icon: UserCheck, active: false },
    { num: "02", name: "Opportunities", href: "/opportunities", tag: "94% Fit", icon: Target, active: false },
    { num: "03", name: "Skill Gaps", href: "/gaps", tag: "1 Blocker", icon: Sparkles, active: false },
    { num: "04", name: "Learning Plan", href: "/improve", tag: "Tasks", icon: BookOpen, active: false },
    { num: "05", name: "Assessments", href: "/prove", tag: "Ready", icon: Award, active: true },
    { num: "06", name: "Applications", href: "/applications", tag: "2 Active", icon: Send, active: false },
    { num: "07", name: "Analytics", href: "/outcomes", tag: "1 Offer", icon: TrendingUp, active: false },
  ];

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* 1. Header with Career Goal and Readiness */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "14px",
          paddingBottom: "2px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">JobPilot</Badge>
            <Badge variant="success" dot>Active</Badge>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Good afternoon, {profile?.full_name || "Alex Chen"}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "6px",
              fontSize: "13.5px",
              color: "var(--text-sub)",
              flexWrap: "wrap",
            }}
          >
            <span>Target: <strong style={{ color: "#ffffff" }}>{goal?.target_role || "Staff Distributed Systems Architect"}</strong></span>
            <span style={{ color: "var(--border-subtle)" }}>•</span>
            <span>Readiness: <strong style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>82%</strong></span>
            <span style={{ color: "var(--border-subtle)" }}>•</span>
            <span>Profile Confidence: <strong style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>94.2%</strong></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsGoalModalOpen(true)}
            icon={<Edit3 size={13} color="var(--accent-cyan)" />}
          >
            Edit Goal
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
            icon={
              <RefreshCw
                size={14}
                style={{ animation: recalculating ? "spin 0.8s linear infinite" : "none" }}
              />
            }
          >
            {recalculating ? "Refreshing..." : "Refresh Matches"}
          </Button>
        </div>
      </div>

      {/* 2. PRIMARY "NEXT BEST ACTION" HERO CARD */}
      <div
        className="ui-card"
        style={{
          background: "linear-gradient(135deg, #0e1526 0%, #090e1b 100%)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                background: "rgba(168, 85, 247, 0.12)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Award size={22} color="var(--accent-purple)" />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", color: "#d8b4fe", letterSpacing: "0.06em" }}>
                  Recommended Action
                </span>
                <Badge variant="purple" size="sm">20 min test</Badge>
              </div>

              <h2 style={{ fontSize: "17.5px", fontWeight: 700, marginBottom: "8px" }}>
                Verify Skill: Distributed Consensus & Raft
              </h2>

              {/* High-Impact Stat Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <Badge variant="success" size="sm">
                  +1.8 Level Boost
                </Badge>
                <Badge variant="cyan" size="sm">
                  Unlocks 12 Tier-1 Roles
                </Badge>
                <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>
                  Verified code proof for distributed systems engineering.
                </span>
              </div>
            </div>
          </div>

          <Link href="/prove" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="primary" size="lg" icon={<ArrowRight size={15} />} iconPosition="right">
              Start Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. CAREER JOURNEY LOOP PIPELINE */}
      <div className="ui-card" style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.06em" }}>
            Career Journey
          </div>
          <span style={{ fontSize: "12.5px", color: "var(--text-sub)" }}>
            Current Focus: <strong style={{ color: "#ffffff" }}>Assessments</strong>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {stages.map((stg) => {
            const Icon = stg.icon;
            return (
              <Link
                key={stg.num}
                href={stg.href}
                prefetch={true}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  background: stg.active ? "var(--bg-elevated)" : "rgba(255, 255, 255, 0.02)",
                  border: stg.active ? "1px solid rgba(255, 255, 255, 0.22)" : "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  boxShadow: stg.active ? "0 2px 8px rgba(0, 0, 0, 0.4)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: stg.active ? "var(--text-main)" : "var(--text-dim)" }}>
                    {stg.num}
                  </span>
                  <Icon size={14} color={stg.active ? "#ffffff" : "var(--text-dim)"} />
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: 700, color: stg.active ? "#ffffff" : "var(--text-sub)", marginBottom: "2px" }}>
                  {stg.name}
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: stg.active ? "var(--accent-emerald)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {stg.tag}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. THREE-COLUMN OVERVIEW GRID */}
      <div className="grid-3">
        {/* Top Job Matches */}
        <div className="ui-card ui-card-hover">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Target size={17} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Top Job Matches</h3>
            </div>
            <Link href="/opportunities" prefetch={true} style={{ fontSize: "12.5px", color: "var(--text-sub)", textDecoration: "none", fontWeight: 600 }}>
              View All ({matches.length}) →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(matches || []).slice(0, 2).map((m) => (
              <Link
                key={m.id}
                href={`/opportunities/${m.job?.id || m.id}`}
                prefetch={true}
                style={{
                  padding: "12px 14px",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>{m.job?.title || "Target Role"}</div>
                    <div style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                      {m.job?.company?.name || "Company"} • {m.job?.location || "Remote"}
                    </div>
                  </div>
                  <Badge variant={(m.overall_score || 0) >= 90 ? "success" : "cyan"} size="sm">
                    {(m.overall_score || 0).toFixed(0)}% Match
                  </Badge>
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                  <span style={{ fontSize: "11.5px", color: "#38bdf8", background: "rgba(56, 189, 248, 0.08)", padding: "1px 6px", borderRadius: "3px" }}>
                    ${(((m.job?.salary_min || 200000)) / 1000).toFixed(0)}k - ${(((m.job?.salary_max || 300000)) / 1000).toFixed(0)}k
                  </span>
                  <span style={{ fontSize: "11.5px", color: "var(--text-sub)", background: "rgba(255, 255, 255, 0.04)", padding: "1px 6px", borderRadius: "3px" }}>
                    {m.job?.seniority || "Senior"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Skill Gaps */}
        <div className="ui-card ui-card-hover">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={17} color="var(--accent-amber)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Skill Gaps</h3>
            </div>
            <Link href="/gaps" prefetch={true} style={{ fontSize: "12.5px", color: "var(--text-sub)", textDecoration: "none", fontWeight: 600 }}>
              View Gaps ({gaps.length}) →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(gaps || []).slice(0, 2).map((g) => (
              <Link
                key={g.id}
                href="/improve"
                prefetch={true}
                style={{
                  padding: "12px 14px",
                  borderRadius: "6px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>{g.title || g.skill_name || "Skill Deficit"}</div>
                  <Badge variant={g.priority === "CRITICAL" ? "brand" : "warning"} size="sm">{g.priority || "HIGH"}</Badge>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                  <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                    Lv {g.current_level || 3} → Target {g.target_level || 6}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--accent-emerald)", fontWeight: 600 }}>
                    {g.expected_impact || "+8.5% Fit Gain"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Career AI Insight */}
        <div
          className="ui-card"
          style={{
            background: "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.08) 0%, rgba(13, 19, 34, 1) 75%)",
            border: "1px solid rgba(6, 182, 212, 0.25)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <Zap size={17} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Career Insight</h3>
            </div>

            <p style={{ fontSize: "13.5px", color: "var(--text-sub)", lineHeight: 1.55, marginBottom: "14px" }}>
              &ldquo;Your profile is strong for senior backend positions. Your fastest match booster is completing verification for Kubernetes operators and Triton model serving.&rdquo;
            </p>
          </div>

          <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="md" style={{ width: "100%" }}>
              View Learning Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY TIMELINE */}
      <div className="ui-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Recent Activity</h3>
          <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Synced with connected sources</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {activities.map((act) => (
            <div
              key={act.id}
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Badge
                  variant={
                    act.stage === "PROVE" ? "purple" : act.stage === "MATCH" ? "cyan" : "brand"
                  }
                  size="sm"
                >
                  {act.stage}
                </Badge>
                <div>
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-main)" }}>{act.title}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-sub)", marginLeft: "10px" }}>{act.description}</span>
                </div>
              </div>

              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Edit Modal */}
      {isGoalModalOpen && (
        <div
          onClick={() => setIsGoalModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 10, 18, 0.8)",
            backdropFilter: "blur(6px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "pageFadeIn 0.15s ease-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "#0d1322",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.7)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(6, 182, 212, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                  <Target size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc" }}>Set Target Direction</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Calibrates opportunity matching & gap diagnostics</p>
                </div>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="e.g. Staff Distributed Systems Architect"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Target Total Compensation Range
                </label>
                <input
                  type="text"
                  value={editComp}
                  onChange={(e) => setEditComp(e.target.value)}
                  placeholder="e.g. $240k – $320k + Equity"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    fontSize: "13.5px",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ padding: "10px 12px", borderRadius: "6px", background: "rgba(225, 29, 72, 0.08)", border: "1px solid rgba(225, 29, 72, 0.2)", fontSize: "12px", color: "var(--text-sub)", lineHeight: 1.4 }}>
                <strong style={{ color: "#fda4af" }}>AI Radar Impact:</strong> Updating your target role will dynamically re-rank all opportunity match percentages and highlight your critical learning gaps.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsGoalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveGoal}
                disabled={savingGoal}
                icon={<Check size={14} />}
              >
                {savingGoal ? "Saving..." : "Save & Recalculate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
