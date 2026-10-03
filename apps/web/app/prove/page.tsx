"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
  HelpCircle,
  Camera,
  Mic,
  Monitor,
  Lock,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { AssessmentType } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function ProvePage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

  // Security Checkbox state
  const [cameraChecked, setCameraChecked] = useState(true);
  const [micChecked, setMicChecked] = useState(true);
  const [screenChecked, setScreenChecked] = useState(true);
  const [fullscreenChecked, setFullscreenChecked] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const data = await api.getAssessments();
        setAssessments(data);
      } catch (err) {
        console.error("Failed to load assessments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, []);

  const handleOpenSecurityModal = (asm: AssessmentType) => {
    setSelectedAssessment(asm);
    setIsConsentModalOpen(true);
  };

  const handleStartProctoredSession = () => {
    if (!selectedAssessment) return;
    setIsConsentModalOpen(false);
    router.push(`/prove/${selectedAssessment.id}/take`);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-sub)" }}>
        <p>Loading competency assessment verifications...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Skill Assessments</Badge>
            <span style={{ fontSize: "12.5px", color: "var(--text-sub)" }}>Technical Verification</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Assessments & Skill Proof
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "13px", marginTop: "3px" }}>
            Complete timed technical assessments to verify your skills and increase your job match ranking.
          </p>
        </div>

        <Link href="/opportunities" prefetch={true} style={{ textDecoration: "none" }}>
          <Button variant="secondary" size="sm" icon={<Target size={14} />}>
            View Opportunities
          </Button>
        </Link>
      </div>

      {/* Proving System Banner */}
      <div
        className="ui-card"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(12, 18, 32, 0.98) 100%)",
          borderColor: "rgba(16, 185, 129, 0.22)",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>Proctored Assessment Environment</h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Sessions run in a distraction-free workspace with tab focus monitoring and instant score calibration.
            </p>
          </div>
        </div>
        <Badge variant="success" icon={<Lock size={12} />} size="sm">
          Verified Proof
        </Badge>
      </div>

      {/* Assessment Catalog */}
      <div className="grid-2">
        {assessments.map((asm) => (
          <div
            key={asm.id}
            className="ui-card"
            style={{
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "14px",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                  <Badge variant="brand" size="sm">{asm.difficulty}</Badge>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, marginTop: "6px" }}>{asm.title}</h3>
                </div>
                <Badge variant="neutral" icon={<Clock size={12} />} size="sm">{asm.time_limit_minutes} mins</Badge>
              </div>

              <p style={{ fontSize: "12.5px", color: "var(--text-sub)", marginTop: "8px", lineHeight: 1.5 }}>
                {asm.description || "Comprehensive diagnostic assessing low-latency consensus, log compaction, quorums, and fault tolerance under network partitions."}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px", background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Skills Evaluated:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>Distributed Consensus, Raft, Fault Tolerance</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-dim)" }}>Passing Score:</span>
                  <span style={{ fontWeight: 600, color: "var(--accent-emerald)" }}>{asm.passing_score || (asm as any).passing_score_pct || 80}% or higher</span>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              style={{ width: "100%" }}
              icon={<ArrowRight size={13} />}
              iconPosition="right"
              onClick={() => handleOpenSecurityModal(asm)}
            >
              Start Assessment
            </Button>
          </div>
        ))}
      </div>

      {/* PRE-ASSESSMENT SECURITY CHECK & CONSENT MODAL */}
      {isConsentModalOpen && selectedAssessment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <Card style={{ maxWidth: "580px", width: "100%", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={22} style={{ color: "#9d4edd" }} />
                <h3 style={{ fontSize: "19px", fontWeight: 800 }}>Pre-Assessment Security & Environment Check</h3>
              </div>
              <button onClick={() => setIsConsentModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "18px", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.6 }}>
              To ensure objective credibility with hiring managers, this assessment session runs in an authenticated, fullscreen proctored mode.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Monitor size={18} style={{ color: "var(--cyan)" }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>Fullscreen Mode & Tab Focus</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hides dashboard chrome to prevent tab switching</div>
                  </div>
                </div>
                <input type="checkbox" checked={fullscreenChecked} onChange={(e) => setFullscreenChecked(e.target.checked)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Camera size={18} style={{ color: "#9d4edd" }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>Camera Presence Verification</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Periodic local integrity verification</div>
                  </div>
                </div>
                <input type="checkbox" checked={cameraChecked} onChange={(e) => setCameraChecked(e.target.checked)} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Mic size={18} style={{ color: "#10b981" }} />
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600 }}>Microphone Active Sensor</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Ensures quiet assessment environment</div>
                  </div>
                </div>
                <input type="checkbox" checked={micChecked} onChange={(e) => setMicChecked(e.target.checked)} />
              </div>
            </div>

            <div style={{ padding: "12px", background: "rgba(230,57,70,0.06)", borderRadius: "8px", border: "1px solid rgba(230,57,70,0.2)", fontSize: "12px", color: "var(--text-sub)", display: "flex", gap: "8px", alignItems: "center" }}>
              <AlertTriangle size={16} style={{ color: "var(--brand)", flexShrink: 0 }} />
              <span>Exiting fullscreen or switching browser tabs will record an integrity event.</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
              <Button variant="secondary" onClick={() => setIsConsentModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleStartProctoredSession} icon={<Lock size={15} />}>
                Enter Fullscreen Proctored Mode
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
