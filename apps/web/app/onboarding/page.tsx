"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Github,
  Linkedin,
  FileText,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  // Step 1: Goals
  const [targetRole, setTargetRole] = useState("Staff Distributed Systems & Infrastructure Architect");
  const [seniority, setSeniority] = useState("Staff / Principal");
  const [location, setLocation] = useState("San Francisco, CA (Remote Option)");
  const [minSalary, setMinSalary] = useState("240000");

  // Step 2: Sources Connected
  const [githubConnected, setGithubConnected] = useState(true);
  const [resumeUploaded, setResumeUploaded] = useState(true);
  const [linkedinConnected, setLinkedinConnected] = useState(false);

  // Step 3: Discovered Skills
  const [skills, setSkills] = useState([
    { name: "Distributed Consensus (Raft/Paxos)", level: "9.5/10", strength: "STRONG", source: "GitHub: raft-engine (3.4k stars) + Resume" },
    { name: "Kubernetes Control Plane & Operators", level: "9.0/10", strength: "STRONG", source: "GitHub CRD Controller Commits" },
    { name: "Go / Golang Concurrency", level: "9.2/10", strength: "STRONG", source: "180k lines of Go across 14 repos" },
    { name: "Low-Latency Storage Engines (LSM)", level: "7.8/10", strength: "MODERATE", source: "GitHub Badger/Pebble Benchmarks" },
  ]);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      router.push("/");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div style={{ maxWidth: "680px", width: "100%", margin: "0 auto", padding: "30px 20px" }}>
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
            }}
          >
            <img src="/logo-dark.png" alt="JobPilot" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "-0.02em" }}>
            Job<span style={{ color: "var(--accent-primary)" }}>Pilot</span> <span style={{ fontSize: "10.5px", color: "var(--text-dim)", textTransform: "uppercase" }}>Career OS</span>
          </div>
        </Link>

        {/* Step Progress Stepper */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "10px" }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? "28px" : "18px",
                height: "5px",
                borderRadius: "3px",
                background: s <= step ? "var(--accent-emerald)" : "rgba(255, 255, 255, 0.08)",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "6px" }}>
          Step {step} of 5
        </div>
      </div>

      {/* Main Onboarding Step Card */}
      <Card style={{ padding: "26px" }}>
        {/* STEP 1: CAREER DIRECTION */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <Badge variant="brand" size="sm" style={{ marginBottom: "6px" }}>Step 1: Target Role</Badge>
              <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Tell us what role you're looking for.</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                JobPilot personalizes job matches, skill gaps, and learning roadmaps around your target role.
              </p>
            </div>

            <Input
              label="Target Role Title"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "5px" }}>
                  Seniority Level
                </label>
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
                >
                  <option value="Senior">Senior</option>
                  <option value="Staff / Principal">Staff / Principal</option>
                  <option value="Lead Architect">Lead Architect</option>
                  <option value="Mid-Level">Mid-Level</option>
                </select>
              </div>

              <Input
                label="Target Min Compensation ($/yr)"
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="220000"
              />
            </div>

            <Input
              label="Location / Remote Preferences"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="San Francisco, CA or Remote"
            />
          </div>
        )}

        {/* STEP 2: SOURCE DISCOVERY */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <Badge variant="cyan" size="sm" style={{ marginBottom: "6px" }}>Step 2: Connect Data</Badge>
              <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Connect your work profiles.</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                No manual resume typing. JobPilot extracts your verified skills directly from your code and documents.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* GitHub */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "4px",
                  background: githubConnected ? "rgba(16, 185, 129, 0.05)" : "var(--bg-elevated)",
                  border: githubConnected ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Github size={20} color="#ffffff" />
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600 }}>GitHub (alexchen-infra)</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>42 repositories & commits analyzed</div>
                  </div>
                </div>
                <Badge variant={githubConnected ? "success" : "neutral"} size="sm">
                  {githubConnected ? "Connected" : "Connect"}
                </Badge>
              </div>

              {/* Resume */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "4px",
                  background: resumeUploaded ? "rgba(16, 185, 129, 0.05)" : "var(--bg-elevated)",
                  border: resumeUploaded ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={20} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600 }}>Resume Document</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>alex_chen_staff_resume.pdf (Imported)</div>
                  </div>
                </div>
                <Badge variant={resumeUploaded ? "success" : "neutral"} size="sm">
                  {resumeUploaded ? "Imported" : "Upload PDF"}
                </Badge>
              </div>

              {/* LinkedIn */}
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "4px",
                  background: linkedinConnected ? "rgba(16, 185, 129, 0.05)" : "var(--bg-elevated)",
                  border: linkedinConnected ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Linkedin size={20} color="#0077b5" />
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600 }}>LinkedIn Profile</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Experience & Education records</div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLinkedinConnected(!linkedinConnected)}
                >
                  {linkedinConnected ? "Connected" : "Connect"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DISCOVERED EVIDENCE */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <Badge variant="purple" size="sm" style={{ marginBottom: "6px" }}>Step 3: Discovered Skills</Badge>
              <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Review your verified skills.</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                Every skill is backed by real code commits and repository artifacts.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {skills.map((sk) => (
                <div
                  key={sk.name}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-main)" }}>{sk.name}</span>
                    <Badge variant={sk.strength === "STRONG" ? "success" : "cyan"} size="sm">
                      Level {sk.level}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
                    <strong>Source:</strong> {sk.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRM PROFILE */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <Badge variant="brand" size="sm" style={{ marginBottom: "6px" }}>Step 4: Confirm Profile</Badge>
              <h1 style={{ fontSize: "20px", fontWeight: 700 }}>Confirm your profile details.</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                Review your profile summary before viewing your top job matches.
              </p>
            </div>

            <div style={{ padding: "14px", borderRadius: "4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "4px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--text-main)" }}>
                  AC
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>Alex Chen</div>
                  <div style={{ fontSize: "12px", color: "var(--accent-cyan)" }}>{targetRole}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "var(--text-dim)", marginTop: "10px" }}>
                <div>📍 San Francisco, CA (Remote)</div>
                <div>💼 8+ Years Experience</div>
                <div>📊 Profile Completeness: <strong style={{ color: "var(--accent-emerald)" }}>94.2%</strong></div>
                <div>🎯 Match Score: <strong style={{ color: "var(--accent-cyan)" }}>82%</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: YOU'RE READY */}
        {step === 5 && (
          <div style={{ textAlign: "center", padding: "16px 8px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <ShieldCheck size={26} color="var(--accent-emerald)" />
            </div>

            <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "6px" }}>
              Your Career Dashboard is Ready.
            </h1>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 20px" }}>
              JobPilot has matched 6 top job opportunities and identified 1 key skill to learn.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push("/")}
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        {step < 5 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBack}
              disabled={step === 1}
              icon={<ArrowLeft size={13} />}
            >
              Back
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={<ArrowRight size={14} />}
              iconPosition="right"
            >
              {step === 4 ? "Confirm & Finish" : "Continue"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
