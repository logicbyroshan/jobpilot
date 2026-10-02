"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Compass,
  UserCheck,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Send,
  TrendingUp,
  FolderGit2,
  Sliders,
  Shield,
  Zap,
  ArrowRight,
  CornerDownLeft,
  X,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";

interface PaletteItem {
  id: string;
  category: "Navigation" | "Opportunities" | "Quick Actions";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  badge?: string;
  badgeColor?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigationItems: PaletteItem[] = [
    {
      id: "nav-overview",
      category: "Navigation",
      title: "Overview",
      subtitle: "Dashboard & key career metrics",
      icon: Compass,
      href: "/",
    },
    {
      id: "nav-know",
      category: "Navigation",
      title: "Skills & Profile",
      subtitle: "Verified skills, portfolio, and work history",
      icon: UserCheck,
      href: "/know",
    },
    {
      id: "nav-opps",
      category: "Navigation",
      title: "Opportunities",
      subtitle: "Ranked job matches and recommendations",
      icon: Target,
      href: "/opportunities",
    },
    {
      id: "nav-gaps",
      category: "Navigation",
      title: "Skill Gaps",
      subtitle: "Identified skill deficits for target roles",
      icon: Sparkles,
      href: "/gaps",
    },
    {
      id: "nav-improve",
      category: "Navigation",
      title: "Learning Plan",
      subtitle: "Daily tasks, milestones, and study blueprints",
      icon: BookOpen,
      href: "/improve",
    },
    {
      id: "nav-prove",
      category: "Navigation",
      title: "Assessments",
      subtitle: "Skill verifications and proctored challenges",
      icon: Award,
      href: "/prove",
    },
    {
      id: "nav-apps",
      category: "Navigation",
      title: "Applications",
      subtitle: "Submissions, tailored resumes, and auto-apply queue",
      icon: Send,
      href: "/applications",
    },
    {
      id: "nav-outcomes",
      category: "Navigation",
      title: "Analytics",
      subtitle: "Application conversion rates and insights",
      icon: TrendingUp,
      href: "/outcomes",
    },
    {
      id: "nav-sources",
      category: "Navigation",
      title: "Data Sources",
      subtitle: "Connected accounts, GitHub, and resumes",
      icon: FolderGit2,
      href: "/sources",
    },
    {
      id: "nav-privacy",
      category: "Navigation",
      title: "Privacy Center",
      subtitle: "DPDP consents, data export, and privacy rights",
      icon: Shield,
      href: "/settings/privacy",
    },
    {
      id: "nav-automation",
      category: "Navigation",
      title: "Automation Settings",
      subtitle: "Auto-apply preferences and safety rules",
      icon: Sliders,
      href: "/settings/automation",
    },
  ];

  const opportunityItems: PaletteItem[] = [
    {
      id: "opp-stripe",
      category: "Opportunities",
      title: "Staff Distributed Systems Architect",
      subtitle: "Stripe • San Francisco, CA (Remote) • $240k - $310k",
      icon: Building2,
      href: "/opportunities/job-1",
      badge: "94% Fit",
      badgeColor: "#06b6d4",
    },
    {
      id: "opp-datadog",
      category: "Opportunities",
      title: "Staff Platform Infrastructure Engineer",
      subtitle: "Datadog • New York, NY (Hybrid) • $220k - $290k",
      icon: Building2,
      href: "/opportunities/job-2",
      badge: "92% Fit",
      badgeColor: "#06b6d4",
    },
    {
      id: "opp-cloudflare",
      category: "Opportunities",
      title: "Principal Storage & Consensus Architect",
      subtitle: "Cloudflare • Austin, TX (Remote) • $250k - $330k",
      icon: Building2,
      href: "/opportunities/job-3",
      badge: "88% Fit",
      badgeColor: "#f59e0b",
    },
    {
      id: "opp-openai",
      category: "Opportunities",
      title: "AI Infrastructure Systems Lead",
      subtitle: "OpenAI • San Francisco, CA • $280k - $380k",
      icon: Building2,
      href: "/opportunities/job-4",
      badge: "86% Fit",
      badgeColor: "#f59e0b",
    },
  ];

