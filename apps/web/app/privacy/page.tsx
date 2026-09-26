'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { privacyApi, DPDPNotice, ProcessorRegistry } from '@/lib/privacy-api';

export default function PrivacyNoticePage() {
  const [notice, setNotice] = useState<DPDPNotice | null>(null);
  const [processors, setProcessors] = useState<ProcessorRegistry | null>(null);
  const [selectedLang, setSelectedLang] = useState('English');
  const [activeTab, setActiveTab] = useState<'notice' | 'purposes' | 'rights' | 'processors'>('notice');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Top Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                JP
              </div>
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                JobPilot
              </span>
            </Link>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-700/40 px-2.5 py-0.5 rounded-full text-xs font-medium text-indigo-300">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              DPDP Act 2023 & Rules 2025
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector (8th Schedule) */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                {notice?.supported_languages?.map((lang) => (
                  <option key={lang} value={lang} className="bg-slate-900 text-slate-100">
                    {lang}
                  </option>
                )) || <option value="English">English</option>}
              </select>
            </div>

            <Link
              href="/settings/privacy"
              className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20"
            >
              Privacy & Rights Center
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-10 border-b border-slate-800/50 bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-emerald-400 text-xs font-medium mb-4">
              <CheckCircle className="w-3.5 h-3.5" />
              Official Itemised Privacy Notice (Section 5, DPDP Act 2023)
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Digital Personal Data Protection & Governance
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              JobPilot operates as a <strong>Data Fiduciary</strong> committed to strict purpose limitation,
              data minimisation, affirmative consent, and transparent Data Principal rights under the
              Digital Personal Data Protection Act, 2023 (DPDP Act) and Digital Personal Data Protection Rules, 2025.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'notice', label: '1. Notice Baseline & DPO', icon: FileText },
              { id: 'purposes', label: '2. Itemised Purposes', icon: Lock },
              { id: 'rights', label: '3. Data Principal Rights', icon: Scale },
              { id: 'processors', label: '4. Third-Party Processors', icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Tab 1: Notice Baseline & DPO */}
        {activeTab === 'notice' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">Data Fiduciary Role</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  JobPilot Technologies Private Limited determines the purposes and means of processing personal data for career graph modeling and application tailoring.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
                  Notice Version: <span className="text-slate-300 font-mono">{notice?.notice_version || 'v1.0-dpdp-2025'}</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">Data Protection Officer</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Direct designated contact for all personal data queries, consent withdrawal, and rights execution.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">Email: <a href="mailto:dpo@jobpilot.dev" className="text-indigo-400 hover:underline">dpo@jobpilot.dev</a></div>
                  <div className="text-slate-400">Grievance: <a href="mailto:grievance@jobpilot.dev" className="text-indigo-400 hover:underline">grievance@jobpilot.dev</a></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Scale className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">Appellate Authority</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  If unsatisfied with internal grievance redressal, Data Principals may lodge a complaint with the Data Protection Board of India.
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs">
                  <a
                    href="https://dpbi.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    Data Protection Board of India Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Core Legal Principles */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white">Governing Principles of Data Processing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-indigo-300 block mb-1">1. Lawful & Transparent Processing (Section 4)</strong>
                  Personal data is processed solely on the basis of free, specific, informed, and unambiguous affirmative consent or legitimate uses recognized by law.
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-indigo-300 block mb-1">2. Purpose Limitation (Section 8)</strong>
                  Data collected for career modeling is strictly isolated and never repurposed for unauthorized advertising, dark patterns, or external resale.
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-indigo-300 block mb-1">3. Verifiable Children Protection (Section 9)</strong>
                  Under DPDP Act, minors (&lt;18) require Verifiable Parental Consent (VPC). Targeted advertising and behavioral tracking of minors are strictly blocked.
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <strong className="text-indigo-300 block mb-1">4. Reasonable Security Safeguards (Section 8(5))</strong>
                  End-to-end encryption in transit (TLS 1.3), encryption at rest (AES-256), cryptographic OAuth token vault, and strict PII log sanitization.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Itemised Purposes */}
        {activeTab === 'purposes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Itemised Data Processing Purposes</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Section 5 of DPDP Act mandates an itemised description of personal data collected and specified purposes.
                </p>
              </div>
              <Link
                href="/settings/privacy"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
              >
                Manage My Consent <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {notice?.purposes?.map((purpose) => (
                <div
                  key={purpose.purpose_id}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{purpose.purpose_name}</h3>
                      {purpose.is_essential ? (
                        <span className="bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                          Essential
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-300 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                          Optional (Withdrawable)
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      Retention: {purpose.retention_period_days} Days
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 mb-4">{purpose.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Data Categories Collected:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {purpose.data_categories_collected.map((cat) => (
                          <span key={cat} className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Processors Involved:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {purpose.third_party_processors.map((proc) => (
                          <span key={proc} className="bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 px-2 py-0.5 rounded text-[11px]">
                            {proc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Data Principal Rights */}
        {activeTab === 'rights' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Data Principal Rights (Sections 11 - 14)</h2>
              <p className="text-sm text-slate-400 mt-1">
                You have enforceable statutory rights under the DPDP Act 2023. You can exercise these in the Privacy Center.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                  <Eye className="w-4 h-4" />
                  <h3>1. Right to Access Information (Section 11)</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Request a category summary of all personal data held about you, the identities of all third parties with whom data is shared, and download a complete machine-readable JSON export.
                </p>
                <div className="pt-2">
                  <Link href="/settings/privacy" className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1">
                    Download My Data Archive <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <RefreshCw className="w-4 h-4" />
                  <h3>2. Right to Correction & Updating (Section 12)</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Correct inaccurate personal data, complete incomplete information, and update obsolete experience or repository records in your career competency graph.
                </p>
                <div className="pt-2">
                  <Link href="/know" className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1">
                    Update Profile & Living Portfolio <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <h3>3. Right to Erasure / To be Forgotten (Section 12)</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Permanently purge your entire account, profile, evidence graph, job applications, and tailored artifacts across all active databases and cached systems.
                </p>
                <div className="pt-2">
                  <Link href="/settings/privacy" className="text-xs text-rose-400 hover:underline inline-flex items-center gap-1">
                    Go to Account Erasure Workflow <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <HelpCircle className="w-4 h-4" />
                  <h3>4. Right of Grievance Redressal (Section 13)</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Submit privacy complaints directly to our designated DPO with an immutable ticket ID and a statutory 90-day SLA resolution countdown.
                </p>
                <div className="pt-2">
                  <Link href="/settings/privacy" className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1">
                    File Privacy Grievance Ticket <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <UserCheck className="w-4 h-4" />
                  <h3>5. Right to Nominate Representative (Section 14)</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Designate an individual (spouse, parent, child, legal representative) who shall exercise your Data Principal rights under the DPDP Act in the event of death or incapacity.
                </p>
                <div className="pt-2">
                  <Link href="/settings/privacy" className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1">
                    Manage Nominee Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Third-Party Processors */}
        {activeTab === 'processors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Third-Party Data Processors & Sub-Processors</h2>
              <p className="text-sm text-slate-400 mt-1">
                Transparency registry of external entities that process personal data on behalf of JobPilot under Section 8(2).
              </p>
            </div>

            <div className="space-y-4">
              {processors?.processors?.map((proc) => (
                <div
                  key={proc.processor_name}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-semibold text-white">{proc.processor_name}</h3>
                      <span className="text-xs text-slate-400">{proc.entity_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">
                        {proc.hosting_location}
                      </span>
                      {proc.cross_border_transfer && (
                        <span className="bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Cross-Border Transfer
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300">{proc.purpose}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Categories Processed:</span>
                      <div className="flex flex-wrap gap-1">
                        {proc.personal_data_categories_processed.map((c) => (
                          <span key={c} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Safeguards & Governance:</span>
                      <span className="text-slate-300">{proc.safeguards_and_dpa}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
