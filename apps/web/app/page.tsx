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
  Edit3,
  X,
  Check,
  DollarSign,
  Building,
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
      showToast(`Target role updated to "${editRole}"!`, "success");
      handleRecalculate();
    } catch (err) {
      console.error("Error saving goal:", err);
      showToast("Failed to update career goal.", "error");
    } finally {
      setSavingGoal(false);
    }
  };

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 1. Header with Career Goal and Quick Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Dashboard</Badge>
            <Badge variant="success" dot>Active</Badge>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Good afternoon, {profile?.full_name || "Alex Chen"}
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "13px", marginTop: "3px" }}>
            Target: <strong style={{ color: "var(--text-main)" }}>{goal?.target_role || "Staff Distributed Systems Architect"}</strong> • {goal?.target_salary_range || "$240k - $320k"}
          </p>
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
                size={13}
                style={{ animation: recalculating ? "spin 0.8s linear infinite" : "none" }}
              />
            }
          >
            {recalculating ? "Refreshing..." : "Refresh Matches"}
          </Button>
        </div>
      </div>

      {/* 2. Top 4 Quick Metric Cards */}
      <div className="grid-4">
        <div className="ui-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>Readiness Score</span>
            <Award size={15} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-emerald)", marginBottom: "6px" }}>
            82%
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: "82%", background: "var(--accent-emerald)" }} />
          </div>
        </div>

        <div className="ui-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>Top Match Fit</span>
            <Target size={15} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "2px" }}>
            94%
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>{matches.length} curated opportunities</span>
        </div>

        <div className="ui-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>Skill Gaps</span>
            <Sparkles size={15} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--accent-amber)", marginBottom: "2px" }}>
            {gaps.length} Blocker
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>+8.5% fit gain upon closing</span>
        </div>

        <div className="ui-card" style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase" }}>Applications</span>
            <Send size={15} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-main)", marginBottom: "2px" }}>
            {applications.length} Active
          </div>
          <span style={{ fontSize: "11.5px", color: "var(--accent-emerald)", fontWeight: 600 }}>1 Offer in review</span>
        </div>
      </div>

      {/* 3. Main 2-Column Split Layout */}
      <div className="grid-split-65-35">
        {/* Left Column (Primary Content) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Next Best Action Card */}
          <div
            className="ui-card"
            style={{
              background: "linear-gradient(135deg, #0e1526 0%, #090e1b 100%)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              padding: "16px 20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "6px",
                    background: "rgba(168, 85, 247, 0.12)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} color="var(--accent-purple)" />
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#d8b4fe", letterSpacing: "0.05em" }}>
                      Recommended Action
                    </span>
                    <Badge variant="purple" size="sm">20 min</Badge>
                  </div>
                  <h2 style={{ fontSize: "15.5px", fontWeight: 700, color: "var(--text-main)" }}>
                    Verify Skill: Distributed Consensus & Raft
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Calibrate your hands-on proficiency to boost readiness to 89% and unlock 12 tier-1 roles.
                  </p>
                </div>
              </div>

              <Link href="/prove" prefetch={true} style={{ textDecoration: "none" }}>
                <Button variant="primary" size="sm" icon={<ArrowRight size={13} />} iconPosition="right">
                  Start Assessment
                </Button>
              </Link>
            </div>
          </div>

          {/* Top Job Matches */}
          <div className="ui-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Target size={16} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: "14.5px", fontWeight: 700 }}>Top Job Matches</h3>
              </div>
              <Link href="/opportunities" prefetch={true} style={{ fontSize: "12px", color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
                View All ({matches.length}) →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(matches || []).slice(0, 3).map((m) => (
                <Link
                  key={m.id}
                  href={`/opportunities/${m.job?.id || m.id}`}
                  prefetch={true}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-main)" }}>
                      {m.job?.title || "Target Role"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      {m.job?.company?.name || "Company"} • {m.job?.location || "Remote"} • ${(((m.job?.salary_min || 200000)) / 1000).toFixed(0)}k - ${(((m.job?.salary_max || 300000)) / 1000).toFixed(0)}k
                    </div>
                  </div>

                  <Badge variant={(m.overall_score || 0) >= 90 ? "success" : "cyan"} size="sm">
                    {(m.overall_score || 0).toFixed(0)}% Fit
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Skill Gaps Card */}
          <div className="ui-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} color="var(--accent-amber)" />
                <h3 style={{ fontSize: "14.5px", fontWeight: 700 }}>Priority Skill Gap</h3>
              </div>
              <Link href="/improve" prefetch={true} style={{ fontSize: "12px", color: "var(--accent-amber)", textDecoration: "none", fontWeight: 600 }}>
                Learning Plan →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(gaps || []).slice(0, 2).map((g) => (
                <div
                  key={g.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-main)" }}>
                        {g.title || g.skill_name || "Skill Deficit"}
                      </span>
                      <Badge variant={g.priority === "CRITICAL" ? "brand" : "warning"} size="sm">
                        {g.priority || "HIGH"}
                      </Badge>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      Level {g.current_level || 3}/10 → Target {g.target_level || 6}/10 • {g.expected_impact || "+8.5% Match Gain"}
                    </div>
                  </div>

                  <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm">
                      Start Task
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Secondary Content) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Career Insight Card */}
          <div
            className="ui-card"
            style={{
              background: "radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.08) 0%, rgba(12, 18, 32, 1) 75%)",
              border: "1px solid rgba(6, 182, 212, 0.25)",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Zap size={16} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Career Insight</h3>
            </div>
            <p style={{ fontSize: "12.5px", color: "var(--text-sub)", lineHeight: 1.5, marginBottom: "12px" }}>
              Your profile shows strong systems depth. Completing hands-on proof for Raft consensus will increase your qualification for senior architect compensation bands.
            </p>
            <Link href="/prove" prefetch={true} style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="sm" style={{ width: "100%" }}>
                View Assessments
              </Button>
            </Link>
          </div>

          {/* Recent Activity Timeline */}
          <div className="ui-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Activity Feed</h3>
              <span style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Live Sync</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(activities || []).slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>
                      {act.title}
                    </span>
                    <span style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>
                      {act.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.3 }}>
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
              maxWidth: "460px",
              background: "#0c1220",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              boxShadow: "var(--shadow-lg)",
              padding: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Target size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>Set Target Direction</h3>
              </div>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  placeholder="e.g. Staff Distributed Systems Architect"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "4px" }}>
                  Target Salary Range
                </label>
                <input
                  type="text"
                  value={editComp}
                  onChange={(e) => setEditComp(e.target.value)}
                  placeholder="e.g. $240k - $320k"
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" size="sm" onClick={() => setIsGoalModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveGoal} disabled={savingGoal} icon={<Check size={13} />}>
                {savingGoal ? "Saving..." : "Save & Recalculate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
