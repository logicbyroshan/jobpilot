'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import {
  privacyApi,
  UserConsentOverview,
  DataAccessSummary,
  Grievance,
  Nomination,
  RetentionStatus,
} from '@/lib/privacy-api';

export default function PrivacySettingsPage() {
  const [activeTab, setActiveTab] = useState<'consent' | 'access' | 'grievances' | 'nomination' | 'erasure'>('consent');
  const [consentOverview, setConsentOverview] = useState<UserConsentOverview | null>(null);
  const [accessSummary, setDataAccessSummary] = useState<DataAccessSummary | null>(null);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [nomination, setNomination] = useState<Nomination | null>(null);
  const [retentionStatus, setRetentionStatus] = useState<RetentionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Consent form state
  const [consentState, setConsentState] = useState<Record<string, boolean>>({});
  const [savingConsent, setSavingConsent] = useState(false);
  const [consentSuccessMsg, setConsentSuccessMsg] = useState('');

  // Grievance form state
  const [grvCategory, setGrvCategory] = useState('CONSENT_WITHDRAWAL');
  const [grvSubject, setGrvSubject] = useState('');
  const [grvDescription, setGrvDescription] = useState('');
  const [submittingGrv, setSubmittingGrv] = useState(false);
  const [grvSuccessMsg, setGrvSuccessMsg] = useState('');

  // Nomination form state
  const [nomName, setNomName] = useState('');
  const [nomEmail, setNomEmail] = useState('');
  const [nomPhone, setNomPhone] = useState('');
  const [nomRel, setNomRel] = useState('SPOUSE');
  const [nomNotes, setNomNotes] = useState('');
  const [savingNom, setSavingNom] = useState(false);
  const [nomSuccessMsg, setNomSuccessMsg] = useState('');

  // Erasure modal state
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [erasureReason, setErasureReason] = useState('');
  const [erasing, setErasing] = useState(false);
  const [erasureError, setErasureError] = useState('');
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
          map[c.purpose_id] = c.status === 'GRANTED';
        });
        setConsentState(map);
      }

      if (summary) setDataAccessSummary(summary);
      if (grvs) setGrievances(grvs);
      if (nom) {
        setNomination(nom);
        setNomName(nom.nominee_full_name);
        setNomEmail(nom.nominee_email);
        setNomPhone(nom.nominee_phone || '');
        setNomRel(nom.relationship);
        setNomNotes(nom.notes || '');
      }
      if (ret) setRetentionStatus(ret);
    } finally {
      setLoading(false);
    }
  }

  const handleConsentToggle = (purposeId: string, currentVal: boolean, isEssential: boolean) => {
    if (isEssential && currentVal) {
      alert('This is an essential processing purpose required for core platform functionality. To withdraw, please use Account Erasure.');
      return;
    }
    setConsentState((prev) => ({
      ...prev,
      [purposeId]: !currentVal,
    }));
  };

  const handleSaveConsent = async () => {
    setSavingConsent(true);
    setConsentSuccessMsg('');
    try {
      const batch = Object.entries(consentState).map(([purpose_id, granted]) => ({
        purpose_id,
        granted,
      }));
      await privacyApi.updateConsentBatch(batch);
      setConsentSuccessMsg('Consent preferences updated and recorded in the DPDP Consent Ledger.');
      await loadAllData();
      setTimeout(() => setConsentSuccessMsg(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to update consent preferences');
    } finally {
      setSavingConsent(false);
    }
  };

  const handleDownloadExport = async () => {
    setExporting(true);
    try {
      const data = await privacyApi.exportFullUserData();
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(jsonBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `JobPilot_DPDP_Export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Failed to download data export');
    } finally {
      setExporting(false);
    }
  };

  const handleCreateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grvSubject || !grvDescription) return;
    setSubmittingGrv(true);
    setGrvSuccessMsg('');
    try {
      const grv = await privacyApi.createGrievance(grvCategory, grvSubject, grvDescription);
      setGrvSuccessMsg(`Grievance submitted successfully. Ticket ID: ${grv.ticket_id} (Statutory SLA: <=90 days).`);
      setGrvSubject('');
      setGrvDescription('');
      const updated = await privacyApi.listGrievances();
      setGrievances(updated);
      setTimeout(() => setGrvSuccessMsg(''), 6000);
    } catch (e: any) {
      alert(e.message || 'Failed to submit grievance');
    } finally {
      setSubmittingGrv(false);
    }
  };

  const handleSaveNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomName || !nomEmail) return;
    setSavingNom(true);
    setNomSuccessMsg('');
    try {
      const nom = await privacyApi.setNomination({
        nominee_full_name: nomName,
        nominee_email: nomEmail,
        nominee_phone: nomPhone,
        relationship: nomRel,
        notes: nomNotes,
      });
      setNomination(nom);
      setNomSuccessMsg('Nominee designated successfully under Section 14 of DPDP Act 2023.');
      setTimeout(() => setNomSuccessMsg(''), 4000);
    } catch (e: any) {
      alert(e.message || 'Failed to save nominee');
    } finally {
      setSavingNom(false);
    }
  };

  const handleRevokeNomination = async () => {
    if (!confirm('Are you sure you want to revoke this nomination?')) return;
    try {
      await privacyApi.deleteNomination();
      setNomination(null);
      setNomName('');
      setNomEmail('');
      setNomPhone('');
      setNomNotes('');
      alert('Nomination revoked.');
    } catch (e: any) {
      alert(e.message || 'Failed to revoke nomination');
    }
  };

  const handleExecuteErasure = async () => {
    setErasureError('');
    setErasing(true);
    try {
      const res = await privacyApi.executeDataErasure(confirmationPhrase, erasureReason);
      setErasureSuccess(res);
      // Clear token after a few seconds and redirect
      setTimeout(() => {
        localStorage.removeItem('jobpilot_auth_token');
        window.location.href = '/login?msg=account_erased';
      }, 5000);
    } catch (e: any) {
      setErasureError(e.message || 'Erasure failed');
    } finally {
      setErasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white text-sm">
              Dashboard
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-400">Settings</span>
            <span className="text-slate-600">/</span>
            <div className="flex items-center gap-1.5 text-white font-medium text-sm">
              <Shield className="w-4 h-4 text-indigo-400" />
              Privacy & Data Rights Center
            </div>
          </div>

          <Link
            href="/privacy"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg"
          >
            <FileText className="w-3.5 h-3.5" />
            View Official DPDP Notice
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            DPDP Act 2023 & DPDP Rules 2025
          </div>
          <h1 className="text-3xl font-bold text-white">Privacy & Data Principal Rights Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your consent choices, exercise statutory rights (Access, Correction, Erasure, Grievance, Nomination), and view your data processing inventory.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto scrollbar-none mb-8">
          {[
            { id: 'consent', label: 'Consent Preferences', icon: Lock },
            { id: 'access', label: 'Subject Access Request (SAR)', icon: Download },
            { id: 'grievances', label: 'Grievance Redressal (90-Day SLA)', icon: HelpCircle },
            { id: 'nomination', label: 'Nomination (Section 14)', icon: UserCheck },
            { id: 'erasure', label: 'Permanent Erasure', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isErasure = tab.id === 'erasure';
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? isErasure
                      ? 'bg-rose-950 text-rose-300 border border-rose-700'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Consent Preferences */}
        {activeTab === 'consent' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <strong>Affirmative & Withdrawable Consent (Section 6):</strong> You maintain complete granular control over optional processing purposes. Withdrawing consent immediately halts associated downstream processing and disables automated execution policies.
              </div>
            </div>

            {consentSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {consentSuccessMsg}
              </div>
            )}

            <div className="space-y-4">
              {consentOverview?.all_available_purposes?.map((purpose) => {
                const isGranted = consentState[purpose.purpose_id] ?? (purpose.is_essential ? true : false);
                return (
                  <div
                    key={purpose.purpose_id}
                    className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-white">{purpose.purpose_name}</h2>
                        {purpose.is_essential && (
                          <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                            Essential
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300">{purpose.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 pt-1">
                        <span>Retention: {purpose.retention_period_days} Days</span>
                        <span>•</span>
                        <span>Categories: {purpose.data_categories_collected.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleConsentToggle(purpose.purpose_id, isGranted, purpose.is_essential)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isGranted ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isGranted ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium w-16 text-right">
                        {isGranted ? (
                          <span className="text-emerald-400">Granted</span>
                        ) : (
                          <span className="text-slate-400">Withdrawn</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveConsent}
                disabled={savingConsent}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {savingConsent ? 'Saving to DPDP Ledger...' : 'Save Consent Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Subject Access Request (SAR) */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Subject Access Request (Section 11)</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Download a machine-readable JSON archive of all personal data, evidence graphs, applications, and consent logs.
                </p>
              </div>
              <button
                onClick={handleDownloadExport}
                disabled={exporting}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 shrink-0"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Generating SAR Archive...' : 'Download Full Data Export (JSON)'}
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Personal Data Inventory Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessSummary?.categories?.map((cat) => (
                  <div key={cat.category_name} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">{cat.category_name}</h3>
                      <span className="bg-slate-800 text-indigo-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                        {cat.record_count} items
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{cat.description}</p>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                      Storage: {cat.storage_location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Grievance Redressal */}
        {activeTab === 'grievances' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Submission Form */}
            <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-base text-white">File Privacy Grievance</h2>
              </div>
              <p className="text-xs text-slate-400">
                Under DPDP Rules 2025, privacy grievances are assigned a dedicated ticket ID and resolved by the DPO within a maximum 90-day statutory timeline.
              </p>

              {grvSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs">
                  {grvSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCreateGrievance} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Grievance Category</label>
                  <select
                    value={grvCategory}
                    onChange={(e) => setGrvCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CONSENT_WITHDRAWAL">Consent Withdrawal Inquiry</option>
                    <option value="DATA_ACCESS">Data Access / SAR Inquiry</option>
                    <option value="DATA_CORRECTION">Correction / Rectification</option>
                    <option value="DATA_ERASURE">Data Erasure / Deletion Query</option>
                    <option value="UNAUTHORIZED_PROCESSING">Unauthorized Processing Concern</option>
                    <option value="SECURITY_CONCERN">Security & Vulnerability Report</option>
                    <option value="OTHER">Other Privacy Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={grvSubject}
                    onChange={(e) => setGrvSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Detailed Description</label>
                  <textarea
                    required
                    rows={4}
                    value={grvDescription}
                    onChange={(e) => setGrvDescription(e.target.value)}
                    placeholder="Explain what occurred and requested remedy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingGrv}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium p-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingGrv ? 'Submitting Grievance...' : 'Submit Grievance Ticket'}
                </button>
              </form>
            </div>

            {/* Grievance List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-semibold text-white">Tracked Grievance Tickets</h2>
              {grievances.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-sm">
                  No active or past privacy grievances recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {grievances.map((g) => (
                    <div key={g.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/50 px-2.5 py-0.5 rounded-md">
                            {g.ticket_id}
                          </span>
                          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {g.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            g.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50' : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                          }`}>
                            {g.status}
                          </span>
                          {g.status !== 'RESOLVED' && (
                            <span className="text-xs text-cyan-300 font-mono flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {g.days_remaining}d remaining (SLA)
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-white">{g.subject}</h3>
                      <p className="text-xs text-slate-300">{g.description}</p>

                      {g.resolution_notes && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                          <span className="font-semibold text-indigo-400 block">DPO Resolution Response:</span>
                          <p>{g.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Representative Nomination */}
        {activeTab === 'nomination' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <UserCheck className="w-5 h-5" />
                <h2 className="text-base text-white">Right to Nominate Representative (Section 14)</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Designate a trusted individual who shall exercise your Data Principal rights under the DPDP Act in the event of death or incapacity.
              </p>

              {nomSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs">
                  {nomSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveNomination} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nominee Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={nomName}
                    onChange={(e) => setNomName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nominee Email Address</label>
                    <input
                      type="email"
                      required
                      value={nomEmail}
                      onChange={(e) => setNomEmail(e.target.value)}
                      placeholder="nominee@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nominee Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={nomPhone}
                      onChange={(e) => setNomPhone(e.target.value)}
                      placeholder="+91-9876543210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Relationship</label>
                  <select
                    value={nomRel}
                    onChange={(e) => setNomRel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SPOUSE">Spouse</option>
                    <option value="PARENT">Parent</option>
                    <option value="CHILD">Child / Descendant</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="LEGAL_GUARDIAN">Legal Guardian</option>
                    <option value="AUTHORIZED_REPRESENTATIVE">Authorized Legal Representative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Additional Notes</label>
                  <textarea
                    rows={2}
                    value={nomNotes}
                    onChange={(e) => setNomNotes(e.target.value)}
                    placeholder="Specific instructions or legal power of attorney references..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingNom}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {savingNom ? 'Saving Nominee...' : nomination ? 'Update Nominee' : 'Save Nomination'}
                  </button>

                  {nomination && (
                    <button
                      type="button"
                      onClick={handleRevokeNomination}
                      className="bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 font-medium px-4 py-2.5 rounded-lg transition-all border border-slate-700"
                    >
                      Revoke Nomination
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Data Erasure (Danger Zone) */}
        {activeTab === 'erasure' && (
          <div className="max-w-2xl space-y-6">
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-lg text-white">Permanent Account & Personal Data Erasure (Section 12)</h2>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">
                Exercising your <strong>Right to Erasure</strong> permanently purges all personal credentials, professional identity graphs, work history, projects, connected OAuth source integrations, job applications, tailored resumes, and assessment submissions.
              </p>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 text-xs text-slate-300 space-y-1">
                <span className="font-semibold text-rose-400 block">Irreversible Action:</span>
                This operation is immediate and permanent. Once completed, your credentials and evidence graph cannot be recovered.
              </div>

              <button
                onClick={() => setShowErasureModal(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-600/20"
              >
                Initiate Permanent Data Erasure
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Erasure Confirmation Modal */}
      {showErasureModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
                <AlertTriangle className="w-5 h-5" />
                Confirm Section 12 Data Erasure
              </div>
              <button
                onClick={() => setShowErasureModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {erasureSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs space-y-2">
                <div className="font-bold text-sm">Erasure Completed Successfully!</div>
                <p>{erasureSuccess.message}</p>
                <div className="font-mono text-[11px] bg-slate-950 p-2 rounded border border-emerald-800">
                  Verification Token: {erasureSuccess.verification_token}
                </div>
                <p className="text-slate-400">Redirecting to login...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-slate-300">
                  To confirm permanent and irreversible erasure of all personal data, type the following confirmation phrase exactly:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-center text-rose-400 font-bold select-all">
                  DELETE MY PERSONAL DATA PERMANENTLY
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Type Confirmation Phrase</label>
                  <input
                    type="text"
                    value={confirmationPhrase}
                    onChange={(e) => setConfirmationPhrase(e.target.value)}
                    placeholder="Type phrase here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Reason for Erasure (Optional)</label>
                  <input
                    type="text"
                    value={erasureReason}
                    onChange={(e) => setErasureReason(e.target.value)}
                    placeholder="e.g. No longer looking for roles"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>

                {erasureError && (
                  <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-300">
                    {erasureError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowErasureModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteErasure}
                    disabled={erasing || confirmationPhrase !== 'DELETE MY PERSONAL DATA PERMANENTLY'}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-600/20 disabled:opacity-40"
                  >
                    {erasing ? 'Purging Personal Data...' : 'Permanently Delete Everything'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
