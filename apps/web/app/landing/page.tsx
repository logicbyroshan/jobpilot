"use client";

import React from "react";
import Link from "next/link";
import {
  Compass,
  UserCheck,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Send,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function LandingPage() {
  const loopStages = [
    {
      num: "1",
      name: "KNOW",
      title: "Skills & Profile",
      desc: "Connects your GitHub code, repositories, and resume to map your true capabilities.",
      icon: UserCheck,
    },
    {
      num: "2",
      name: "MATCH",
      title: "Job Matching",
      desc: "Scores job openings based on your technical skills, experience level, and preferences.",
      icon: Target,
    },
    {
      num: "3",
      name: "GAP",
      title: "Skill Gaps",
      desc: "Pinpoints missing skills needed to qualify for top roles and higher compensation.",
      icon: Sparkles,
    },
    {
      num: "4",
      name: "IMPROVE",
      title: "Learning Plan",
      desc: "Provides step-by-step roadmaps, guides, and practical milestones to close gaps.",
      icon: BookOpen,
    },
    {
      num: "5",
      name: "PROVE",
      title: "Skill Assessments",
      desc: "Evaluates your hands-on problem solving to verify and calibrate your skills.",
      icon: Award,
    },
    {
      num: "6",
      name: "APPLY",
      title: "Applications",
      desc: "Generates tailored resumes and manages job applications in Assisted or Auto mode.",
      icon: Send,
    },
    {
      num: "7",
      name: "OUTCOME",
      title: "Analytics",
      desc: "Tracks application progress and interview conversion rates to help you improve.",
      icon: TrendingUp,
    },
  ];

  return (
    <div style={{ maxWidth: "1180px", width: "100%", margin: "0 auto", padding: "40px 20px" }}>
      {/* Top Navbar Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "6px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px",
            }}
          >
            <img src="/logo-dark.png" alt="JobPilot" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em" }}>
              Job<span style={{ color: "var(--accent-primary)" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Career OS
            </div>
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">Sign In</Button>
          </Link>
          <Link href="/onboarding" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ textAlign: "center", marginBottom: "64px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
          <Badge variant="brand">Autonomous Career Intelligence</Badge>
          <Badge variant="success" dot>Closed-Loop Engine</Badge>
        </div>

        <h1 style={{ fontSize: "44px", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "16px", maxWidth: "840px", margin: "0 auto 16px" }}>
          Your AI Career Operating System.
        </h1>

        <p style={{ fontSize: "17px", color: "var(--text-muted)", maxWidth: "680px", margin: "0 auto 28px", lineHeight: 1.5 }}>
          Know where you stand. Find the right opportunities. Close your gaps. Prove your skills. Get hired with evidence-backed precision.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/onboarding" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="lg" icon={<ArrowRight size={16} />} iconPosition="right">
              Build My Career Profile
            </Button>
          </Link>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="lg" icon={<Zap size={16} color="var(--accent-amber)" />}>
              1-Click Demo Fast Track
            </Button>
          </Link>
        </div>
      </section>

      {/* Core Operating Loop Explainer */}
      <section style={{ marginBottom: "64px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            The 7-Stage Career Engine
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginTop: "4px" }}>
            A Complete, Self-Optimizing Career Feedback Loop
          </h2>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "600px", margin: "4px auto 0" }}>
            JobPilot doesn&apos;t just search job boards. It understands what you can do, what you are missing, and exactly what you should do next.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {loopStages.map((stg) => {
            const Icon = stg.icon;
            return (
              <Card key={stg.num} style={{ padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
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
                    }}
                  >
                    <Icon size={16} color="var(--accent-cyan)" />
                  </div>
                  <Badge variant="neutral" size="sm">Stage {stg.num}</Badge>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                  {stg.name} — {stg.title}
                </div>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.45 }}>
                  {stg.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer Banner */}
      <Card style={{ textAlign: "center", padding: "32px 20px" }}>
        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
          Ready to take control of your career journey?
        </h3>
        <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "500px", margin: "0 auto 20px" }}>
          Connect your GitHub and resume to generate your verified identity graph in under 60 seconds.
        </p>
        <Link href="/onboarding" style={{ textDecoration: "none" }}>
          <Button variant="primary" size="md">
            Start Free Career Onboarding
          </Button>
        </Link>
      </Card>
    </div>
  );
}
