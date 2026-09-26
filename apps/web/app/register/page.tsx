"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { User, Mail, Lock, Briefcase, Github, Linkedin } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, loginWithGitHub, loginWithLinkedIn } = useAuth();

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdult, setIsAdult] = useState(true);
  const [consentAgreed, setConsentAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Handle GitHub/LinkedIn OAuth Callback code
  useEffect(() => {
    const code = searchParams?.get("code");
    const error = searchParams?.get("error");

    if (error) {
      setErrorMessage(`Authentication canceled or failed: ${error}`);
      return;
    }

    if (code) {
      setIsLoading(true);
      loginWithGitHub(code).then((res) => {
        setIsLoading(false);
        if (res.success) {
          router.push("/");
        } else {
          setErrorMessage(res.error || "Failed to complete GitHub registration.");
        }
      });
    }
  }, [searchParams, loginWithGitHub, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await register(
      email,
      password,
      fullName,
      headline || "Software Engineer"
    );

    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Registration failed. Please try again.");
    }
  };

  const handleGitHubSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const authData = await api.getGitHubAuthorizeUrl();
      if (authData?.client_id_configured && authData.authorization_url) {
        window.location.href = authData.authorization_url;
        return;
      }
    } catch (e) {
      console.warn("Using local GitHub profile signup", e);
    }

    const res = await loginWithGitHub();
    setIsLoading(false);
    if (res.success) {
      router.push("/");
    }
  };

  const handleLinkedInSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginWithLinkedIn();
    setIsLoading(false);
    if (res.success) {
      router.push("/");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "440px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "8px",
              background: "#131929",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px",
            }}
          >
            <img src="/logo-dark.png" alt="JobPilot" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 800, fontSize: "17px", letterSpacing: "-0.02em" }}>
              <span style={{ color: "#f8fafc" }}>Job</span>
              <span style={{ color: "var(--accent-primary)" }}>Pilot</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Career OS
            </div>
          </div>
        </Link>
        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px", color: "var(--text-main)" }}>Create your account</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Join the closed-loop autonomous career platform
        </p>
      </div>

      {/* Auth Card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(225, 29, 72, 0.1)",
              border: "1px solid rgba(225, 29, 72, 0.25)",
              color: "#fda4af",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* 2 Primary Social OAuth Providers: GitHub & LinkedIn */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
          {/* GitHub OAuth */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleGitHubSignUp}
            disabled={isLoading}
            style={{ width: "100%", justifyContent: "center", height: "40px" }}
            icon={<Github size={16} color="#ffffff" />}
          >
            Sign up with GitHub
          </Button>

          {/* LinkedIn OAuth */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleLinkedInSignUp}
            disabled={isLoading}
            style={{ width: "100%", justifyContent: "center", height: "40px" }}
            icon={<Linkedin size={16} color="#0a66c2" />}
          >
            Sign up with LinkedIn
          </Button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            or with email
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Chen"
            leftIcon={<User size={15} />}
            required
          />

          <Input
            label="Target Role or Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Staff Systems Architect"
            leftIcon={<Briefcase size={15} />}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.chen@example.com"
            leftIcon={<Mail size={15} />}
            required
          />

          <Input
            label="Password (min. 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock size={15} />}
            required
          />

          {/* DPDP Act 2023 Age Gate & Affirmative Consent */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px", padding: "10px", borderRadius: "var(--radius-sm)", background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              <input
                type="checkbox"
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "var(--accent-primary)" }}
              />
              <span>
                I confirm that I am <strong>18 years of age or older</strong> (DPDP Act 2023 Section 9 Age Verification).
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              <input
                type="checkbox"
                required
                checked={consentAgreed}
                onChange={(e) => setConsentAgreed(e.target.checked)}
                style={{ marginTop: "2px", accentColor: "var(--accent-primary)" }}
              />
              <span>
                I have read and affirmatively consent to the processing of my personal data in accordance with the{" "}
                <Link href="/privacy" target="_blank" style={{ color: "var(--accent-primary)", textDecoration: "underline" }}>
                  DPDP Privacy Notice
                </Link>.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!consentAgreed}
            style={{ width: "100%", marginTop: "4px" }}
          >
            Create Account
          </Button>
        </form>
      </div>


      {/* Footer Link */}
      <div style={{ textAlign: "center", marginTop: "18px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
        </span>
        <Link
          href="/login"
          style={{ fontSize: "13px", color: "var(--text-main)", fontWeight: 600, textDecoration: "underline" }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
