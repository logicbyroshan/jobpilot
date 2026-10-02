"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Layers,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { NotificationItem, UserProfile } from "@/lib/types";
import { SearchBar } from "./ui/SearchBar";
import { Button } from "./ui/Button";

interface TopbarProps {
  onOpenCommandPalette?: () => void;
}

export function Topbar({ onOpenCommandPalette }: TopbarProps = {}) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const prof = await api.getProfile();
        setProfile(prof);
        setNotifications(api.getNotifications());
      } catch (err) {
        console.error("Topbar data loading error", err);
      }
    }
    loadData();
  }, []);

  const getBreadcrumbs = () => {
    if (!pathname || pathname === "/") return [{ label: "Career OS", href: "/" }, { label: "Overview", href: "/" }];
    if (pathname.startsWith("/know")) return [{ label: "Career OS", href: "/" }, { label: "Know Me", href: "/know" }];
    if (pathname.startsWith("/opportunities") || pathname.startsWith("/match")) return [{ label: "Career OS", href: "/" }, { label: "Opportunities", href: "/opportunities" }];
    if (pathname.startsWith("/gaps") || pathname.startsWith("/gap")) return [{ label: "Career OS", href: "/" }, { label: "Gaps", href: "/gaps" }];
    if (pathname.startsWith("/improve")) return [{ label: "Career OS", href: "/" }, { label: "Improve", href: "/improve" }];
    if (pathname.startsWith("/prove")) return [{ label: "Career OS", href: "/" }, { label: "Prove", href: "/prove" }];
    if (pathname.startsWith("/applications") || pathname.startsWith("/apply")) return [{ label: "Career OS", href: "/" }, { label: "Applications", href: "/applications" }];
    if (pathname.startsWith("/outcomes") || pathname.startsWith("/outcome")) return [{ label: "Career OS", href: "/" }, { label: "Outcomes", href: "/outcomes" }];
    if (pathname.startsWith("/sources")) return [{ label: "Platform", href: "/" }, { label: "Sources", href: "/sources" }];
    if (pathname.startsWith("/settings")) return [{ label: "Settings", href: "/settings/automation" }, { label: "Automation Policy", href: "/settings/automation" }];
    return [{ label: "Career OS", href: "/" }];
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      {/* Left: Contextual Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.label}>
            {idx > 0 && <ChevronRight size={13} color="var(--text-dim)" />}
            <Link
              href={crumb.href}
              style={{
                color: idx === breadcrumbs.length - 1 ? "var(--text-main)" : "var(--text-dim)",
                fontWeight: idx === breadcrumbs.length - 1 ? 600 : 500,
                textDecoration: "none",
              }}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </div>

      {/* Center: Global Search */}
      <div
        style={{ flex: 1, maxWidth: "420px", margin: "0 20px", cursor: "pointer" }}
        onClick={onOpenCommandPalette}
      >
        <SearchBar
          placeholder="Search skills, opportunities, resources, evidence..."
          shortcut="⌘K"
          readOnly
          style={{ cursor: "pointer" }}
          onClick={onOpenCommandPalette}
        />
      </div>

      {/* Right: Notifications & Profile Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "4px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
              position: "relative",
            }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-primary)",
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: "0",
                width: "320px",
                padding: "8px",
                borderRadius: "6px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-lg)",
                zIndex: "var(--z-dropdown)" as any,
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700 }}>Career Action Notifications</span>
                <span style={{ fontSize: "10.5px", color: "var(--text-dim)" }}>{unreadCount} unread</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "280px", overflowY: "auto" }}>
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.action_url}
                    onClick={() => setShowNotifications(false)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "4px",
                      background: n.read ? "transparent" : "rgba(225, 29, 72, 0.06)",
                      border: "1px solid var(--border-subtle)",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)" }}>{n.title}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>{n.timestamp}</span>
                    </div>
                    <p style={{ fontSize: "11.5px", color: "var(--text-muted)", lineHeight: 1.3 }}>{n.message}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        {isAuthenticated && (profile || user) ? (
          <div style={{ position: "relative" }}>
            <div
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "3px 8px 3px 4px",
                background: "var(--bg-elevated)",
                borderRadius: "4px",
                border: "1px solid var(--border-subtle)",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              {profile?.avatar_url || user?.avatar_url ? (
                <img
                  src={profile?.avatar_url || user?.avatar_url}
                  alt={profile?.full_name || user?.full_name}
                  style={{ width: "24px", height: "24px", borderRadius: "3px", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "3px",
                    background: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  AC
                </div>
              )}
              <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{profile?.full_name || user?.full_name || "Alex Chen"}</span>
              <ChevronDown size={12} color="var(--text-dim)" />
            </div>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "38px",
                  right: "0",
                  width: "200px",
                  padding: "6px",
                  borderRadius: "6px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: "var(--z-dropdown)" as any,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <div style={{ padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "4px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700 }}>{profile?.full_name || user?.full_name || "Alex Chen"}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {profile?.email || user?.email || "alex.chen@jobpilot.dev"}
                  </div>
                </div>

                <Link
                  href="/know"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    padding: "6px 8px",
                    fontSize: "12px",
                    color: "var(--text-main)",
                    borderRadius: "4px",
                    textDecoration: "none",
                  }}
                >
                  Know Me (Identity Graph)
                </Link>

                <Link
                  href="/settings/automation"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    padding: "6px 8px",
                    fontSize: "12px",
                    color: "var(--text-main)",
                    borderRadius: "4px",
                    textDecoration: "none",
                  }}
                >
                  Automation Settings
                </Link>

                <Link
                  href="/settings/privacy"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    padding: "6px 8px",
                    fontSize: "12px",
                    color: "var(--accent-primary)",
                    borderRadius: "4px",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Privacy & DPDP Rights
                </Link>

                <div style={{ margin: "4px 0", height: "1px", background: "var(--border-subtle)" }} />


                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    width: "100%",
                    padding: "6px 8px",
                    background: "rgba(225, 29, 72, 0.08)",
                    border: "none",
                    borderRadius: "4px",
                    color: "#fda4af",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
