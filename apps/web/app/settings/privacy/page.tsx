"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Download,
  Trash2,
  HelpCircle,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  RefreshCw,
  Send,
  X,
  AlertCircle,
  Check,
  Scale,
  Database,
  Building,
} from "lucide-react";
import {
  privacyApi,
  UserConsentOverview,
  DataAccessSummary,
  Grievance,
  Nomination,
  RetentionStatus,
} from "@/lib/privacy-api";
import { Button } from "@/app/components/ui/Button";
import { Badge } from "@/app/components/ui/Badge";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { useToast } from "@/lib/toast-context";

export default function PrivacySettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"consent" | "access" | "grievances" | "nomination" | "erasure">("consent");
  const [consentOverview, setConsentOverview] = useState<UserConsentOverview | null>(null);
  const [accessSummary, setDataAccessSummary] = useState<DataAccessSummary | null>(null);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [nomination, setNomination] = useState<Nomination | null>(null);
  const [retentionStatus, setRetentionStatus] = useState<RetentionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Consent form state
  const [consentState, setConsentState] = useState<Record<string, boolean>>({});
  const [savingConsent, setSavingConsent] = useState(false);

  // Grievance form state
  const [grvCategory, setGrvCategory] = useState("CONSENT_WITHDRAWAL");
  const [grvSubject, setGrvSubject] = useState("");
  const [grvDescription, setGrvDescription] = useState("");
  const [submittingGrv, setSubmittingGrv] = useState(false);

  // Nomination form state
  const [nomName, setNomName] = useState("");
  const [nomEmail, setNomEmail] = useState("");
  const [nomPhone, setNomPhone] = useState("");
  const [nomRel, setNomRel] = useState("SPOUSE");
  const [nomNotes, setNomNotes] = useState("");
  const [savingNom, setSavingNom] = useState(false);

  // Erasure modal state
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [erasureReason, setErasureReason] = useState("");
  const [erasing, setErasing] = useState(false);
  const [erasureError, setErasureError] = useState("");
  const [erasureSuccess, setErasureSuccess] = useState<any | null>(null);

  // SAR Export state
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [consents, summary, grvs, nom, ret] = await Promise.all([
        privacyApi.getConsentOverview().catch(() => null),
        privacyApi.getDataAccessSummary().catch(() => null),
        privacyApi.listGrievances().catch(() => []),
        privacyApi.getNomination().catch(() => null),
        privacyApi.getRetentionStatus().catch(() => null),
      ]);

      if (consents) {
        setConsentOverview(consents);
        const map: Record<string, boolean> = {};
        consents.active_consents.forEach((c) => {
          map[c.purpose_id] = c.status === "GRANTED";
        });
        setConsentState(map);
      }

      if (summary) setDataAccessSummary(summary);
      if (grvs) setGrievances(grvs);
      if (nom) {
        setNomination(nom);
        setNomName(nom.nominee_full_name);
        setNomEmail(nom.nominee_email);
        setNomPhone(nom.nominee_phone || "");
        setNomRel(nom.relationship);
        setNomNotes(nom.notes || "");
      }
      if (ret) setRetentionStatus(ret);
    } catch (err) {
      console.error("Failed to load DPDP privacy data", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleConsent = (purposeId: string) => {
    setConsentState((prev) => ({
      ...prev,
      [purposeId]: !prev[purposeId],
    }));
  };

  const handleSaveConsent = async () => {
    setSavingConsent(true);
    try {
      const consentsList = Object.entries(consentState).map(([purpose_id, granted]) => ({
        purpose_id,
        granted,
      }));
      await privacyApi.updateConsentBatch(consentsList);
      const updated = await privacyApi.getConsentOverview();
      setConsentOverview(updated);
      showToast("DPDP consent preferences recorded with cryptographic timestamp!", "success");
    } catch (err) {
      console.error("Save consent failed", err);
      showToast("Failed to update consents.", "error");
    } finally {
      setSavingConsent(false);
    }
  };

  const handleExportSAR = async () => {
    setExporting(true);
    try {
      const data = await privacyApi.exportFullUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JobPilot_SAR_Export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Portable SAR archive downloaded successfully (DPDP Sec 11)!", "success");
    } catch (err) {
      console.error("SAR Export failed", err);
      showToast("Failed to generate SAR export.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grvSubject.trim() || !grvDescription.trim()) {
      showToast("Please provide both subject and description.", "warning");
      return;
    }
    setSubmittingGrv(true);
    try {
      const newGrv = await privacyApi.createGrievance(
        grvCategory,
        grvSubject,
        grvDescription
      );
      setGrievances((prev) => [newGrv, ...prev]);
      setGrvSubject("");
      setGrvDescription("");
      showToast(`Grievance #${newGrv.ticket_id} filed. Statutory SLA: 90 Days.`, "success");
    } catch (err) {
      console.error("Grievance submission failed", err);
      showToast("Failed to submit grievance ticket.", "error");
    } finally {
      setSubmittingGrv(false);
    }
  };

  const handleSaveNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomName.trim() || !nomEmail.trim()) {
      showToast("Please provide nominee name and email.", "warning");
      return;
    }
    setSavingNom(true);
    try {
      const saved = await privacyApi.setNomination({
        nominee_full_name: nomName,
        nominee_email: nomEmail,
        nominee_phone: nomPhone || undefined,
        relationship: nomRel,
        notes: nomNotes || undefined,
      });
      setNomination(saved);
      showToast("Statutory nominee registered successfully (Section 14)!", "success");
    } catch (err) {
      console.error("Nomination failed", err);
      showToast("Failed to register nominee.", "error");
    } finally {
      setSavingNom(false);
    }
  };

  const handleExecuteErasure = async () => {
    if (confirmationPhrase.trim() !== "DELETE MY PERSONAL DATA PERMANENTLY") {
      setErasureError("You must enter the exact required confirmation phrase.");
      return;
    }
    setErasing(true);
    setErasureError("");
    try {
      const res = await privacyApi.executeDataErasure(
        confirmationPhrase,
        erasureReason || "Data principal initiated self-service erasure"
      );
      setErasureSuccess(res);
      showToast("Personal data erased. Cryptographic audit record created.", "success");
    } catch (err: any) {
      console.error("Erasure failed", err);
      setErasureError(err.message || "Erasure execution failed.");
    } finally {
      setErasing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-sub)" }}>
        <RefreshCw size={24} style={{ animation: "spin 0.8s linear infinite", margin: "0 auto 12px", display: "block", color: "var(--accent-primary)" }} />
        <p>Loading DPDP Compliance & Data Rights Center...</p>
      </div>
    );
  }

  const tabs = [
    { id: "consent", label: "Consent Choices", icon: Lock, badge: "Sec 6 & 7" },
    { id: "access", label: "Subject Access (SAR)", icon: Download, badge: "Sec 11" },
    { id: "grievances", label: "Grievance Redressal", icon: HelpCircle, badge: "Sec 13" },
    { id: "nomination", label: "Nomination Proxy", icon: UserCheck, badge: "Sec 14" },
    { id: "erasure", label: "Right to Erasure", icon: Trash2, badge: "Sec 12", danger: true },
  ];

  return (
    <div className="page-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Badge variant="brand">DPDP Act 2023 & DPDP Rules 2025</Badge>
            <Badge variant="success" dot>Statutory Compliance Active</Badge>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.025em" }}>
            Privacy & Data Principal Rights Center
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "14px", marginTop: "4px", lineHeight: 1.55 }}>
            Manage explicit consents, exercise statutory rights (Access, Portability, Grievance, Nomination, Erasure), and monitor data fiduciary processing.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/privacy" prefetch={true} style={{ textDecoration: "none" }}>
            <Button variant="secondary" size="sm" icon={<FileText size={14} color="var(--accent-cyan)" />}>
              View DPDP Legal Notice
            </Button>
          </Link>
        </div>
      </div>

      {/* Statutory Navigation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "8px",
          overflowX: "auto",
          width: "100%",
        }}
      >
        {tabs.map((tab) => {
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
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "13.5px",
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? tab.danger
                    ? "#fda4af"
                    : "#ffffff"
                  : "var(--text-sub)",
                background: isActive
                  ? tab.danger
                    ? "rgba(225, 29, 72, 0.2)"
                    : "var(--bg-elevated)"
                  : "transparent",
                border: isActive
                  ? tab.danger
                    ? "1px solid rgba(225, 29, 72, 0.4)"
                    : "1px solid var(--border-subtle)"
                  : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon
                size={15}
                color={
                  isActive
                    ? tab.danger
                      ? "var(--accent-rose)"
                      : "var(--accent-primary)"
                    : "var(--text-muted)"
                }
              />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "3px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-dim)",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONSENT PREFERENCES */}
      {activeTab === "consent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <Card style={{ padding: "18px 20px", background: "rgba(6, 182, 212, 0.06)", borderColor: "rgba(6, 182, 212, 0.25)" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <Info size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.55 }}>
                <strong style={{ color: "#ffffff" }}>Section 6 Notice & Consent:</strong> Every personal data processing purpose below is unbundled, specific, and independently revokable at any time without punitive service denial for non-essential features.
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {consentOverview?.all_available_purposes.map((purpose) => {
              const isGranted = consentState[purpose.purpose_id] !== false;
              return (
                <Card
                  key={purpose.purpose_id}
                  style={{
                    padding: "20px 22px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    borderLeft: isGranted ? "3px solid var(--accent-emerald)" : "3px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "280px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "15.5px", fontWeight: 700, color: "#f8fafc" }}>
                        {purpose.purpose_name}
                      </h3>
                      {purpose.is_essential ? (
                        <Badge variant="brand" size="sm">Essential Core</Badge>
                      ) : (
                        <Badge variant="cyan" size="sm">Optional AI Feature</Badge>
                      )}
                    </div>

                    <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.5, marginBottom: "8px" }}>
                      {purpose.description}
                    </p>

                    <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "var(--text-dim)", flexWrap: "wrap" }}>
                      <span>Retention: <strong style={{ color: "var(--text-sub)" }}>{purpose.retention_period_days} days</strong></span>
                      <span>•</span>
                      <span>Categories: <strong style={{ color: "var(--text-sub)" }}>{purpose.data_categories_collected.slice(0, 2).join(", ")}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <Badge variant={isGranted ? "success" : "neutral"} size="md" dot>
                      {isGranted ? "Consent Granted" : "Consent Withdrawn"}
                    </Badge>

                    {!purpose.is_essential && (
                      <button
                        type="button"
                        onClick={() => handleToggleConsent(purpose.purpose_id)}
                        style={{
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          background: isGranted ? "var(--accent-emerald)" : "rgba(255, 255, 255, 0.12)",
                          border: "none",
                          position: "relative",
                          cursor: "pointer",
                          transition: "background 0.2s ease",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: isGranted ? "22px" : "2px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: "#ffffff",
                            transition: "left 0.2s ease",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          }}
                        />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveConsent}
              disabled={savingConsent}
              icon={<CheckCircle2 size={15} />}
            >
              {savingConsent ? "Recording Cryptographic Consents..." : "Save Consent Choices"}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT ACCESS REQUEST (SAR - SECTION 11) */}
      {activeTab === "access" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Action Header Card */}
          <Card style={{ padding: "24px", background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, #0d1322 100%)", borderColor: "rgba(6, 182, 212, 0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Badge variant="cyan">Section 11 Right of Access</Badge>
                  <span style={{ fontSize: "12.5px", color: "var(--text-dim)" }}>Machine-Readable JSON</span>
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                  Export Full Personal Data Archive (SAR)
                </h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-sub)", marginTop: "4px", maxWidth: "620px", lineHeight: 1.55 }}>
                  Download a structured, tamper-evident cryptographic JSON package containing every profile attribute, skill vector, evidence claim, and application log recorded for your account.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleExportSAR}
                disabled={exporting}
                icon={<Download size={15} />}
              >
                {exporting ? "Generating Package..." : "Download SAR Package (.JSON)"}
              </Button>
            </div>
          </Card>

          {/* Personal Data Categories Inventory */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Database size={16} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: "15px", fontWeight: 700 }}>Personal Data Inventory & Storage Registry</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
              {accessSummary?.categories.map((cat) => (
                <Card key={cat.category_name} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>{cat.category_name}</span>
                    <Badge variant="neutral" size="sm">{cat.record_count} Records</Badge>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--text-sub)", lineHeight: 1.5, margin: 0 }}>
                    {cat.description}
                  </p>
                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--text-dim)" }}>
                    <span>Location: {cat.storage_location}</span>
                    <span>Processed: {cat.processors_involved.slice(0, 1).join(", ")}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GRIEVANCE REDRESSAL (SECTION 13) */}
      {activeTab === "grievances" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "22px", alignItems: "flex-start" }}>
          {/* File a Grievance Form */}
          <Card style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "6px", background: "rgba(225, 29, 72, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
                <HelpCircle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>Submit DPDP Grievance</h3>
                <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Statutory resolution within 90 calendar days</p>
              </div>
            </div>

            <form onSubmit={handleSubmitGrievance} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Grievance Category
                </label>
                <select
                  value={grvCategory}
                  onChange={(e) => setGrvCategory(e.target.value)}
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
                >
                  <option value="CONSENT_WITHDRAWAL">Consent Withdrawal Delay or Disregard</option>
                  <option value="UNAUTHORIZED_PROCESSING">Unauthorized Personal Data Processing</option>
                  <option value="DATA_INACCURACY">Correction / Inaccuracy of Personal Records</option>
                  <option value="ERASURE_FAILURE">Erasure Request Non-Compliance</option>
                  <option value="THIRD_PARTY_DISCLOSURE">Unauthorized Sub-Processor Transfer</option>
                  <option value="OTHER_COMPLIANCE">Other DPDP Statutory Violation</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Subject Summary
                </label>
                <input
                  type="text"
                  value={grvSubject}
                  onChange={(e) => setGrvSubject(e.target.value)}
                  placeholder="e.g. Incomplete removal of legacy LinkedIn commits"
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
                  Detailed Description
                </label>
                <textarea
                  value={grvDescription}
                  onChange={(e) => setGrvDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your grievance, specific data items, and desired resolution..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    fontSize: "13px",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.45,
                  }}
                />
              </div>

              <div style={{ padding: "10px 12px", borderRadius: "6px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.45 }}>
                Assigned to: <strong style={{ color: "var(--text-sub)" }}>Designated DPO (dpo@jobpilot.dev)</strong>. If unresolved within 90 days, you retain statutory rights to appeal directly to the <strong>Data Protection Board of India</strong>.
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submittingGrv}
                icon={<Send size={14} />}
              >
                {submittingGrv ? "Filing Grievance..." : "File Statutory Grievance"}
              </Button>
            </form>
          </Card>

          {/* Grievance Ticket History */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)" }}>
              Filed Grievance Tickets ({grievances.length})
            </div>

            {grievances.length === 0 ? (
              <Card style={{ padding: "28px", textAlign: "center", color: "var(--text-dim)" }}>
                <CheckCircle2 size={24} color="var(--accent-emerald)" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-sub)" }}>No Outstanding Grievances</div>
                <div style={{ fontSize: "12px", marginTop: "2px" }}>All personal data handling is in good standing.</div>
              </Card>
            ) : (
              grievances.map((g) => (
                <Card key={g.id} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                      #{g.ticket_id}
                    </span>
                    <Badge variant={g.status === "RESOLVED" ? "success" : "warning"} size="sm">
                      {g.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#f8fafc" }}>
                    {g.subject}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-sub)", margin: 0, lineHeight: 1.45 }}>
                    {g.description}
                  </p>
                  <div style={{ fontSize: "11.5px", color: "var(--text-dim)", display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                    <span>Filed: {new Date(g.submitted_at).toLocaleDateString()}</span>
                    <span>Deadline: {g.days_remaining} days left</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: NOMINATION (SECTION 14) */}
      {activeTab === "nomination" && (
        <Card style={{ padding: "24px", maxWidth: "680px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "6px", background: "rgba(168, 85, 247, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
              <UserCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>Register Statutory Nominee (Section 14)</h3>
              <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Empowers your designated proxy to exercise rights in case of death or incapacitation</p>
            </div>
          </div>

          <form onSubmit={handleSaveNomination} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Nominee Full Legal Name *
                </label>
                <input
                  type="text"
                  value={nomName}
                  onChange={(e) => setNomName(e.target.value)}
                  placeholder="Full Legal Name"
                  required
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
                  Nominee Email Address *
                </label>
                <input
                  type="email"
                  value={nomEmail}
                  onChange={(e) => setNomEmail(e.target.value)}
                  placeholder="nominee@example.com"
                  required
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Nominee Phone Number
                </label>
                <input
                  type="tel"
                  value={nomPhone}
                  onChange={(e) => setNomPhone(e.target.value)}
                  placeholder="+91 / International phone"
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
                  Relationship to Data Principal
                </label>
                <select
                  value={nomRel}
                  onChange={(e) => setNomRel(e.target.value)}
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
                >
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARENT">Parent / Legal Guardian</option>
                  <option value="CHILD">Child</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="LEGAL_REPRESENTATIVE">Legal Representative / Attorney</option>
                  <option value="OTHER">Other Designated Beneficiary</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                Special Directives & Instructions (Optional)
              </label>
              <textarea
                value={nomNotes}
                onChange={(e) => setNomNotes(e.target.value)}
                rows={2}
                placeholder="Specific instructions regarding erasure or export of portfolio data upon trigger..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-main)",
                  fontSize: "13px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={savingNom}
              icon={<Check size={14} />}
            >
              {savingNom ? "Registering Nominee..." : "Save Nomination (Section 14)"}
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 5: RIGHT TO ERASURE (SECTION 12) */}
      {activeTab === "erasure" && (
        <Card style={{ padding: "28px", maxWidth: "680px", borderColor: "rgba(225, 29, 72, 0.4)", background: "linear-gradient(135deg, rgba(225, 29, 72, 0.08) 0%, #0d1322 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "rgba(225, 29, 72, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-primary)" }}>
              <Trash2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fda4af" }}>Permanent Data Erasure (Right to be Forgotten)</h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-dim)" }}>Section 12 DPDP Act 2023 Statutory Erasure</p>
            </div>
          </div>

          <p style={{ fontSize: "13.5px", color: "var(--text-sub)", lineHeight: 1.6, marginBottom: "18px" }}>
            Triggering permanent erasure will irreversibly purge your identity graph, verified skill vectors, scraped commit histories, tailored resumes, and active application jobs from our production databases.
          </p>

          <div style={{ padding: "12px 16px", borderRadius: "6px", background: "rgba(225, 29, 72, 0.12)", border: "1px solid rgba(225, 29, 72, 0.3)", marginBottom: "20px" }}>
            <div style={{ fontSize: "12.5px", color: "#fda4af", fontWeight: 700, marginBottom: "4px" }}>
              Statutory Guarantee & Audit Proof
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-sub)", lineHeight: 1.5 }}>
              In accordance with Section 12, an anonymized SHA-256 cryptographic verification token will be generated as proof of compliance without retaining identifiable data.
            </div>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={() => setShowErasureModal(true)}
            icon={<Trash2 size={15} />}
          >
            Initiate Permanent Erasure Request
          </Button>
        </Card>
      )}

      {/* Permanent Erasure Verification Modal */}
      {showErasureModal && (
        <div
          onClick={() => setShowErasureModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 10, 18, 0.85)",
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
              maxWidth: "520px",
              background: "#0d1322",
              border: "1px solid rgba(225, 29, 72, 0.4)",
              borderRadius: "8px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#fda4af" }}>Confirm Irreversible Erasure</h3>
              </div>
              <button
                onClick={() => setShowErasureModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            {erasureSuccess ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "center", padding: "16px 0" }}>
                <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ margin: "0 auto" }} />
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>Data Purged Successfully</h4>
                <p style={{ fontSize: "13px", color: "var(--text-sub)" }}>
                  Your personal records have been erased across all relational and vector database stores.
                </p>
                <div style={{ padding: "8px 12px", borderRadius: "4px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--accent-cyan)" }}>
                  Audit Proof: {erasureSuccess.verification_token}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-sub)", lineHeight: 1.5 }}>
                  To confirm permanent deletion, please enter the confirmation phrase exactly as displayed below:
                </p>

                <div style={{ padding: "8px 12px", borderRadius: "4px", background: "rgba(225, 29, 72, 0.12)", border: "1px solid rgba(225, 29, 72, 0.3)", fontFamily: "var(--font-mono)", fontSize: "12.5px", color: "#fda4af", fontWeight: 700, textAlign: "center", userSelect: "all" }}>
                  DELETE MY PERSONAL DATA PERMANENTLY
                </div>

                <input
                  type="text"
                  value={confirmationPhrase}
                  onChange={(e) => setConfirmationPhrase(e.target.value)}
                  placeholder="Type confirmation phrase here..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    fontSize: "13px",
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                  }}
                />

                {erasureError && (
                  <div style={{ fontSize: "12px", color: "#f43f5e", fontWeight: 600 }}>
                    {erasureError}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
                  <Button variant="secondary" size="sm" onClick={() => setShowErasureModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleExecuteErasure}
                    disabled={erasing || confirmationPhrase.trim() !== "DELETE MY PERSONAL DATA PERMANENTLY"}
                    icon={<Trash2 size={13} />}
                  >
                    {erasing ? "Purging Records..." : "Permanently Delete"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
