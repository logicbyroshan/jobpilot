"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
  Lock,
  Camera,
  Monitor,
  AlertTriangle,
  FileCode,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { AssessmentType, AssessmentAttemptResult } from "@/lib/types";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";

export default function ProctoredAssessmentTakePage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = (params?.id as string) || "99bb5e7e-6de3-4074-91fb-4c0f6990cbb3";

  const [assessment, setAssessment] = useState<AssessmentType | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentAttemptResult | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60);
  const [integrityEventsCount, setIntegrityEventsCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const asm = await api.getAssessment(assessmentId);
        setAssessment(asm);
      } catch (err) {
        console.error("Failed to load assessment:", err);
      }
    }
    load();
  }, [assessmentId]);

  // Countdown timer
  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  // Anti-cheat tab visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIntegrityEventsCount((prev) => prev + 1);
        api.logIntegrityEvent("active-sess", {
          event_type: "TAB_HIDDEN",
          timestamp: new Date().toISOString(),
          severity: "MEDIUM",
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleSelectOption = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setSubmitting(true);
    try {
      const res = await api.submitAssessment(assessment.id, answers);
      setResult(res);
    } catch (err) {
      console.error("Error submitting assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!assessment) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-canvas)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-sub)" }}>
        <p>Initializing proctored assessment workspace...</p>
      </div>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentQuestionIdx];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-canvas)",
        color: "var(--text-main)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fullscreen Proctored Top Bar */}
      <header
        style={{
          height: "64px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Live Proctored Session
            </span>
          </div>
          <span style={{ color: "var(--text-muted)" }}>•</span>
          <span style={{ fontSize: "15px", fontWeight: 700 }}>{assessment.title}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-elevated)", padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
            <Clock size={16} style={{ color: secondsRemaining < 300 ? "var(--brand)" : "var(--text-main)" }} />
            <span style={{ fontSize: "14px", fontWeight: 800, fontVariantNumeric: "tabular-nums", color: secondsRemaining < 300 ? "var(--brand)" : "var(--text-main)" }}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: integrityEventsCount > 0 ? "var(--brand)" : "#10b981" }}>
            <ShieldCheck size={16} />
            <span>{integrityEventsCount === 0 ? "Integrity Normal" : `${integrityEventsCount} Event(s) Recorded`}</span>
          </div>

          <button
            onClick={() => router.push("/prove")}
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-sub)",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Exit Session
          </button>
        </div>
      </header>

      {/* Main Proctored Body */}
      <main style={{ flex: 1, padding: "36px", maxWidth: "1100px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* EVALUATION REPORT SCREEN (UPON COMPLETION) */}
        {result ? (
          <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <Card
              style={{
                background: result.passed
                  ? "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,22,30,0.95) 100%)"
                  : "linear-gradient(135deg, rgba(230,57,70,0.1) 0%, rgba(20,22,30,0.95) 100%)",
                borderColor: result.passed ? "rgba(16,185,129,0.3)" : "rgba(230,57,70,0.3)",
                padding: "36px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <ShieldCheck size={28} style={{ color: result.passed ? "#10b981" : "var(--brand)" }} />
                    <h2 style={{ fontSize: "24px", fontWeight: 800 }}>
                      {result.passed ? "Diagnostic Competency Verified!" : "Assessment Completed"}
                    </h2>
                  </div>
                  <p style={{ color: "var(--text-sub)", fontSize: "15px", marginTop: "6px" }}>
                    {result.feedback_summary || "Objective verification successfully logged into your canonical evidence graph."}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Final Score</div>
                  <div style={{ fontSize: "36px", fontWeight: 900, color: result.passed ? "#10b981" : "var(--brand)" }}>
                    {result.score}%
                  </div>
                  <Badge variant={result.passed ? "success" : "warning"}>
                    {result.passed ? "PASSED (VERIFIED)" : "BELOW THRESHOLD"}
                  </Badge>
                </div>
              </div>

              {/* Skill Boost & Opportunity Recalculation Notice */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Skill Level Boost</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--brand)", marginTop: "4px" }}>
                    {result.skill_level_before} → {result.skill_level_after} (+{result.skill_proficiency_boost} pts)
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-sub)", marginTop: "4px" }}>
                    Living portfolio updated in real-time.
                  </div>
                </div>

                <div style={{ padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Match Engine Recalculation</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--cyan)", marginTop: "4px" }}>
                    12 Target Roles Unlocked
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-sub)", marginTop: "4px" }}>
                    {result.recalculated_matches_notice}
                  </div>
                </div>
              </div>

              {/* Dimensional Breakdown */}
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "12px" }}>
                  Competency Dimensional Breakdown
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  {Object.entries(result.breakdown || {}).map(([dim, score]) => (
                    <div key={dim} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ fontSize: "12px", color: "var(--text-sub)" }}>{dim}</div>
                      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginTop: "4px" }}>{score}/10</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                <Link href="/know" prefetch={true} style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="md">
                    View Living Portfolio
                  </Button>
                </Link>
                <Link href="/opportunities" prefetch={true} style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="md" icon={<Target size={15} />}>
                    View {result.unlocked_opportunities_count || 12} Unlocked Opportunities →
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          /* QUESTION STEPER */
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Progress indicator */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "14px", color: "var(--text-sub)", fontWeight: 600 }}>
                Question {currentQuestionIdx + 1} of {questions.length}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: answers[q.id]
                        ? "#10b981"
                        : currentQuestionIdx === idx
                        ? "var(--brand)"
                        : "var(--bg-elevated)",
                      color: "#fff",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Question Card */}
            {currentQ && (
              <Card style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <Badge variant="brand" size="sm">Question {currentQuestionIdx + 1}</Badge>
                  <h3 style={{ fontSize: "19px", fontWeight: 700, marginTop: "12px", lineHeight: 1.5 }}>
                    {currentQ.prompt}
                  </h3>
                </div>

                {/* Options List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {currentQ.options_json?.map((opt, optIdx) => {
                    const isSelected = answers[currentQ.id] === opt || answers[currentQ.id] === opt[0];
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(currentQ.id, opt[0] || opt)}
                        style={{
                          padding: "16px 20px",
                          borderRadius: "10px",
                          border: "1px solid",
                          borderColor: isSelected ? "var(--brand)" : "var(--border-subtle)",
                          background: isSelected ? "rgba(230,57,70,0.06)" : "var(--bg-surface)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ fontSize: "15px", color: isSelected ? "var(--text-main)" : "var(--text-sub)", fontWeight: isSelected ? 600 : 400 }}>
                          {opt}
                        </div>
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor: isSelected ? "var(--brand)" : "var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isSelected ? "var(--brand)" : "transparent",
                          }}
                        >
                          {isSelected && <Check size={12} color="#fff" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Question Stepper Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                  <Button
                    variant="secondary"
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                    icon={<ArrowLeft size={15} />}
                  >
                    Previous
                  </Button>

                  {currentQuestionIdx < questions.length - 1 ? (
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                    >
                      Next Question →
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={submitting}
                      icon={<ShieldCheck size={16} />}
                    >
                      {submitting ? "Evaluating Verification..." : "Submit Assessment"}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
