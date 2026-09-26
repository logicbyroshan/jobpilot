# Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules, 2025
## Technical Compliance & Data Governance Specification

---

## 1. Executive Summary & Project Classification

**JobPilot** is an AI-powered Career Operating System providing professional identity modeling, verified skill graph synthesis, opportunity fit matching, guided learning, competency proving, and governed autonomous application tailoring.

### Legal Classification
- **Primary Legal Role**: **Data Fiduciary** (Sections 2(i), 4, and 8 of the DPDP Act, 2023). JobPilot determines the purpose and means of processing personal data for career analytics, competency scoring, resume generation, and job applications.
- **Third-Party Integrations**: External services (GitHub, LinkedIn, Google Identity Services, OpenAI/Anthropic LLM API) operate as **Data Processors / Sub-Processors** governed under Section 8(2) and contractual data processing safeguards.
- **Children's Data Assessment**: Under Section 9 of the DPDP Act, any user under 18 years is classified as a child. An affirmative Age Gate is enforced at registration. If a user is under 18, Verifiable Parental Consent (VPC) is initiated, and behavioral tracking, profiling, and targeted job ads are strictly prohibited.
- **Significant Data Fiduciary (SDF) Assessment**: JobPilot maintains technical architecture readiness for SDF designation (including DPO contact channels, periodic DPIA frameworks, and Board compliance logging).

---

## 2. Personal Data Inventory & Classification Matrix

| Data Category | Specific Purpose | Storage Location | Processors Involved | Retention Period | Deletion Mechanism | Statutory Legal Basis |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication & Credentials** | Account identity, login, session security | Encrypted SQL (`users`) | Google Identity (if SSO) | Active account + 30 days | Cascading permanent SQL purge | Section 6 Consent & Section 4 Lawful Basis |
| **Professional Identity & Graph** | Headline, bio, experience level, living portfolio | Encrypted SQL (`professional_identities`) | Internal Graph Engine | Active account lifecycle | Cascading permanent SQL purge | Section 6 Consent (Core Essential) |
| **Work History & Projects** | Competency scoring, multi-fit algorithm | Encrypted SQL (`experiences`, `projects`) | LinkedIn API / Resume Parser | Active account lifecycle | Cascading permanent SQL purge | Section 6 Consent (Core Essential) |
| **Provenance Evidence & Signals** | Verification of technical skills & repositories | Encrypted SQL (`evidence`, `skills`) | GitHub OAuth Connector | Active account lifecycle | Cascading permanent SQL purge | Section 6 Consent (Core Essential) |
| **Tailored Resumes & Artifacts** | Job application packages & cover letters | Encrypted SQL (`application_artifacts`) | OpenAI / Anthropic (Zero-Retention) | 180 days post application | Automated retention pruning / User delete | Section 6 Consent (Optional Purpose) |
| **Auto-Apply Execution Logs** | Job portal submission telemetry | Encrypted SQL (`applications`) | External Job Portals | 180 days post submission | Automated retention pruning / User delete | Section 6 Consent (Optional Purpose) |
| **Privacy Grievances** | Statutory dispute resolution (<=90d SLA) | Encrypted SQL (`dpdp_privacy_grievances`)| DPO Grievance Desk | 730 days (Statutory) | Anonymized compliance metrics | Section 13 & DPDP Rules 2025 |
| **Consent Audit Records** | Immutable proof of affirmative consent/withdrawal | Encrypted SQL (`dpdp_consent_records`) | Internal Consent Ledger | Indefinite audit trail | Cryptographic hash audit retention | Section 6 & DPDP Rules 2025 |

---

## 3. Core Technical Implementations

### A. Notice Architecture (Section 5)
- Served via API at `GET /api/v1/privacy/notice` and rendered at `/privacy`.
- Itemised descriptions of all 5 discrete processing purposes (`CORE_CAREER_OPERATING_SYSTEM`, `AI_RESUME_TAILORING_AUTONOMY`, `AUTO_APPLY_EXECUTION`, `TELEMETRY_AND_ANALYTICS`, `COMMUNICATIONS_AND_ALERTS`).
- Multilingual accessibility supporting English and 8th Schedule constitutional Indian languages.
- Prominent Data Protection Officer (`dpo@jobpilot.dev`) and Data Protection Board of India (`https://dpbi.gov.in`) contact and escalation details.