  const actionItems: PaletteItem[] = [
    {
      id: "act-recalculate",
      category: "Quick Actions",
      title: "Recalculate Opportunity Match Fit",
      subtitle: "Re-run AI vector matching across all 240+ scraped roles",
      icon: Zap,
      action: async () => {
        await api.recalculateMatches();
        router.push("/opportunities");
        onClose();
      },
      badge: "Instant",
    },
    {
      id: "act-prove",
      category: "Quick Actions",
      title: "Start Distributed Raft Verification Test",
      subtitle: "Launch proctored 20-minute timed competency assessment",
      icon: Award,
      href: "/prove/99bb5e7e-6de3-4074-91fb-4c0f6990cbb3/take",
      badge: "+1.8 Boost",
      badgeColor: "#a855f7",
    },
    {
      id: "act-plan-week",
      category: "Quick Actions",
      title: "Plan My Learning Week (AI Optimizer)",
      subtitle: "Auto-schedule top 3 blocker tasks for 10 hrs/week",
      icon: BookOpen,
      action: async () => {
        await api.planMyWeek({ available_hours_per_week: 10 });
        router.push("/improve");
        onClose();
      },
    },
    {
      id: "act-sync-github",
      category: "Quick Actions",
      title: "Sync GitHub Repositories & Commits",
      subtitle: "Extract recent commit hashes, PRs, and verified evidence",
      icon: FolderGit2,
      action: async () => {
        await api.syncSource("src-1");
        router.push("/sources");
        onClose();
      },
    },
  ];

  const allItems = [...navigationItems, ...opportunityItems, ...actionItems];

  const filteredItems = allItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleExecute = React.useCallback(
    (item: PaletteItem) => {
      if (item.action) {
        item.action();
      } else if (item.href) {
        router.push(item.href);
        onClose();
      }
    },
    [router, onClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open palette
          const event = new CustomEvent("open-command-palette");
          window.dispatchEvent(event);
        }
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          handleExecute(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose, handleExecute]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(7, 10, 18, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        animation: "pageFadeIn 0.15s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "580px",
          background: "#0d1322",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "8px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(225, 29, 72, 0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Search Bar Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            gap: "12px",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <Search size={18} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, page, role, or quick action..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f8fafc",
              fontSize: "15px",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-dim)",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-dim)", fontSize: "13.5px" }}>
              No matching commands or pages found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleExecute(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    background: isSelected ? "var(--bg-elevated)" : "transparent",
                    borderLeft: isSelected ? "2px solid var(--accent-primary)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "5px",
                        background: isSelected ? "rgba(225, 29, 72, 0.15)" : "rgba(255, 255, 255, 0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSelected ? "var(--accent-primary)" : "var(--text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "13.5px", fontWeight: isSelected ? 600 : 500, color: "#f8fafc" }}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: "11.5px",
                            color: "var(--text-dim)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: item.badgeColor ? `${item.badgeColor}22` : "rgba(255, 255, 255, 0.06)",
                          color: item.badgeColor || "var(--text-muted)",
                          border: item.badgeColor ? `1px solid ${item.badgeColor}44` : "1px solid var(--border-subtle)",
                          fontWeight: 600,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <CornerDownLeft size={13} color="var(--text-dim)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div
          style={{
            padding: "8px 14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11.5px",
            color: "var(--text-dim)",
            background: "rgba(255, 255, 255, 0.01)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span><kbd style={{ padding: "1px 4px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>↑↓</kbd> to navigate</span>
            <span><kbd style={{ padding: "1px 4px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>↵</kbd> to open</span>
            <span><kbd style={{ padding: "1px 4px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>esc</kbd> to close</span>
          </div>
          <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>JobPilot Command OS</span>
        </div>
      </div>
    </div>
  );
}
