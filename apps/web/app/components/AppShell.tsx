"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileGate } from "./MobileGate";
import { CommandPalette } from "./CommandPalette";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    const handleOpenPalette = () => setIsPaletteOpen(true);
    window.addEventListener("open-command-palette", handleOpenPalette);
    return () => window.removeEventListener("open-command-palette", handleOpenPalette);
  }, []);

  const isStandaloneRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/landing" ||
    pathname === "/onboarding" ||
    pathname?.includes("/prove/") && pathname?.endsWith("/take");

  if (isStandaloneRoute) {
    return (
      <>
        <div className="auth-fullscreen-layout">{children}</div>
        <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
        <MobileGate />
      </>
    );
  }

  return (
    <>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Topbar onOpenCommandPalette={() => setIsPaletteOpen(true)} />
          <main className="page-body">{children}</main>
        </div>
      </div>
      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      <MobileGate />
    </>
  );
}
