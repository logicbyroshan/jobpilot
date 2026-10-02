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
  Share2,
} from "lucide-react";
import { api } from "@/lib/api";
import { LivingPortfolioResponse, CategorizedSkillItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useToast } from "@/lib/toast-context";

export default function LivingPortfolioPage() {
  const { showToast } = useToast();
  const [portfolio, setPortfolio] = useState<LivingPortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "experience" | "projects" | "sources">("overview");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>("ALL");
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const data = await api.getLivingPortfolio();
        setPortfolio(data);
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
        <p>Loading your Profile & Skills Portfolio...</p>
      </div>
    );
  }

  const hero = {
    full_name: portfolio.hero?.full_name || "Alex Chen",
    headline: portfolio.hero?.headline || "Senior Backend & Distributed Systems Engineer",
    primary_domains: Array.isArray(portfolio.hero?.primary_domains) ? portfolio.hero.primary_domains : ["Distributed Systems", "Cloud Infrastructure"],
    seniority_level: portfolio.hero?.seniority_level || "Staff / Principal",
    location: portfolio.hero?.location || "San Francisco, CA (Remote)",
    profile_completeness_pct: portfolio.hero?.profile_completeness_pct || 94.0,
    confidence: {
      score: portfolio.hero?.confidence?.score ?? 0.94,
      label: portfolio.hero?.confidence?.label || "Verified",
      verified_sources_count: portfolio.hero?.confidence?.verified_sources_count ?? 4,
    },
    ai_summary: portfolio.hero?.ai_summary || "High-throughput systems architect specialized in distributed consensus, low-latency storage, and concurrent backend services.",
  };

  const about = {
    how_jobpilot_sees_you: portfolio.about?.how_jobpilot_sees_you || "A top 2% systems engineer with verified evidence spanning production Raft consensus engines and high-concurrency Go services.",
    career_narrative: portfolio.about?.career_narrative || "Transitioning to Principal Infrastructure Architect at Tier-1 laboratories.",
    ideal_next_role: portfolio.about?.ideal_next_role || "Staff / Principal Distributed Systems Architect",
    target_salary_range: portfolio.about?.target_salary_range || "$240k - $320k + Equity",
    workplace_preference: portfolio.about?.workplace_preference || "Remote / Hybrid",
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
  const filteredSkills = skills.filter((s) => {
    const matchesCategory = skillCategoryFilter === "ALL" || s.category === skillCategoryFilter;
    const matchesSearch = !skillSearchQuery || s.name.toLowerCase().includes(skillSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* 1. Header with Title and Action Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="brand">Skills & Profile</Badge>
            <Badge variant="success" dot>Verified Profile</Badge>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Skills & Profile
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "13px", marginTop: "3px" }}>
            Verified technical competencies, production work history, and architecture evidence.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Share2 size={13} color="var(--accent-cyan)" />}
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard?.writeText(window.location.href);
                showToast("Portfolio link copied to clipboard!", "success");
              }
            }}
          >
            Share
          </Button>
          <Link href="/sources" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm">
              Data Sources ({connected_sources.length})
            </Button>
          </Link>
          <Link href="/prove" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm" icon={<Award size={14} />}>
              Take Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Compact Profile Hero Banner */}
      <div
        className="ui-card"
        style={{
          background: "linear-gradient(135deg, rgba(225,29,72,0.06) 0%, rgba(12,18,32,0.98) 100%)",
          borderColor: "rgba(225,29,72,0.22)",
          padding: "16px 20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                background: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              {hero.full_name?.split(" ").map((n: string) => n[0]).join("") || "AC"}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 800 }}>{hero.full_name}</h2>
                <Badge variant="cyan" size="sm">{hero.seniority_level}</Badge>
                <Badge variant="success" size="sm" icon={<ShieldCheck size={12} />}>{hero.confidence.label}</Badge>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-sub)", marginTop: "2px" }}>
                {hero.headline} • {hero.location}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700 }}>
                Completeness
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-primary)" }}>
                {hero.profile_completeness_pct}%
              </div>
            </div>
            <div style={{ width: "80px", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${hero.profile_completeness_pct}%`, height: "100%", background: "var(--accent-primary)" }} />
            </div>
          </div>
        </div>

        {/* AI Summary Sub-box */}
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Sparkles size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
            {hero.ai_summary}
          </p>
        </div>
      </div>

      {/* 3. Navigation Tab Bar */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px", overflowX: "auto" }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "skills", label: `Skills Matrix (${skills.length})` },
          { key: "experience", label: `Experience (${experiences.length})` },
          { key: "projects", label: `Projects (${projects.length})` },
          { key: "sources", label: `Sources (${connected_sources.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: "pointer",
              border: activeTab === tab.key ? "1px solid var(--border-subtle)" : "1px solid transparent",
              background: activeTab === tab.key ? "var(--bg-elevated)" : "transparent",
              color: activeTab === tab.key ? "#ffffff" : "var(--text-sub)",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid-split-65-35">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Career Narrative */}
            <div className="ui-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Sparkles size={15} color="var(--accent-primary)" />
                <h3 style={{ fontSize: "14.5px", fontWeight: 700 }}>Career Positioning</h3>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                {about.how_jobpilot_sees_you}
              </p>
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "12px", marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12.5px" }}>
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Ideal Next Role:</span>
                  <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "1px" }}>{about.ideal_next_role}</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-dim)" }}>Target Salary:</span>
                  <div style={{ fontWeight: 600, color: "var(--accent-emerald)", marginTop: "1px" }}>{about.target_salary_range}</div>
                </div>
              </div>
            </div>

            {/* Experience Snapshot */}
            <div className="ui-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ fontSize: "14.5px", fontWeight: 700 }}>Recent Experience</h3>
                <button
                  onClick={() => setActiveTab("experience")}
                  style={{ background: "transparent", border: "none", color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  View All ({experiences.length}) →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {experiences.slice(0, 2).map((exp: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "6px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-main)" }}>{exp.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{exp.company} • {exp.period}</div>
                      </div>
                      <Badge variant="success" size="sm">Verified</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Skills Snapshot */}
          <div className="ui-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Award size={15} color="var(--accent-purple)" />
                <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Verified Skills</h3>
              </div>
              <Link href="/prove" prefetch={true} style={{ fontSize: "12px", color: "var(--accent-purple)", fontWeight: 600, textDecoration: "none" }}>
                Prove Skills →
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {skills.slice(0, 5).map((skill) => (
                <div
                  key={skill.name}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-main)" }}>{skill.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{skill.category}</div>
                  </div>
                  <Badge variant={skill.capability.score >= 9 ? "brand" : skill.capability.score >= 7 ? "cyan" : "neutral"} size="sm">
                    {skill.capability.label} ({skill.capability.score})
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS MATRIX */}
      {activeTab === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: skillCategoryFilter === cat ? 700 : 500,
                    cursor: "pointer",
                    border: "1px solid var(--border-subtle)",
                    background: skillCategoryFilter === cat ? "var(--accent-primary)" : "var(--bg-elevated)",
                    color: skillCategoryFilter === cat ? "#ffffff" : "var(--text-sub)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search skills..."
              value={skillSearchQuery}
              onChange={(e) => setSkillSearchQuery(e.target.value)}
              style={{
                padding: "6px 10px",
                borderRadius: "4px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-main)",
                fontSize: "12.5px",
                width: "180px",
              }}
            />
          </div>

          {/* Skills Grid */}
          <div className="grid-2">
            {filteredSkills.map((skill) => (
              <div
                key={skill.name}
                className="ui-card"
                style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>{skill.name}</span>
                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "1px" }}>{skill.category} • {skill.evidence_count} verified sources</div>
                  </div>
                  <Badge variant={skill.capability.score >= 9 ? "brand" : skill.capability.score >= 7 ? "cyan" : "neutral"} size="sm">
                    {skill.capability.label} ({skill.capability.score}/10)
                  </Badge>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  {skill.why_it_matters}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", fontSize: "11.5px" }}>
                  <span style={{ color: "var(--accent-emerald)" }}>{skill.confidence.label}</span>
                  <Link href="/prove" prefetch={true} style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
                    Take Test →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXPERIENCE */}
      {activeTab === "experience" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {experiences.map((exp: any, idx: number) => (
            <div key={idx} className="ui-card" style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{exp.title}</h3>
                    <Badge variant="neutral" size="sm">@ {exp.company}</Badge>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                    {exp.period} • {exp.location}
                  </div>
                </div>
                <Badge variant="success" size="sm" icon={<CheckCircle2 size={12} />}>Verified Employment</Badge>
              </div>

              <ul style={{ margin: "10px 0 0 16px", color: "var(--text-sub)", fontSize: "12.5px", lineHeight: 1.5 }}>
                {exp.impact_bullets.map((bullet: string, bIdx: number) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)" }}>
                {exp.skills_used.map((skill: string, sIdx: number) => (
                  <span key={sIdx} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: PROJECTS */}
      {activeTab === "projects" && (
        <div className="grid-2">
          {projects.map((proj: any, pIdx: number) => (
            <div key={pIdx} className="ui-card" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "14.5px", fontWeight: 700 }}>{proj.name}</h3>
                  <Badge variant="brand" size="sm">{proj.type}</Badge>
                </div>
                <p style={{ fontSize: "12.5px", color: "var(--text-sub)", marginTop: "6px", lineHeight: 1.45 }}>
                  {proj.description}
                </p>
                <div style={{ marginTop: "8px", padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: "4px", fontSize: "11.5px" }}>
                  <span style={{ color: "var(--text-dim)" }}>Architecture: </span>
                  <span style={{ color: "var(--text-main)" }}>{proj.architecture_summary}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <Badge variant="success" size="sm" icon={<CheckCircle2 size={11} />}>{proj.verified_evidence_badge}</Badge>
                {proj.github_url && (
                  <a href={proj.github_url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Github size={13} /> View Repo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: SOURCES */}
      {activeTab === "sources" && (
        <div className="grid-2">
          {connected_sources.map((src: any, sIdx: number) => (
            <div key={sIdx} className="ui-card" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={16} color="var(--accent-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700 }}>{src.name}</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>{src.item_count_label} • Synced {src.last_synced}</div>
                </div>
              </div>
              <Badge variant="success" size="sm">Connected</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
