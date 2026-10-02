"use client";

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Github,
  Linkedin,
  FileText,
  Globe,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Plus,
  X,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { SourceItem } from "@/lib/types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useToast } from "@/lib/toast-context";

export default function SourcesPage() {
  const { showToast } = useToast();
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Add Source Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<"github" | "linkedin" | "portfolio" | "resume">("github");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceDisplayName, setSourceDisplayName] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    async function loadSources() {
      try {
        const data = await api.getSources();
        setSources(data);
      } catch (err) {
        console.error("Failed to load sources:", err);
      }
    }
    loadSources();
  }, []);

  const handleSyncSource = async (id: string, name: string) => {
    setSyncingId(id);
    try {
      await api.syncSource(id);
      const updated = await api.getSources();
      setSources(updated);
      showToast(`Successfully synchronized and analyzed "${name}"!`, "success");
    } catch (err) {
      console.error("Sync error:", err);
      showToast(`Failed to sync "${name}".`, "error");
    } finally {
      setSyncingId(null);
    }
  };

  const handleConnectSource = async () => {
    if (!sourceUrl.trim()) return;
    setConnecting(true);
    try {
      await api.connectSource(sourceType, {
        source_url: sourceUrl,
        display_name: sourceDisplayName || `${sourceType.toUpperCase()} - ${sourceUrl}`,
      });
      const updated = await api.getSources();
      setSources(updated);
      setIsAddModalOpen(false);
      setSourceUrl("");
      setSourceDisplayName("");
      showToast(`Connected and indexed "${sourceUrl}" successfully!`, "success");
    } catch (err) {
      console.error("Connect source error:", err);
      showToast("Failed to connect source.", "error");
    } finally {
      setConnecting(false);
    }
  };

  const getSourceIcon = (type: string = "") => {
    const t = (type || "").toLowerCase();
    if (t.includes("github")) return <Github size={22} color="#ffffff" />;
    if (t.includes("linkedin")) return <Linkedin size={22} color="#0077b5" />;
    if (t.includes("resume")) return <FileText size={22} color="var(--cyan)" />;
    return <Globe size={22} color="var(--cyan)" />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Badge variant="neutral">Data Integrations</Badge>
            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Identity Provenance Hub</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
            Your Sources
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
            JobPilot continuously builds your professional identity graph from the trusted sources you connect.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSyncSource(sources[0]?.id || "src-1", "All Connected Sources")}
          disabled={!!syncingId}
          icon={
            <RefreshCw
              size={13}
              style={{ animation: syncingId ? "spin 0.8s linear infinite" : "none" }}
            />
          }
        >
          {syncingId ? "Ingesting..." : "Sync All Sources"}
        </Button>
      </div>

      {/* Sync Success Alert */}
      {syncNotice && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "4px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            color: "#34d399",
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Sources Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {(sources || []).map((src) => (
          <Card
            key={src.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              padding: "16px 20px",
            }}
          >
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {getSourceIcon(src.source_type)}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{src.display_name}</h3>
                  <Badge variant={src.status === "CONNECTED" ? "success" : "neutral"} size="sm">
                    {src.status}
                  </Badge>
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                  {src.source_url || "Verified document archive"} • Ingested <strong>{src.items_ingested_count || 12} items</strong> • Last synced: {new Date(src.last_synced_at || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSyncSource(src.id, src.display_name)}
                disabled={syncingId === src.id}
                icon={
                  <RefreshCw
                    size={12}
                    style={{ animation: syncingId === src.id ? "spin 0.8s linear infinite" : "none" }}
                  />
                }
              >
                {syncingId === src.id ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </Card>
        ))}

        {/* Additional Available Providers Card */}
        <Card style={{ padding: "16px 20px", background: "rgba(255, 255, 255, 0.01)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Connect Additional Portfolios & Code Platforms</div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                Import GitLab, Bitbucket, personal blogs, or patent registries.
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Custom Source
            </Button>
          </div>
        </Card>
      </div>

      {/* Connect Custom Source Modal */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
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
              maxWidth: "480px",
              background: "#0d1322",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.7)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(6, 182, 212, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)" }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc" }}>Connect Professional Source</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Extracts verifiable claims into your identity graph</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Provider Type Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Source Platform Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {[
                    { id: "github", label: "GitHub", icon: Github },
                    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
                    { id: "portfolio", label: "Website", icon: Globe },
                    { id: "resume", label: "Resume", icon: FileText },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = sourceType === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSourceType(p.id as any)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 6px",
                          borderRadius: "6px",
                          background: isSelected ? "rgba(225, 29, 72, 0.12)" : "var(--bg-input)",
                          border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                          color: isSelected ? "#ffffff" : "var(--text-sub)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Icon size={16} color={isSelected ? "var(--accent-primary)" : "var(--text-muted)"} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-sub)", display: "block", marginBottom: "6px" }}>
                  Profile URL / Repository Identifier
                </label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder={
                    sourceType === "github"
                      ? "https://github.com/your-username"
                      : sourceType === "linkedin"
                      ? "https://linkedin.com/in/your-profile"
                      : "https://your-portfolio.dev"
                  }
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
                  Display Label (Optional)
                </label>
                <input
                  type="text"
                  value={sourceDisplayName}
                  onChange={(e) => setSourceDisplayName(e.target.value)}
                  placeholder="e.g. GitHub (Primary OSS Repositories)"
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConnectSource}
                disabled={connecting || !sourceUrl.trim()}
                icon={<Check size={14} />}
              >
                {connecting ? "Indexing Source..." : "Connect & Ingest"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
