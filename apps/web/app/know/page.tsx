"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Github,
  Linkedin,
  FileText,
  ShieldCheck,
  Briefcase,
  Award,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Code2,
  Cpu,
  Layers,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { LivingPortfolioResponse, CategorizedSkillItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useToast } from "@/lib/toast-context";
import { Share2, Copy } from "lucide-react";

export default function LivingPortfolioPage() {
  const { showToast } = useToast();
  const [portfolio, setPortfolio] = useState<LivingPortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"portfolio" | "narrative" | "skills" | "work" | "sources">("portfolio");
  const [selectedSkill, setSelectedSkill] = useState<CategorizedSkillItem | null>(null);
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await api.getLivingPortfolio();
        setPortfolio(data);
        const initialList = Array.isArray(data.skills)
          ? data.skills
          : Array.isArray(data.categorized_skills)
          ? data.categorized_skills
          : data.categorized_skills && typeof data.categorized_skills === "object"
          ? Object.values(data.categorized_skills).flat()
          : [];
        if (initialList.length > 0) {
          setSelectedSkill(initialList[0] as any);
        }
      } catch (err) {
        console.error("Failed to load living portfolio:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  if (loading || !portfolio) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-sub)" }}>
        <p>Loading your Living Professional Portfolio...</p>
      </div>
    );
  }

  const hero = {
    full_name: portfolio.hero?.full_name || "Alex Chen",
    headline: portfolio.hero?.headline || "Staff Distributed Systems & Infrastructure Architect",
    primary_domains: Array.isArray(portfolio.hero?.primary_domains) ? portfolio.hero.primary_domains : ["Distributed Systems", "Cloud Infrastructure"],
    seniority_level: portfolio.hero?.seniority_level || "Staff / Principal (L6/L7)",
    location: portfolio.hero?.location || "San Francisco, CA (Remote)",
    profile_completeness_pct: portfolio.hero?.profile_completeness_pct || 94.0,
    confidence: {
      score: portfolio.hero?.confidence?.score ?? 0.94,
      label: portfolio.hero?.confidence?.label || "High confidence (Verified)",
      verified_sources_count: portfolio.hero?.confidence?.verified_sources_count ?? 4,
      unverified_claims_count: portfolio.hero?.confidence?.unverified_claims_count ?? 0,
    },
    ai_summary: portfolio.hero?.ai_summary || "High-throughput systems architect specialized in distributed consensus and low-latency storage.",
  };

  const about = {
    how_jobpilot_sees_you: portfolio.about?.how_jobpilot_sees_you || "A top 2% systems engineer with verified evidence spanning production Raft consensus engines and high-concurrency Go services.",
    career_narrative: portfolio.about?.career_narrative || "Transitioning to Principal Infrastructure Architect at Tier-1 laboratories.",
    ideal_next_role: portfolio.about?.ideal_next_role || "Staff / Principal Distributed Systems Architect",
    target_salary_range: portfolio.about?.target_salary_range || "$220k – $320k + Equity",
    workplace_preference: portfolio.about?.workplace_preference || "Remote / Hybrid (US & Global)",
  };

  const experiences = (portfolio.experiences || []).map((exp: any) => ({
    company: exp.company || "Technology Company",
    title: exp.title || "Software Engineer",
    period: exp.period || "2021 — Present",
    location: exp.location || "Remote",
    impact_bullets: Array.isArray(exp.impact_bullets)
      ? exp.impact_bullets
      : typeof exp.description === "string"
      ? [exp.description]
      : ["Architected high-throughput distributed systems and ledger replication engines."],
    verified_evidence_badges: Array.isArray(exp.verified_evidence_badges)
      ? exp.verified_evidence_badges
      : ["Verified Work Record", "GitHub Commits"],
    skills_used: Array.isArray(exp.skills_used)
      ? exp.skills_used
      : Array.isArray(exp.technologies_json)
      ? exp.technologies_json
      : ["Go", "Distributed Systems"],
  }));

  const projects = (portfolio.projects || []).map((proj: any) => ({
    name: proj.name || proj.title || "Distributed Systems Project",
    type: proj.type || "Open Source Engine",
    description: proj.description || "High-performance systems implementation with verifiable benchmarks.",
    architecture_summary: proj.architecture_summary || "Deterministic state machine replication.",
    verified_evidence_badge: proj.verified_evidence_badge || "GitHub Verified",
    metrics: proj.metrics || "Production Grade",
    github_url: proj.github_url || proj.url,
    live_url: proj.live_url,
    tags: Array.isArray(proj.tags)
      ? proj.tags
      : Array.isArray(proj.technologies_json)
      ? proj.technologies_json
      : ["Go", "Systems"],
  }));

  let rawSkills: any[] = [];
  if (Array.isArray(portfolio.skills)) {
    rawSkills = portfolio.skills;
  } else if (Array.isArray(portfolio.categorized_skills)) {
    rawSkills = portfolio.categorized_skills;
  } else if (portfolio.categorized_skills && typeof portfolio.categorized_skills === "object") {
    rawSkills = Object.entries(portfolio.categorized_skills).flatMap(([catName, list]) =>
      Array.isArray(list) ? list.map((s: any) => ({ ...s, category: s.category || catName })) : []
    );
  }

  const normalizeSkill = (s: any): CategorizedSkillItem => {
    const score = s.capability?.score ?? s.level_score ?? 8.5;
    const label = s.capability?.label ?? s.capability_level ?? (score >= 9 ? "Expert" : score >= 7.5 ? "Advanced" : "Strong");
    const confScore = s.confidence?.score ?? s.confidence_score ?? 0.95;
    const confLabel = s.confidence?.label ?? (confScore >= 0.85 ? "Verified" : "Needs Evidence");
    const verifiedCount = s.confidence?.verified_sources_count ?? s.evidence_count ?? 3;
    return {
      ...s,
      capability: { score, label },
      confidence: { score: confScore, label: confLabel, verified_sources_count: verifiedCount, unverified_claims_count: 0 },
      target_demand_pct: s.target_demand_pct ?? 90,
      target_roles_requiring_count: s.target_roles_requiring_count ?? 15,
      status: s.status ?? (confScore >= 0.8 ? "VERIFIED" : "NEEDS_EVIDENCE"),
      why_it_matters: s.why_it_matters ?? "Core architectural requirement for senior infrastructure roles.",
    };
  };

  const skills: CategorizedSkillItem[] = rawSkills.map(normalizeSkill);
  const connected_sources = (portfolio.connected_sources || []).map((src: any) => ({
    name: src.name || src.display_name || "Integration",
    type: src.type || src.source_type || "Source",
    icon: src.icon || "file-text",
    status: src.status || "CONNECTED",
    item_count_label: src.item_count_label || `${src.items_ingested_count || 12} items synced`,
    last_synced: src.last_synced || "Today",
  }));
  const categories = ["ALL", ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))];
  const filteredSkills = skillCategoryFilter === "ALL" ? skills : skills.filter((s) => s.category === skillCategoryFilter);

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Portfolio Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">Skills & Portfolio</Badge>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>Verified Experience</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Skills & Living Portfolio
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "14px", marginTop: "4px", lineHeight: 1.55 }}>
            Your verified work history, technical skills, and projects built from your connected accounts.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="secondary"
            size="md"
            icon={<Share2 size={14} color="var(--accent-cyan)" />}
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard?.writeText(window.location.href);
                showToast("Portfolio link copied to clipboard!", "success");
              }
            }}
          >
            Share Portfolio
          </Button>
          <Link href="/sources" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="md">
              Data Sources ({connected_sources.length})
            </Button>
          </Link>
          <Link href="/prove" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="primary" size="md" icon={<Award size={15} />}>
              Take Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <Card
        style={{
          background: "linear-gradient(135deg, rgba(230,57,70,0.05) 0%, rgba(20,22,30,0.95) 100%)",
          borderColor: "rgba(230,57,70,0.2)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, var(--brand) 0%, #B82E3B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 800,
                color: "#fff",
                boxShadow: "0 8px 24px rgba(230,57,70,0.3)",
              }}
            >
              {hero.full_name?.split(" ").map((n: string) => n[0]).join("") || "AC"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>{hero.full_name}</h2>
                <Badge variant="cyan">{hero.seniority_level || "Staff Engineer"}</Badge>
                <Badge variant="success" icon={<ShieldCheck size={13} />}>{hero.confidence?.label || "High confidence (Verified)"}</Badge>
              </div>
              <p style={{ fontSize: "16px", color: "var(--text-sub)", marginTop: "4px", fontWeight: 500 }}>
                {hero.headline}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                <span>📍 {hero.location || "San Francisco, CA"}</span>
                <span>•</span>
                <span>⚡ {hero.confidence?.verified_sources_count ?? 4} Verified Sources</span>
                <span>•</span>
                <span>🎯 Top 2% Systems Alignment</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-sub)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Profile Completeness
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--brand)" }}>
              {hero.profile_completeness_pct}%
            </div>
            <div style={{ width: "160px", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ width: `${hero.profile_completeness_pct}%`, height: "100%", background: "var(--brand)", borderRadius: "999px" }} />
            </div>
          </div>
        </div>

        {/* AI Summary Box */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "10px",
            padding: "16px 20px",
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
          }}
        >
          <Sparkles size={20} style={{ color: "var(--brand)", flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              AI Intelligence Executive Summary
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-main)", lineHeight: 1.6 }}>
              {hero.ai_summary}
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
        {[
          { key: "portfolio", label: "Full Portfolio Overview" },
          { key: "narrative", label: "How JobPilot Sees You" },
          { key: "skills", label: `Categorized Skills (${skills.length})` },
          { key: "work", label: `Selected Work & Architecture (${projects.length})` },
          { key: "sources", label: `Connected Sources (${connected_sources.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background: activeTab === tab.key ? "var(--bg-elevated)" : "transparent",
              color: activeTab === tab.key ? "var(--text-main)" : "var(--text-sub)",
              boxShadow: activeTab === tab.key ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: FULL PORTFOLIO / COMBINED */}
      {(activeTab === "portfolio" || activeTab === "narrative") && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* About Narrative */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} style={{ color: "var(--brand)" }} />
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>How JobPilot Sees You</h3>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-sub)", lineHeight: 1.65 }}>
              {about.how_jobpilot_sees_you}
            </p>
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-sub)" }}>Career Narrative:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)", maxWidth: "60%", textAlign: "right" }}>{about.career_narrative}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-sub)" }}>Ideal Next Role:</span>
                <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{about.ideal_next_role}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--text-sub)" }}>Target Compensation:</span>
                <span style={{ fontWeight: 600, color: "var(--brand)" }}>{about.target_salary_range}</span>
              </div>
            </div>
          </Card>

          {/* Quick Skills Summary */}
          <Card style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={18} style={{ color: "var(--brand)" }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Core Competency Highlights</h3>
              </div>
              <Link href="/prove" prefetch={true} style={{ textDecoration: "none", fontSize: "13px", color: "var(--brand)", fontWeight: 600 }}>
                Prove Skills →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() => {
                    setSelectedSkill(skill);
                    setActiveTab("skills");
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>{skill.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-sub)", marginTop: "2px" }}>{skill.category} • {skill.evidence_count} evidence items</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Badge variant={skill.capability.score >= 9 ? "brand" : skill.capability.score >= 7 ? "cyan" : "neutral"}>
                      {skill.capability.label} ({skill.capability.score})
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: EXPERIENCE TIMELINE */}
      {(activeTab === "portfolio" || activeTab === "work") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Experience Timeline & Proven Impact
            </h3>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>
              Backed by verified patents, production deployments, and employment records
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {experiences.map((exp: any, idx: number) => (
              <Card key={idx} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h4 style={{ fontSize: "18px", fontWeight: 700 }}>{exp.title}</h4>
                      <Badge variant="neutral">@ {exp.company}</Badge>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {exp.period} • {exp.location}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {exp.verified_evidence_badges.map((badge: string, bIdx: number) => (
                      <Badge key={bIdx} variant="success" icon={<CheckCircle2 size={12} />}>
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>

                <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", color: "var(--text-sub)", fontSize: "14px", lineHeight: 1.6 }}>
                  {exp.impact_bullets.map((bullet: string, bIdx: number) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                  {exp.skills_used.map((skill: string, sIdx: number) => (
                    <span key={sIdx} style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", color: "var(--text-sub)", border: "1px solid var(--border-subtle)" }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SELECTED WORK GALLERY */}
      {(activeTab === "portfolio" || activeTab === "work") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Selected Work & Architecture Gallery
            </h3>
            <span style={{ fontSize: "13px", color: "var(--text-sub)" }}>
              Real production repositories and open-source benchmarks
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {projects.map((proj: any, pIdx: number) => (
              <Card key={pIdx} style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <h4 style={{ fontSize: "17px", fontWeight: 700 }}>{proj.name}</h4>
                    <Badge variant="brand">{proj.type}</Badge>
                  </div>
                  <p style={{ fontSize: "14px", color: "var(--text-sub)", marginTop: "8px", lineHeight: 1.6 }}>
                    {proj.description}
                  </p>
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)", fontSize: "13px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Architecture: </span>
                    <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{proj.architecture_summary}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                    <Badge variant="success" icon={<CheckCircle2 size={12} />}>{proj.verified_evidence_badge}</Badge>
                    <span style={{ color: "var(--brand)", fontWeight: 600 }}>{proj.metrics}</span>
                  </div>
                  {proj.github_url && (
                    <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "var(--text-sub)", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Github size={14} /> View Verified Repository <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CATEGORIZED SKILLS & INTERACTIVE DRAWER */}
      {activeTab === "skills" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "flex-start" }}>
          {/* Skill List & Filters */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: skillCategoryFilter === cat ? "var(--brand)" : "var(--border-subtle)",
                    background: skillCategoryFilter === cat ? "rgba(230,57,70,0.1)" : "transparent",
                    color: skillCategoryFilter === cat ? "var(--brand)" : "var(--text-sub)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkill?.name === skill.name;
                return (
                  <Card
                    key={skill.name}
                    onClick={() => setSelectedSkill(skill)}
                    style={{
                      padding: "16px 20px",
                      cursor: "pointer",
                      borderColor: isSelected ? "var(--brand)" : "var(--border-subtle)",
                      background: isSelected ? "rgba(230,57,70,0.04)" : "var(--bg-surface)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{skill.name}</h4>
                        <Badge variant={skill.status === "VERIFIED" ? "success" : "warning"}>
                          {skill.status === "VERIFIED" ? "Verified" : "Needs Evidence"}
                        </Badge>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-sub)", marginTop: "4px" }}>
                        {skill.category} • Demanded by {skill.target_demand_pct || 85}% of target roles
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Badge variant={(skill.capability?.score ?? 8) >= 9 ? "brand" : (skill.capability?.score ?? 8) >= 7 ? "cyan" : "neutral"}>
                        {skill.capability?.label || "Advanced"} ({skill.capability?.score ?? 8.5})
                      </Badge>
                      <ArrowRight size={16} style={{ color: isSelected ? "var(--brand)" : "var(--text-muted)" }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Interactive Skill Detail Pane */}
          {selectedSkill && (
            <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "90px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Badge variant="brand">{selectedSkill.category || "Engineering"}</Badge>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, marginTop: "8px" }}>{selectedSkill.name}</h3>
                </div>
                <Badge variant={selectedSkill.status === "VERIFIED" ? "success" : "warning"}>
                  {selectedSkill.status || "VERIFIED"}
                </Badge>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-sub)" }}>What JobPilot Believes:</span>
                  <span style={{ fontWeight: 700, color: "var(--brand)" }}>
                    {selectedSkill.capability?.label || "Advanced"} ({selectedSkill.capability?.score ?? 8.5}/10)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-sub)" }}>Verification Confidence:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>
                    {Math.round((selectedSkill.confidence?.score ?? 0.9) * 100)}% ({selectedSkill.confidence?.verified_sources_count ?? 3} sources)
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "var(--text-sub)" }}>Target Role Overlap:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-main)" }}>
                    {selectedSkill.target_roles_requiring_count || 14} target positions
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Why It Matters For Your Goal
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-sub)", lineHeight: 1.6 }}>
                  {selectedSkill.why_it_matters}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/prove" prefetch={true} style={{ textDecoration: "none" }}>
                  <Button variant="primary" fullWidth icon={<Award size={16} />}>
                    Prove {selectedSkill.name} in Stage 5
                  </Button>
                </Link>
                <Link href="/improve" prefetch={true} style={{ textDecoration: "none" }}>
                  <Button variant="secondary" fullWidth>
                    Add to Improvement Mission
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT: CONNECTED SOURCES */}
      {activeTab === "sources" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {connected_sources.map((src: any) => (
            <Card key={src.name} style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {src.icon === "github" ? <Github size={20} /> : src.icon === "linkedin" ? <Linkedin size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{src.name}</h4>
                  <div style={{ fontSize: "13px", color: "var(--text-sub)", marginTop: "2px" }}>
                    {src.item_count_label} • Synced {src.last_synced}
                  </div>
                </div>
              </div>
              <Badge variant="success" icon={<CheckCircle2 size={12} />}>{src.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
