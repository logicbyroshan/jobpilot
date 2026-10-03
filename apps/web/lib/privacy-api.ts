/**
 * Type-Safe DPDP Act 2023 & DPDP Rules 2025 Privacy API Client
 */

export interface ProcessingPurposeInfo {
  purpose_id: string;
  purpose_name: string;
  description: string;
  is_essential: boolean;
  data_categories_collected: string[];
  retention_period_days: number;
  third_party_processors: string[];
}

export interface DPDPNotice {
  notice_version: string;
  published_date: string;
  organization_name: string;
  fiduciary_role: string;
  dpo_name?: string;
  dpo_email?: string;
  grievance_email: string;
  board_name: string;
  board_portal_url: string;
  purposes: ProcessingPurposeInfo[];
  available_rights: string[];
  supported_languages: string[];
  last_updated: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  purpose_id: string;
  purpose_name: string;
  status: 'GRANTED' | 'WITHDRAWN' | 'EXPIRED';
  notice_version: string;
  consent_method: string;
  granted_at: string;
  withdrawn_at?: string;
  withdrawal_reason?: string;
}

export interface UserConsentOverview {
  user_id: string;
  active_consents: ConsentRecord[];
  all_available_purposes: ProcessingPurposeInfo[];
  last_updated: string;
}

export interface DataCategorySummary {
  category_name: string;
  description: string;
  record_count: number;
  storage_location: string;
  processors_involved: string[];
}

export interface DataAccessSummary {
  user_id: string;
  data_principal_name: string;
  email: string;
  account_created_at: string;
  categories: DataCategorySummary[];
  active_consent_purposes: string[];
  connected_integrations: string[];
  last_login?: string;
}

export interface Grievance {
  id: string;
  ticket_id: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'REJECTED';
  submitted_at: string;
  statutory_deadline: string;
  days_remaining: number;
  assigned_officer?: string;
  resolution_notes?: string;
  resolved_at?: string;
  escalated_to_board: boolean;
  audit_trail: Array<{
    timestamp: string;
    action: string;
    actor: string;
    notes: string;
  }>;
}

export interface Nomination {
  id: string;
  user_id: string;
  nominee_full_name: string;
  nominee_email: string;
  nominee_phone?: string;
  relationship: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessorItem {
  processor_name: string;
  entity_type: string;
  purpose: string;
  personal_data_categories_processed: string[];
  hosting_location: string;
  safeguards_and_dpa: string;
  cross_border_transfer: boolean;
}

export interface ProcessorRegistry {
  fiduciary_name: string;
  processors: ProcessorItem[];
  total_processors_count: number;
}

export interface RetentionRule {
  data_category: string;
  purpose: string;
  retention_period_days: number;
  legal_justification: string;
  action_on_expiry: string;
}

export interface RetentionStatus {
  evaluated_at: string;
  total_rules_active: number;
  rules: RetentionRule[];
  expired_records_pruned_last_run: number;
  status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('jobpilot_token') || localStorage.getItem('jobpilot_auth_token') || 'demo-token';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const privacyApi = {
  async getNotice(): Promise<DPDPNotice> {
    const res = await fetch(`${API_BASE}/privacy/notice`);
    if (!res.ok) throw new Error('Failed to load DPDP Privacy Notice');
    return res.json();
  },

  async getProcessors(): Promise<ProcessorRegistry> {
    const res = await fetch(`${API_BASE}/privacy/processors`);
    if (!res.ok) throw new Error('Failed to load processor registry');
    return res.json();
  },

  async getConsentOverview(): Promise<UserConsentOverview> {
    const res = await fetch(`${API_BASE}/privacy/consent`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load user consent preferences');
    return res.json();
  },

  async updateConsentBatch(consents: Array<{ purpose_id: string; granted: boolean }>): Promise<ConsentRecord[]> {
    const res = await fetch(`${API_BASE}/privacy/consent`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        consents,
        notice_version: 'v1.0-dpdp-2025',
        method: 'SETTINGS_TOGGLE',
      }),
    });
    if (!res.ok) throw new Error('Failed to update consent preferences');
    return res.json();
  },

  async withdrawConsent(purpose_id: string, reason?: string): Promise<ConsentRecord> {
    const res = await fetch(`${API_BASE}/privacy/consent/withdraw`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ purpose_id, reason }),
    });
    if (!res.ok) throw new Error('Failed to withdraw consent');
    return res.json();
  },

  async getDataAccessSummary(): Promise<DataAccessSummary> {
    const res = await fetch(`${API_BASE}/privacy/summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load data access summary');
    return res.json();
  },

  async exportFullUserData(): Promise<any> {
    const res = await fetch(`${API_BASE}/privacy/export`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate full data export');
    return res.json();
  },

  async executeDataErasure(confirmation_phrase: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/privacy/erasure`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ confirmation_phrase, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error?.message || 'Data erasure failed. Confirmation phrase must match exactly.');
    }
    return res.json();
  },

  async listGrievances(): Promise<Grievance[]> {
    const res = await fetch(`${API_BASE}/privacy/grievances`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load grievances');
    return res.json();
  },

  async createGrievance(category: string, subject: string, description: string): Promise<Grievance> {
    const res = await fetch(`${API_BASE}/privacy/grievances`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ category, subject, description }),
    });
    if (!res.ok) throw new Error('Failed to submit grievance');
    return res.json();
  },

  async getNomination(): Promise<Nomination | null> {
    const res = await fetch(`${API_BASE}/privacy/nomination`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async setNomination(data: {
    nominee_full_name: string;
    nominee_email: string;
    nominee_phone?: string;
    relationship: string;
    notes?: string;
  }): Promise<Nomination> {
    const res = await fetch(`${API_BASE}/privacy/nomination`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save nominee');
    return res.json();
  },

  async deleteNomination(): Promise<any> {
    const res = await fetch(`${API_BASE}/privacy/nomination`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to revoke nomination');
    return res.json();
  },

  async getRetentionStatus(): Promise<RetentionStatus> {
    const res = await fetch(`${API_BASE}/privacy/retention`);
    if (!res.ok) throw new Error('Failed to load retention status');
    return res.json();
  },
};
