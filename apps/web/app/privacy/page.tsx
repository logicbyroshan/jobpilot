"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Globe,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Scale,
  RefreshCw,
  Info,
  Server,
  KeyRound,
} from "lucide-react";
import { privacyApi, DPDPNotice, ProcessorRegistry } from "@/lib/privacy-api";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";

export default function PrivacyNoticePage() {
  const [notice, setNotice] = useState<DPDPNotice | null>(null);
  const [processors, setProcessors] = useState<ProcessorRegistry | null>(null);
  const [selectedLang, setSelectedLang] = useState("English");
  const [activeTab, setActiveTab] = useState<"notice" | "purposes" | "rights" | "processors">("notice");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [n, p] = await Promise.all([
          privacyApi.getNotice().catch(() => null),
          privacyApi.getProcessors().catch(() => null),
        ]);
        setNotice(n);
        setProcessors(p);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-main)", color: "var(--text-main)", paddingBottom: "60px" }}>
      {/* Top Banner Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          backgroundColor: "rgba(13, 19, 34, 0.85)",
          backdropFilter: "blur(14px)",
          position: "sticky",
          top: 0,
          zIndex: "var(--z-topbar)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, var(--accent-primary), #881337)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  color: "#ffffff",
                  boxShadow: "0 0 12px rgba(225, 29, 72, 0.3)",
                }}
              >
                JP
              </div>
              <span style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em", color: "var(--text-main)" }}>
                Job<span style={{ color: "var(--accent-primary)" }}>Pilot</span>
              </span>
            </Link>
            <span style={{ color: "var(--text-dim)" }}>/</span>
            <Badge variant="brand" size="sm" icon={<Shield size={13} />}>
              DPDP Act 2023 & Rules 2025
            </Badge>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Language Selector (8th Schedule) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "5px 10px",
                fontSize: "12.5px",
              }}
            >
              <Globe size={14} color="var(--text-muted)" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-main)",
                  fontSize: "12.5px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {notice?.supported_languages?.map((lang) => (
                  <option key={lang} value={lang} style={{ background: "var(--bg-card)", color: "var(--text-main)" }}>
                    {lang}
                  </option>
                )) || <option value="English">English</option>}
              </select>
            </div>

            <Link href="/settings/privacy" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="sm" icon={<ChevronRight size={14} />}>
                Privacy Center
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "radial-gradient(circle at 50% 0%, rgba(225, 29, 72, 0.08) 0%, rgba(7, 10, 18, 0) 70%)",
          padding: "40px 24px 30px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ maxWidth: "800px" }}>
            <div style={{ marginBottom: "14px" }}>
              <Badge variant="emerald" size="md" icon={<CheckCircle size={14} />}>
                DPDP Act 2023 Privacy Notice
              </Badge>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "12px", color: "var(--text-main)" }}>
              Privacy & Data Protection Notice
            </h1>
            <p style={{ color: "var(--text-sub)", fontSize: "14.5px", lineHeight: 1.6 }}>
              JobPilot processes personal data transparently in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
              We ensure explicit consent, strict purpose limitation, and full data principal rights.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "28px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {[
              { id: "notice", label: "Notice & DPO", icon: FileText },
              { id: "purposes", label: "Data Purposes", icon: Lock },
              { id: "rights", label: "Your Rights", icon: Scale },
              { id: "processors", label: "Third-Party Processors", icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 18px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "13.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                    background: isActive ? "var(--bg-elevated)" : "rgba(255, 255, 255, 0.03)",
                    color: isActive ? "#ffffff" : "var(--text-sub)",
                    border: isActive ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                    boxShadow: isActive ? "0 0 12px rgba(225, 29, 72, 0.15)" : "none",
                  }}
                >
                  <Icon size={16} color={isActive ? "var(--accent-primary)" : "var(--text-muted)"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {loading && (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-sub)" }}>
            <RefreshCw size={24} style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 12px", display: "block", color: "var(--accent-primary)" }} />
            <p>Loading DPDP governance framework data...</p>
          </div>
        )}

        {/* Tab 1: Notice Baseline & DPO */}
        {!loading && activeTab === "notice" && (
          <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div className="grid-3">
              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "rgba(225, 29, 72, 0.12)",
                      border: "1px solid rgba(225, 29, 72, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-primary)",
                      marginBottom: "14px",
                    }}
                  >
                    <Shield size={20} />
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Data Fiduciary Role</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    JobPilot Technologies Private Limited determines the purposes and means of processing personal data for career graph modeling and application tailoring.
                  </p>
                </div>
                <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-dim)" }}>
                  Notice Version: <span style={{ color: "var(--text-sub)", fontFamily: "var(--font-mono)" }}>{notice?.notice_version || "v1.0-dpdp-2025"}</span>
                </div>
              </Card>

              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "rgba(6, 182, 212, 0.12)",
                      border: "1px solid rgba(6, 182, 212, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-cyan)",
                      marginBottom: "14px",
                    }}
                  >
                    <UserCheck size={20} />
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Data Protection Officer</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Direct designated contact for all personal data queries, consent withdrawal, and rights execution under DPDP Rule 4.
                  </p>
                </div>
                <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div>Email: <a href="mailto:dpo@jobpilot.dev" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>dpo@jobpilot.dev</a></div>
                  <div>Grievance: <a href="mailto:grievance@jobpilot.dev" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>grievance@jobpilot.dev</a></div>
                </div>
              </Card>

              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "rgba(245, 158, 11, 0.12)",
                      border: "1px solid rgba(245, 158, 11, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-amber)",
                      marginBottom: "14px",
                    }}
                  >
                    <Scale size={20} />
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Appellate Authority</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    If unsatisfied with internal grievance redressal within 90 days, Data Principals may lodge an appeal with the Data Protection Board of India.
                  </p>
                </div>
                <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", fontSize: "12px" }}>
                  <a
                    href="https://dpbi.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--accent-amber)", display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                  >
                    Data Protection Board of India Portal <ExternalLink size={12} />
                  </a>
                </div>
              </Card>
            </div>

            {/* Core Legal Principles */}
            <Card style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <Info size={18} color="var(--accent-primary)" />
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Governing Principles of Data Processing</h2>
              </div>

              <div className="grid-2">
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "6px", fontSize: "13.5px" }}>
                    1. Lawful & Transparent Processing (Section 4)
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Personal data is processed solely on the basis of free, specific, informed, and unambiguous affirmative consent or legitimate uses recognized by law.
                  </p>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "6px", fontSize: "13.5px" }}>
                    2. Purpose Limitation (Section 8)
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Data collected for career modeling is strictly isolated and never repurposed for unauthorized advertising, dark patterns, or external resale.
                  </p>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "6px", fontSize: "13.5px" }}>
                    3. Verifiable Children Protection (Section 9)
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Under DPDP Act, minors (&lt;18) require Verifiable Parental Consent (VPC). Targeted advertising and behavioral tracking of minors are strictly blocked.
                  </p>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "6px", fontSize: "13.5px" }}>
                    4. Reasonable Security Safeguards (Section 8(5))
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    End-to-end encryption in transit (TLS 1.3), encryption at rest (AES-256), cryptographic OAuth token vault, and strict PII log sanitization.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Itemised Purposes */}
        {!loading && activeTab === "purposes" && (
          <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Itemised Data Processing Purposes</h2>
                <p style={{ color: "var(--text-sub)", fontSize: "13.5px", marginTop: "4px" }}>
                  Section 5 of DPDP Act mandates an itemised description of personal data collected and specified purposes.
                </p>
              </div>
              <Link href="/settings/privacy" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="sm" icon={<ArrowRight size={14} />}>
                  Manage My Consent
                </Button>
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {notice?.purposes?.map((purpose) => (
                <Card key={purpose.purpose_id} style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h3 style={{ fontSize: "15.5px", fontWeight: 700 }}>{purpose.purpose_name}</h3>
                      {purpose.is_essential ? (
                        <Badge variant="brand" size="sm">Essential</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">Optional (Withdrawable)</Badge>
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
                      Retention: {purpose.retention_period_days} Days
                    </span>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "var(--text-sub)", lineHeight: 1.55, marginBottom: "16px" }}>
                    {purpose.description}
                  </p>

                  <div className="grid-2">
                    <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11.5px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                        Data Categories Collected
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {purpose.data_categories_collected.map((cat) => (
                          <Badge key={cat} variant="neutral" size="sm">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11.5px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                        Processors Involved
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {purpose.third_party_processors.map((proc) => (
                          <Badge key={proc} variant="cyan" size="sm">
                            {proc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Data Principal Rights */}
        {!loading && activeTab === "rights" && (
          <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Data Principal Rights (Sections 11 - 14)</h2>
              <p style={{ color: "var(--text-sub)", fontSize: "13.5px", marginTop: "4px" }}>
                You have enforceable statutory rights under the DPDP Act 2023. You can exercise these in the Privacy Center.
              </p>
            </div>

            <div className="grid-2">
              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--accent-primary)" }}>
                    <Eye size={18} />
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>1. Right to Access Information (Section 11)</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Request a category summary of all personal data held about you, the identities of all third parties with whom data is shared, and download a complete machine-readable JSON export.
                  </p>
                </div>
                <div>
                  <Link href="/settings/privacy" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm" icon={<ChevronRight size={13} />}>
                      Download My Data Archive
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--accent-cyan)" }}>
                    <RefreshCw size={18} />
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>2. Right to Correction & Updating (Section 12)</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Correct inaccurate personal data, complete incomplete information, and update obsolete experience or repository records in your career competency graph.
                  </p>
                </div>
                <div>
                  <Link href="/know" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm" icon={<ChevronRight size={13} />}>
                      Update Profile & Living Portfolio
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--accent-rose)" }}>
                    <AlertTriangle size={18} />
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>3. Right to Erasure / To be Forgotten (Section 12)</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Permanently purge your entire account, profile, evidence graph, job applications, and tailored artifacts across all active databases and cached systems.
                  </p>
                </div>
                <div>
                  <Link href="/settings/privacy" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm" icon={<ChevronRight size={13} />}>
                      Account Erasure Workflow
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--accent-amber)" }}>
                    <HelpCircle size={18} />
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>4. Right of Grievance Redressal (Section 13)</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Submit privacy complaints directly to our designated DPO with an immutable ticket ID and a statutory 90-day SLA resolution countdown.
                  </p>
                </div>
                <div>
                  <Link href="/settings/privacy" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm" icon={<ChevronRight size={13} />}>
                      File Privacy Grievance Ticket
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px", gridColumn: "1 / -1" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--accent-emerald)" }}>
                    <UserCheck size={18} />
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)" }}>5. Right to Nominate Representative (Section 14)</h3>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                    Designate an individual (spouse, parent, child, legal representative) who shall exercise your Data Principal rights under the DPDP Act in the event of death or incapacity.
                  </p>
                </div>
                <div>
                  <Link href="/settings/privacy" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm" icon={<ChevronRight size={13} />}>
                      Manage Nominee Details
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 4: Third-Party Processors */}
        {!loading && activeTab === "processors" && (
          <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Third-Party Data Processors & Sub-Processors</h2>
              <p style={{ color: "var(--text-sub)", fontSize: "13.5px", marginTop: "4px" }}>
                Transparency registry of external entities that process personal data on behalf of JobPilot under Section 8(2).
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {processors?.processors?.map((proc) => (
                <Card key={proc.processor_name} style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{proc.processor_name}</h3>
                      <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>{proc.entity_type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Badge variant="neutral" size="sm">
                        {proc.hosting_location}
                      </Badge>
                      {proc.cross_border_transfer && (
                        <Badge variant="warning" size="sm">
                          Cross-Border Transfer
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "var(--text-sub)", lineHeight: 1.55, marginBottom: "14px" }}>
                    {proc.purpose}
                  </p>

                  <div className="grid-2">
                    <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11.5px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                        Categories Processed
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {proc.personal_data_categories_processed.map((c) => (
                          <Badge key={c} variant="neutral" size="sm">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                      <span style={{ fontSize: "11.5px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                        Safeguards & Governance
                      </span>
                      <span style={{ fontSize: "12.5px", color: "var(--text-sub)", lineHeight: 1.5 }}>
                        {proc.safeguards_and_dpa}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
