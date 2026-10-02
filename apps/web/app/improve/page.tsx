"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ExternalLink,
  Zap,
  Play,
  ArrowRight,
  Flame,
  LayoutGrid,
  List,
  Calendar,
  Plus,
  Check,
  RotateCcw,
  Target,
  FileCode,
  Video,
  FileText,
  Layers,
  HelpCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { DailyPlan, LearningTask, CustomSkillAnalysis } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useToast } from "@/lib/toast-context";

export default function ImprovePage() {
  const { showToast } = useToast();
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [loading, setLoading] = useState(true);
  const [planningWeek, setPlanningWeek] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSkillName, setCustomSkillName] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [analyzingCustom, setAnalyzingCustom] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState<CustomSkillAnalysis | null>(null);

  useEffect(() => {
    async function loadDailyPlan() {
      try {
        const data = await api.getDailyPlan();
        setDailyPlan(data);
      } catch (err) {
        console.error("Failed to load daily plan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDailyPlan();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      const refreshed = await api.getDailyPlan();
      setDailyPlan(refreshed);
      if (newStatus === "COMPLETED") {
        showToast("Task marked complete! Competency score boosted.", "success");
      } else {
        showToast(`Task moved to ${newStatus}`, "info");
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      showToast("Failed to update task status.", "error");
    }
  };

  const handlePlanWeek = async () => {
    setPlanningWeek(true);
    try {
      const refreshed = await api.planMyWeek({ available_hours_per_week: 10.0 });
      setDailyPlan(refreshed);
      showToast("Generated optimized weekly learning blueprint!", "success");
    } catch (err) {
      console.error("Failed to plan week:", err);
      showToast("Failed to generate plan.", "error");
    } finally {
      setPlanningWeek(false);
    }
  };

  const handleAnalyzeCustomSkill = async () => {
    if (!customSkillName.trim()) return;
    setAnalyzingCustom(true);
    try {
      const analysis = await api.analyzeCustomSkill({
        skill_name: customSkillName,
        goal: customGoal || "Learn for Staff/Principal target roles",
      });
      setCustomAnalysis(analysis);
      const refreshed = await api.getDailyPlan();
      setDailyPlan(refreshed);
      showToast(`Custom skill analysis ready for "${customSkillName}"!`, "success");
    } catch (err) {
      console.error("Failed to analyze custom skill:", err);
      showToast("Analysis failed.", "error");
    } finally {
      setAnalyzingCustom(false);
    }
  };

  if (loading || !dailyPlan) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-sub)" }}>
        <p>Loading your personal career improvement system...</p>
      </div>
    );
  }

  const columns: Array<{ key: keyof DailyPlan["kanban_columns"]; label: string; badge: string }> = [
    { key: "BACKLOG", label: "Backlog", badge: "neutral" },
    { key: "TODAY", label: "Today's Focus", badge: "brand" },
    { key: "IN_PROGRESS", label: "In Progress", badge: "cyan" },
    { key: "DONE", label: "Completed", badge: "success" },
    { key: "READY_TO_PROVE", label: "Ready to Prove", badge: "purple" },
  ];

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">Stage 3 • Productivity Engine</Badge>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Personal Career Operating System</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Improve — Daily Career Productivity
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "14px", marginTop: "4px", lineHeight: 1.55 }}>
            Automated task prioritization derived strictly from your active opportunity bottlenecks and career goals.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* List vs Kanban Toggle */}
          <div style={{ display: "flex", background: "var(--bg-elevated)", padding: "3px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <button
              onClick={() => setViewMode("kanban")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "kanban" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "kanban" ? "var(--text-main)" : "var(--text-muted)",
              }}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "list" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "list" ? "var(--text-main)" : "var(--text-muted)",
              }}
            >
              <List size={14} /> List
            </button>
          </div>

          <Button
            variant="secondary"
            size="md"
            icon={<Calendar size={15} />}
            onClick={handlePlanWeek}
            disabled={planningWeek}
          >
            {planningWeek ? "Scheduling..." : "Plan My Week"}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Plus size={15} />}
            onClick={() => {
              setCustomAnalysis(null);
              setIsModalOpen(true);
            }}
          >
            Add Skill or Goal
          </Button>
        </div>
      </div>

      {/* Focus & Impact Overview Bar */}
      <Card
        style={{
          background: "linear-gradient(135deg, rgba(230,57,70,0.06) 0%, rgba(20,22,30,0.95) 100%)",
          borderColor: "rgba(230,57,70,0.25)",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Badge variant="cyan">Active Focus</Badge>
              <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Current Level {dailyPlan.current_level} → Target Level {dailyPlan.target_level}</span>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800 }}>{dailyPlan.today_focus_skill}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px", fontSize: "13px", color: "var(--brand)", fontWeight: 600 }}>
              <Sparkles size={15} /> {dailyPlan.target_role_impact}
            </div>
          </div>

          <div style={{ display: "flex", gap: "24px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Tasks Done</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)" }}>
                {dailyPlan.tasks_completed_count} / {dailyPlan.total_tasks_count}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Concepts</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--brand)" }}>
                {dailyPlan.concepts_practiced_count} / {dailyPlan.total_concepts_count}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Stage 5 Proof</div>
              <Link href="/prove" prefetch={true} style={{ textDecoration: "none" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#9d4edd", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Award size={16} /> Ready to Prove
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", alignItems: "flex-start" }}>
          {columns.map((col) => {
            const tasks = (dailyPlan.kanban_columns && dailyPlan.kanban_columns[col.key]) || [];
            return (
              <div
                key={col.key}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  minHeight: "450px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", borderBottom: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>{col.label}</div>
                  <Badge variant={col.badge as any}>{tasks.length}</Badge>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {tasks.length === 0 ? (
                    <div style={{ padding: "30px 10px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                      No tasks in this lane
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <Card
                        key={task.id}
                        style={{
                          padding: "14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          background: "var(--bg-elevated)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase" }}>
                            {task.task_type} • {task.estimated_minutes}m
                          </span>
                          <Badge variant={task.priority === "CRITICAL" ? "brand" : task.priority === "HIGH" ? "warning" : "neutral"} size="sm">
                            {task.priority}
                          </Badge>
                        </div>

                        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.4 }}>
                          {task.title}
                        </div>

                        <p style={{ fontSize: "12px", color: "var(--text-sub)", lineHeight: 1.5, margin: 0 }}>
                          {task.description}
                        </p>

                        {task.resource && (
                          <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontSize: "11px" }}>
                            <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{task.resource.title}</div>
                            <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>Why: {task.resource.why_chosen}</div>
                          </div>
                        )}

                        {/* Quick Action Transitions */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                          {col.key === "BACKLOG" && (
                            <button
                              onClick={() => handleStatusChange(task.id, "TODAY")}
                              style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                            >
                              Move to Today →
                            </button>
                          )}
                          {col.key === "TODAY" && (
                            <button
                              onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                              style={{ fontSize: "11px", color: "var(--cyan)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                            >
                              Start Working →
                            </button>
                          )}
                          {col.key === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleStatusChange(task.id, "DONE")}
                              style={{ fontSize: "11px", color: "#10b981", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                            >
                              ✓ Mark Done
                            </button>
                          )}
                          {col.key === "DONE" && (
                            <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>✓ Verified</span>
                          )}
                          {col.key === "READY_TO_PROVE" && (
                            <Link href="/prove" prefetch={true} style={{ textDecoration: "none", fontSize: "11px", color: "#9d4edd", fontWeight: 700 }}>
                              Take Assessment →
                            </Link>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {(dailyPlan.today_tasks || []).map((task) => (
            <Card key={task.id} style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(230,57,70,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)", flexShrink: 0 }}>
                  {task.task_type === "READ" ? <FileText size={18} /> : task.task_type === "WATCH" ? <Video size={18} /> : <FileCode size={18} />}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{task.title}</h3>
                    <Badge variant={task.priority === "CRITICAL" ? "brand" : "warning"} size="sm">{task.priority}</Badge>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{task.estimated_minutes} mins</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", marginTop: "4px" }}>{task.description}</p>
                  {task.resource && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                      Resource: <strong style={{ color: "var(--text-main)" }}>{task.resource.title}</strong> ({task.resource.cost})
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {task.status !== "DONE" ? (
                  <Button variant="primary" size="sm" onClick={() => handleStatusChange(task.id, "DONE")}>
                    Mark as Done
                  </Button>
                ) : (
                  <Badge variant="success">Completed</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CUSTOM SKILL ANALYZER MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <Card style={{ maxWidth: "560px", width: "100%", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Target size={20} style={{ color: "var(--brand)" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Analyze Custom Skill or Goal</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "18px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.6 }}>
              Enter any technical skill or target architecture topic. JobPilot will evaluate target opportunity overlap, estimate learning effort, and generate focused tasks.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase" }}>Skill or Architecture Topic</label>
                <input
                  type="text"
                  placeholder="e.g., eBPF Kernel Tracing, CUDA Memory Optimization, ClickHouse"
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    marginTop: "6px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase" }}>Target Role or Goal</label>
                <input
                  type="text"
                  placeholder="e.g., Staff AI Infrastructure Architect"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    marginTop: "6px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </div>

            {customAnalysis && (
              <div style={{ padding: "16px", background: "rgba(230,57,70,0.06)", borderRadius: "8px", border: "1px solid rgba(230,57,70,0.2)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-sub)" }}>Opportunity Overlap:</span>
                  <span style={{ fontWeight: 700, color: "var(--brand)" }}>{customAnalysis.target_opportunities_unlocked} target roles unlocked</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-sub)" }}>Estimated Effort:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>~{customAnalysis.estimated_effort_hours} hours total</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-sub)", marginTop: "4px" }}>
                  ✓ Task added to your Kanban backlog!
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleAnalyzeCustomSkill} disabled={analyzingCustom || !customSkillName.trim()}>
                {analyzingCustom ? "Analyzing..." : "Analyze & Add to Backlog"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