### B. Consent Ledger & Reactive Withdrawal (Section 6)
- **Immutable Consent Ledger** (`dpdp_consent_records` table) capturing:
  - `user_id`, `purpose_id`, `status` (`GRANTED` / `WITHDRAWN`), `notice_version`, `consent_method`, `ip_hash`, `granted_at`, `withdrawn_at`.
- **Reactive Downstream Enforcement**: Withdrawing consent for `AUTO_APPLY_EXECUTION` immediately updates `ApplicationPolicy.is_auto_apply_enabled = False` and switches mode to `MANUAL`.
- Live Consent Center at `/settings/privacy` allowing instant granular toggle for each purpose.

### C. Data Principal Rights Suite (Sections 11 - 14)
1. **Right to Access Information (Section 11)**:
   - Summary endpoint: `GET /api/v1/privacy/summary`.
   - Full Machine-Readable JSON Export: `GET /api/v1/privacy/export`.
2. **Right to Correction & Updating (Section 12)**:
   - Self-service living portfolio, experience, and project update workflows.
3. **Right to Erasure / Right to be Forgotten (Section 12)**:
   - Endpoint: `POST /api/v1/privacy/erasure`.
   - Requires exact confirmation phrase `"DELETE MY PERSONAL DATA PERMANENTLY"`.
   - Cascading relational purge across all tables: `users`, `identities`, `experiences`, `projects`, `evidence`, `skills`, `applications`, `artifacts`, `grievances`, `nominations`, `consents`.
   - Records an immutable anonymized proof in `DataErasureAudit`.
4. **Right of Grievance Redressal (Section 13)**:
   - Endpoint: `POST /api/v1/privacy/grievances`.
   - Generates unique ticket ID (`DPDP-GRV-XXXXXX`).
   - Automatically computes statutory SLA deadline (Submission date + 90 days max per DPDP Rules 2025) and tracks remaining days in real time.
5. **Right to Nominate Representative (Section 14)**:
   - Endpoint: `GET|POST|DELETE /api/v1/privacy/nomination`.
   - Allows Data Principal to designate an individual (spouse, parent, child, legal representative) to exercise rights in case of death or incapacity.

### D. Verifiable Parental Consent (Section 9)
- Minor user flow with age gate at registration.
- Verifiable Parental Consent (VPC) token generation (`POST /api/v1/privacy/parental-consent/initiate` and `verify`).
- Blockage of behavioral profiling and auto-targeted advertising for minors.

### E. Reasonable Security Safeguards & Log Sanitization (Section 8(5))
- **Security Headers Middleware**: Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- **PII Log Sanitizer**: `StructuredJSONFormatter` scrubs Bearer tokens, passwords, API keys, email addresses, phone numbers, and identity numbers from all server logs.
- **Cryptographic Vault**: `SecretVault` HMAC-SHA256 authenticated encryption for all OAuth access and refresh tokens.

### F. Retention Engine & Scheduled Pruning (Section 8(7))
- Endpoint `GET /api/v1/privacy/retention` evaluates active retention policies and prunes expired verification tokens and transient records.

---

## 4. Verification & Automated Test Coverage

The implementation includes 43 automated backend test cases and full Next.js static and dynamic page builds:
- `test_dpdp_notice_and_processors_endpoints`: Section 5 itemised notice & processors registry.
- `test_user_consent_lifecycle_and_withdrawal`: Section 6 consent ledger, batch toggles, and auto-apply disabling.
- `test_data_access_summary_and_export`: Section 11 SAR summary & JSON export archive.
- `test_privacy_grievance_workflow_and_sla`: Section 13 grievance ticket & 90-day SLA computation.
- `test_nomination_lifecycle`: Section 14 nominee designation, retrieval, and revocation.
- `test_children_age_gate_and_parental_consent`: Section 9 VPC minor flow.
- `test_security_headers_enforcement`: HTTP security headers.
- `test_retention_policy_and_breach_incident`: Section 8(7) retention engine & Section 8(6) incident logging.
- `test_data_erasure_workflow`: Section 12 irreversible cascading erasure and audit token generation.
- `test_registration_requires_affirmative_dpdp_consent`: Adversarial test for affirmative consent gate.
- `test_minor_registration_initiates_parental_flow`: Minor onboarding protection.
- `test_log_sanitizer_redacts_sensitive_tokens_and_pii`: Structured logger PII sanitization.
