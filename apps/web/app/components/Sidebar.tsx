"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  Layers,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { UserProfile, CareerGoal } from "@/lib/types";
import { Badge } from "./ui/Badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  tag?: string;
  badgeVariant?: "brand" | "neutral" | "success" | "warning" | "cyan" | "purple";
}

const lifecycleItems: NavItem[] = [
  {
    name: "Overview",
    href: "/",
    icon: Compass,
  },
  {
    name: "Skills & Profile",
    href: "/know",
    icon: UserCheck,
    tag: "Verified",
    badgeVariant: "neutral",
  },
  {
    name: "Opportunities",
    href: "/opportunities",
    icon: Target,
    tag: "94% Fit",
    badgeVariant: "cyan",
  },
  {
    name: "Learning Plan",
    href: "/improve",
    icon: BookOpen,
    tag: "Tasks",
    badgeVariant: "neutral",
  },
  {
    name: "Assessments",
    href: "/prove",
    icon: Award,
    tag: "Ready",
    badgeVariant: "neutral",
  },
  {
    name: "Applications",
    href: "/applications",
    icon: Send,
    tag: "2 Active",
    badgeVariant: "neutral",
  },
  {
    name: "Analytics",
    href: "/outcomes",
    icon: TrendingUp,
    tag: "1 Offer",
    badgeVariant: "success",
  },
];

const secondaryItems: NavItem[] = [
  {
    name: "Data Sources",
    href: "/sources",
    icon: FolderGit2,
    tag: "4 Active",
    badgeVariant: "neutral",
  },
  {
    name: "Automation",
    href: "/settings/automation",
    icon: Sliders,
  },
  {
    name: "Privacy Center",
    href: "/settings/privacy",
    icon: Shield,
    tag: "DPDP",
    badgeVariant: "brand",
  },
];


export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState<CareerGoal | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const [profData, goalData] = await Promise.all([
          api.getProfile(),
          api.getCareerGoal(),
        ]);
        setProfile(profData);
        setGoal(goalData);
      } catch (err) {
        console.error("Failed to load user info in sidebar", err);
      }
    }
    fetchUserData();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="sidebar">
      {/* Brand Header — 54px height matching topbar */}
      <div
        style={{
          height: "54px",
          padding: "0 16px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              flexShrink: 0,
            }}
          >
            <img
              src="/logo-dark.png"
              alt="JobPilot"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "1px", lineHeight: 1.2 }}>
              <span style={{ color: "var(--text-main)" }}>Job</span>
              <span style={{ color: "var(--accent-primary)" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Career OS
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-dim)",
            padding: "4px 10px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Career Journey</span>
          <span style={{ fontSize: "9.5px", color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "var(--accent-emerald)" }} />
            Active
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {lifecycleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/opportunities" && (pathname === "/match" || pathname.startsWith("/opportunities"))) ||
              (item.href === "/gaps" && (pathname === "/gap" || pathname.startsWith("/gaps"))) ||
              (item.href === "/applications" && (pathname === "/apply" || pathname.startsWith("/applications"))) ||
              (item.href === "/outcomes" && (pathname === "/outcome" || pathname.startsWith("/outcomes")));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#ffffff" : "var(--text-sub)",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  borderLeft: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon
                    size={16}
                    color={isActive ? "var(--accent-primary)" : "var(--text-muted)"}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background: isActive ? "rgba(225, 29, 72, 0.18)" : "rgba(255, 255, 255, 0.05)",
                      color: isActive ? "#fda4af" : "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ margin: "14px 10px", height: "1px", background: "var(--border-subtle)" }} />

        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-dim)",
            padding: "4px 12px 6px",
          }}
        >
          Platform & Data
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13.5px",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#ffffff" : "var(--text-sub)",
                  background: isActive ? "var(--bg-elevated)" : "transparent",
                  borderLeft: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon
                    size={16}
                    color={isActive ? "var(--accent-primary)" : "var(--text-muted)"}
                    style={{ flexShrink: 0 }}
                  />
                  <span>{item.name}</span>
                </div>
                {item.tag && (
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Target Role & Profile Footer Card */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: "1px solid var(--border-subtle)",
          background: "rgba(255, 255, 255, 0.01)",
        }}
      >
        <Link href="/know" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                background: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              {getInitials(profile?.full_name || user?.full_name || "Alex Chen")}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile?.full_name || user?.full_name || "Alex Chen"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--accent-cyan)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
              {goal?.target_role || profile?.headline?.split("•")[0]?.trim() || "Senior Backend Engineer"}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
