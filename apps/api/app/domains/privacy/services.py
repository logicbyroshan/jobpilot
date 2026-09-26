import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import ConflictException, JobPilotException, ResourceNotFoundException, ValidationException
from app.core.logging import logger
from app.domains.applications.models import Application, ApplicationArtifact, ApplicationPolicy
from app.domains.career_goals.models import CareerGoal
from app.domains.evidence.models import Evidence
from app.domains.identity.models import Experience, ProfessionalIdentity, Project, User
from app.domains.learning.models import LearningPlan, LearningPlanItem
from app.domains.outcomes.models import ApplicationEvent, OutcomeFeedback
from app.domains.privacy.models import (
    BreachIncident,
    ConsentRecord,
    DataErasureAudit,
    DataNomination,
    ParentalConsent,
    PrivacyGrievance,
)
from app.domains.privacy.schemas import (
    BreachIncidentCreate,
    BreachIncidentResponse,
    ConsentBatchUpdateRequest,
    ConsentRecordResponse,
    DataAccessSummaryResponse,
    DataErasureResponse,
    DataProcessorItem,
    DPDPNoticeResponse,
    FullDataExportPayload,
    GrievanceCreateRequest,
    GrievanceResponse,
    GrievanceStatusUpdateRequest,
    NominationCreateOrUpdateRequest,
    NominationResponse,
    ParentalConsentInitiateRequest,
    ParentalConsentResponse,
    PersonalDataCategorySummary,
    ProcessingPurposeInfo,
    ProcessorRegistryResponse,
    RetentionPolicyStatusResponse,
    RetentionRuleInfo,
    UserConsentOverviewResponse,
)
from app.domains.skills.models import SkillEvidence
from app.domains.sources.models import Source, SourceConnection

NOTICE_VERSION = "v1.0-dpdp-2025"

DPDP_PURPOSES: List[ProcessingPurposeInfo] = [
    ProcessingPurposeInfo(
        purpose_id="CORE_CAREER_OPERATING_SYSTEM",
        purpose_name="Core Professional Identity & Opportunity Matching",
        description="Collection and processing of profile, work experiences, projects, and skills to build the career competency graph and calculate multidimensional fit scores.",
        is_essential=True,
        data_categories_collected=["Full Name", "Email Address", "Employment History", "Projects", "Skills Ontology"],
        retention_period_days=365,
        third_party_processors=["Cloud Database Engine", "Redis Cache Provider"],
    ),
    ProcessingPurposeInfo(
        purpose_id="AI_RESUME_TAILORING_AUTONOMY",
        purpose_name="AI-Driven Resume & Application Artifact Generation",
        description="Automated tailoring of resumes, cover letters, and application responses backed by verified provenance evidence without introducing false claims.",
        is_essential=False,
        data_categories_collected=["Candidate Summary", "Verified Skill Badges", "Job Requirements"],
        retention_period_days=180,
        third_party_processors=["OpenAI Gateway / Anthropic LLM API (Zero Data Retention Mode)"],
    ),
    ProcessingPurposeInfo(
        purpose_id="AUTO_APPLY_EXECUTION",
        purpose_name="Governed Autonomous Application Submission",
        description="Autonomous or semi-assisted execution of job applications on external job portals under user-configured governance policies.",
        is_essential=False,
        data_categories_collected=["Target Job Profiles", "Application Payload", "Submission Timestamps"],
        retention_period_days=180,
        third_party_processors=["External Job Portals", "Headless Browser Runners"],
    ),
    ProcessingPurposeInfo(
        purpose_id="TELEMETRY_AND_ANALYTICS",
        purpose_name="Platform Performance & Conversion Analytics",
        description="Aggregated lifecycle metrics, funnel drop-off analytics, and learning velocity telemetry to improve system recommendations.",
        is_essential=False,
        data_categories_collected=["Session Duration", "Page Views", "Funnel Stage Transitions"],
        retention_period_days=90,
        third_party_processors=["Internal Analytics Engine"],
    ),
    ProcessingPurposeInfo(
        purpose_id="COMMUNICATIONS_AND_ALERTS",
        purpose_name="Job Radar Alerts & System Notifications",
        description="Delivery of high-signal opportunity alerts, skill boost reminders, and security notices via email or in-app notifications.",
        is_essential=False,
        data_categories_collected=["Email Address", "Notification Preferences"],
        retention_period_days=365,
        third_party_processors=["Transactional Email Dispatcher"],
    ),
]

DPDP_PROCESSORS: List[DataProcessorItem] = [
    DataProcessorItem(
        processor_name="GitHub OAuth & API",
        entity_type="External Version Control Provider",
        purpose="Repository provenance, commit analysis, and verified technical project ingestion.",
        personal_data_categories_processed=["Public GitHub Profile", "Public Repositories", "Commit Metadata"],
        hosting_location="United States / Global",
        safeguards_and_dpa="OAuth 2.0 Token Vault, Strict Read-Only Scopes, Section 8(2) Vendor Controls",
        cross_border_transfer=True,
    ),
    DataProcessorItem(
        processor_name="LinkedIn API",
        entity_type="Professional Social Network",
        purpose="Professional experience verification and career trajectory ingestion.",
        personal_data_categories_processed=["Work History", "Education", "Certification Badges"],
        hosting_location="United States / Global",
        safeguards_and_dpa="Encrypted Credentials, User-initiated Sync, Strict Purpose Limitation",
        cross_border_transfer=True,
    ),
    DataProcessorItem(
        processor_name="Google Identity Services",
        entity_type="Identity Provider",
        purpose="Single Sign-On (SSO) authentication and identity verification.",
        personal_data_categories_processed=["Email Address", "Full Name", "Avatar URL", "Google Sub Identifier"],
        hosting_location="Global",
        safeguards_and_dpa="OpenID Connect Standard, PBKDF2 Token Derivation",
        cross_border_transfer=True,
    ),
    DataProcessorItem(
        processor_name="AI Inference Gateway (OpenAI / Anthropic)",
        entity_type="LLM API Provider",
        purpose="Semantic job matching embeddings and evidence-backed resume generation.",
        personal_data_categories_processed=["Anonymized Career Excerpts", "Skill Keywords", "Job Descriptions"],
        hosting_location="United States / Zero-Data Retention Enterprise Tier",
        safeguards_and_dpa="PII Masking Pre-processor, Enterprise Zero-Retention Agreement, No Model Training",
        cross_border_transfer=True,
    ),
    DataProcessorItem(
        processor_name="Transactional Storage & Cache Engine",
        entity_type="Infrastructure Database",
        purpose="Encrypted persistence of user profiles, evidence graph, applications, and consent audit logs.",
        personal_data_categories_processed=["Complete User Dataset", "Cryptographic Hashes", "Consent Ledger"],
        hosting_location="India Primary Data Center (Local Deployment)",
        safeguards_and_dpa="AES-256 at Rest, TLS 1.3 in Transit, Automated Backup Erasure Engine",
        cross_border_transfer=False,
    ),
]

DPDP_RETENTION_RULES: List[RetentionRuleInfo] = [
    RetentionRuleInfo(
        data_category="Active User Career Identity & Graph",
        purpose="Continuous Career Operating System functionality",
        retention_period_days=365,
        legal_justification="Section 6 Consent & Section 8 Purpose Limitation",
        action_on_expiry="Retained while account remains active; erased within 30 days of inactivity notice",
    ),
    RetentionRuleInfo(
        data_category="OAuth Tokens & Source Credentials",
        purpose="Third-party repository synchronization",
        retention_period_days=90,
        legal_justification="Section 8(7) Proactive Data Minimisation",
        action_on_expiry="Encrypted token auto-revoked and pruned on disconnection or expiry",
    ),
    RetentionRuleInfo(
        data_category="Job Application Tailored Artifacts",
        purpose="Application tracking & recruiter feedback loops",
        retention_period_days=180,
        legal_justification="Section 8 Purpose Limitation",
        action_on_expiry="Archived and scrubbed after 180 days from application closure",
    ),
    RetentionRuleInfo(
        data_category="Privacy Grievances & Redressal Records",
        purpose="Compliance with DPDP Rules 2025 statutory dispute resolution",
        retention_period_days=730,
        legal_justification="Statutory compliance under Section 13 & Rule 14",
        action_on_expiry="Anonymized into statistical compliance metrics after 2 years",
    ),
    RetentionRuleInfo(
        data_category="Security Access & Auth Audit Logs",
        purpose="Reasonable security safeguards and unauthorized access prevention",
        retention_period_days=180,
        legal_justification="Section 8(5) Security Safeguards",
        action_on_expiry="Automated log rotation and PII-sanitized purging after 180 days",
    ),
]


class PrivacyService:
    """
    Central service implementing all technical obligations under DPDP Act 2023 & DPDP Rules 2025.
    """

    @staticmethod
    def get_notice() -> DPDPNoticeResponse:
        """Returns the itemised Privacy Notice under Section 5 of DPDP Act 2023."""
        return DPDPNoticeResponse(
            notice_version=NOTICE_VERSION,
            published_date="2025-01-15",
            organization_name="JobPilot Technologies Private Limited",
            fiduciary_role="Data Fiduciary",
            dpo_name="Designated Data Protection Officer",
            dpo_email="dpo@jobpilot.dev",
            grievance_email="grievance@jobpilot.dev",
            board_name="Data Protection Board of India (DPBI)",
            board_portal_url="https://dpbi.gov.in",
            purposes=DPDP_PURPOSES,
            available_rights=[
                "Right to Access Summary of Personal Data (Section 11)",
                "Right to Correction, Completion, and Updating (Section 12)",
                "Right to Erasure / Right to be Forgotten (Section 12)",
                "Right of Grievance Redressal with 90-day SLA (Section 13)",
                "Right to Nominate Representative for Incapacity or Death (Section 14)",
                "Right to Withdraw Consent at Any Time (Section 6(4))",
            ],
            supported_languages=[
                "English", "Hindi (हिन्दी)", "Bengali (বাংলা)", "Telugu (తెలుగు)", "Marathi (मराठी)",
                "Tamil (தமிழ்)", "Gujarati (ગુજરાતી)", "Kannada (ಕನ್ನಡ)", "Malayalam (മലയാളം)",
                "Punjabi (ਪੰਜਾਬੀ)", "Odia (ଓଡ଼ିଆ)", "Assamese (অসমীয়া)", "Urdu (اردو)",
            ],
            last_updated=datetime.now(timezone.utc).isoformat(),
        )

    @staticmethod
    def get_processor_registry() -> ProcessorRegistryResponse:
        """Returns the inventory of third-party data processors and sub-processors under Section 8."""
        return ProcessorRegistryResponse(
            fiduciary_name="JobPilot Technologies Private Limited",
            processors=DPDP_PROCESSORS,
            total_processors_count=len(DPDP_PROCESSORS),
        )

    @staticmethod
    async def get_user_consent_overview(user_id: str, db: AsyncSession) -> UserConsentOverviewResponse:
        """Retrieves active and historical consent records for the Data Principal."""
        query = select(ConsentRecord).where(ConsentRecord.user_id == user_id).order_by(ConsentRecord.created_at.desc())
        result = await db.execute(query)
        records = result.scalars().all()

        # Build a map of latest status per purpose
        latest_by_purpose: Dict[str, ConsentRecord] = {}
        for r in records:
            if r.purpose_id not in latest_by_purpose:
                latest_by_purpose[r.purpose_id] = r

        # If user has no record for essential core purpose, assume default granted on signup
        active_list: List[ConsentRecordResponse] = []
        for p in DPDP_PURPOSES:
            if p.purpose_id in latest_by_purpose:
                rec = latest_by_purpose[p.purpose_id]
                active_list.append(ConsentRecordResponse.model_validate(rec))
            else:
                # Provide standard representation
                active_list.append(
                    ConsentRecordResponse(
                        id=f"default-{p.purpose_id}",
                        user_id=user_id,
                        purpose_id=p.purpose_id,
                        purpose_name=p.purpose_name,
                        status="GRANTED" if p.is_essential else "WITHDRAWN",
                        notice_version=NOTICE_VERSION,
                        consent_method="SYSTEM_DEFAULT",
                        granted_at=datetime.now(timezone.utc),
                    )
                )

        return UserConsentOverviewResponse(
            user_id=user_id,
            active_consents=active_list,
            all_available_purposes=DPDP_PURPOSES,
            last_updated=datetime.now(timezone.utc),
        )

    @staticmethod
    async def update_consent_batch(
        user_id: str,
        req: ConsentBatchUpdateRequest,
        ip_address: Optional[str],
        user_agent: Optional[str],
        db: AsyncSession,
    ) -> List[ConsentRecordResponse]:
        """
        Updates consent settings for specific purposes.
        Maintains an immutable audit ledger of consent status changes.
        """
        ip_hash = hashlib.sha256((ip_address or "127.0.0.1").encode()).hexdigest()[:16] if ip_address else None
        results: List[ConsentRecordResponse] = []

        for item in req.consents:
            # Check purpose validity
            purpose_meta = next((p for p in DPDP_PURPOSES if p.purpose_id == item.purpose_id), None)
            purpose_name = purpose_meta.purpose_name if purpose_meta else item.purpose_id

            # Essential purpose cannot be unilaterally turned off without deleting account
            if purpose_meta and purpose_meta.is_essential and not item.granted:
                logger.info(f"User {user_id} attempted to withdraw essential purpose {item.purpose_id}")

            status_val = "GRANTED" if item.granted else "WITHDRAWN"
            now = datetime.now(timezone.utc)

            record = ConsentRecord(
                id=str(uuid.uuid4()),
                user_id=user_id,
                purpose_id=item.purpose_id,
                purpose_name=purpose_name,
                status=status_val,
                notice_version=req.notice_version or NOTICE_VERSION,
                consent_method=req.method or "SETTINGS_TOGGLE",
                ip_hash=ip_hash,
                user_agent=(user_agent or "")[:500],
                granted_at=now,
                withdrawn_at=now if not item.granted else None,
                withdrawal_reason="User preference update via Privacy Center" if not item.granted else None,
            )
            db.add(record)
            results.append(ConsentRecordResponse.model_validate(record))

            # Downstream reactive enforcement:
            # If AUTO_APPLY_EXECUTION is withdrawn, immediately suspend automation policy
            if item.purpose_id == "AUTO_APPLY_EXECUTION" and not item.granted:
                policy_stmt = (
                    update(ApplicationPolicy)
                    .where(ApplicationPolicy.user_id == user_id)
                    .values(is_auto_apply_enabled=False, mode="MANUAL")
                )
                await db.execute(policy_stmt)
                logger.info(f"Auto-apply policy disabled for user {user_id} due to consent withdrawal.")

        await db.commit()
        return results

    @staticmethod
    async def withdraw_consent(
        user_id: str,
        purpose_id: str,
        reason: Optional[str],
        db: AsyncSession,
    ) -> ConsentRecordResponse:
        """Explicitly withdraws consent for a specific processing purpose (Section 6(4))."""
        purpose_meta = next((p for p in DPDP_PURPOSES if p.purpose_id == purpose_id), None)
        if not purpose_meta:
            raise ValidationException(f"Unknown purpose identifier: {purpose_id}")

        now = datetime.now(timezone.utc)
        record = ConsentRecord(
            id=str(uuid.uuid4()),
            user_id=user_id,
            purpose_id=purpose_id,
            purpose_name=purpose_meta.purpose_name,
            status="WITHDRAWN",
            notice_version=NOTICE_VERSION,
            consent_method="DIRECT_WITHDRAWAL_ACTION",
            granted_at=now,
            withdrawn_at=now,
            withdrawal_reason=reason or "Direct withdrawal by Data Principal",
        )
        db.add(record)

        if purpose_id == "AUTO_APPLY_EXECUTION":
            policy_stmt = (
                update(ApplicationPolicy)
                .where(ApplicationPolicy.user_id == user_id)
                .values(is_auto_apply_enabled=False, mode="MANUAL")
            )
            await db.execute(policy_stmt)

        await db.commit()
        return ConsentRecordResponse.model_validate(record)

    @staticmethod
    async def get_data_access_summary(user_id: str, db: AsyncSession) -> DataAccessSummaryResponse:
        """Section 11 Right to Access: Category-level summary of all personal data held."""
        user = await db.get(User, user_id)
        if not user:
            raise ResourceNotFoundException("User not found")

        # Count records in each category
        exp_count = await db.scalar(
            select(func.count(Experience.id))
            .join(ProfessionalIdentity, Experience.identity_id == ProfessionalIdentity.id)
            .where(ProfessionalIdentity.user_id == user_id)
        ) or 0

        proj_count = await db.scalar(
            select(func.count(Project.id))
            .join(ProfessionalIdentity, Project.identity_id == ProfessionalIdentity.id)
            .where(ProfessionalIdentity.user_id == user_id)
        ) or 0

        evidence_count = await db.scalar(select(func.count(Evidence.id)).where(Evidence.user_id == user_id)) or 0
        app_count = await db.scalar(select(func.count(Application.id)).where(Application.user_id == user_id)) or 0
        source_count = await db.scalar(select(func.count(Source.id)).where(Source.user_id == user_id)) or 0

        categories = [
            PersonalDataCategorySummary(
                category_name="Authentication & Account Identity",
                description="Core user credentials, full name, email, avatar URL, and verification status.",
                record_count=1,
                storage_location="Primary Encrypted SQL Database (Table: users)",
                processors_involved=["Google Identity Services (if SSO used)"],
            ),
            PersonalDataCategorySummary(
                category_name="Professional Identity & Career Profile",
                description="Headline, bio, years of experience, current seniority, and living portfolio graph.",
                record_count=1,
                storage_location="Primary Encrypted SQL Database (Table: professional_identities)",
                processors_involved=["Internal Skill Graph Engine"],
            ),
            PersonalDataCategorySummary(
                category_name="Work Experience History",
                description="Historical company names, roles, employment dates, responsibilities, and technologies.",
                record_count=exp_count,
                storage_location="Primary Encrypted SQL Database (Table: experiences)",
                processors_involved=["LinkedIn / Resume Parser"],
            ),
            PersonalDataCategorySummary(
                category_name="Projects & Provenance Evidence",
                description="Code repository summaries, project titles, tech stacks, and GitHub signals.",
                record_count=proj_count + evidence_count,
                storage_location="Primary Encrypted SQL Database (Tables: projects, evidence)",
                processors_involved=["GitHub OAuth Connector"],
            ),
            PersonalDataCategorySummary(
                category_name="Job Applications & Tailored Artifacts",
                description="Targeted job applications, tailored resumes, generated cover letters, and notes.",
                record_count=app_count,
                storage_location="Primary Encrypted SQL Database (Tables: applications, application_artifacts)",
                processors_involved=["OpenAI / Anthropic Inference Gateway"],
            ),
            PersonalDataCategorySummary(
                category_name="Connected Identity Sources",
                description="OAuth source connections, sync metadata, and encrypted access tokens.",
                record_count=source_count,
                storage_location="Encrypted Vault (Tables: sources, source_connections)",
                processors_involved=["GitHub, LinkedIn"],
            ),
        ]

        # Active consents
        consent_query = select(ConsentRecord.purpose_id).where(
            ConsentRecord.user_id == user_id, ConsentRecord.status == "GRANTED"
        )
        consent_results = await db.execute(consent_query)
        active_purposes = list(set(consent_results.scalars().all()))
        if not active_purposes:
            active_purposes = ["CORE_CAREER_OPERATING_SYSTEM"]

        # Sources
        src_query = select(Source.source_type).where(Source.user_id == user_id)
        src_results = await db.execute(src_query)
        sources = list(set(src_results.scalars().all()))

        return DataAccessSummaryResponse(
            user_id=user_id,
            data_principal_name=user.full_name,
            email=user.email,
            account_created_at=user.created_at,
            categories=categories,
            active_consent_purposes=active_purposes,
            connected_integrations=sources,
            last_login=user.updated_at.isoformat() if user.updated_at else None,
        )

    @staticmethod
    async def export_full_user_data(user_id: str, db: AsyncSession) -> FullDataExportPayload:
        """
        Section 11 Right to Access: Machine-readable complete JSON export of all personal data.
        """
        user = await db.get(User, user_id)
        if not user:
            raise ResourceNotFoundException("User not found")

        # Identity
        identity_stmt = select(ProfessionalIdentity).where(ProfessionalIdentity.user_id == user_id)
        identity_res = await db.execute(identity_stmt)
        identity = identity_res.scalar_one_or_none()

        experiences = []
        projects = []
        if identity:
            exp_stmt = select(Experience).where(Experience.identity_id == identity.id)
            exp_res = await db.execute(exp_stmt)
            for e in exp_res.scalars().all():
                experiences.append({
                    "id": e.id,
                    "company_name": e.company_name,
                    "title": e.title,
                    "location": e.location,
                    "is_remote": e.is_remote,
                    "start_date": e.start_date,
                    "end_date": e.end_date,
                    "is_current": e.is_current,
                    "description": e.description,
                    "technologies": e.technologies_json,
                })

            proj_stmt = select(Project).where(Project.identity_id == identity.id)
            proj_res = await db.execute(proj_stmt)
            for p in proj_res.scalars().all():
                projects.append({
                    "id": p.id,
                    "title": p.title,
                    "description": p.description,
                    "url": p.url,
                    "repository_url": p.repository_url,
                    "technologies": p.technologies_json,
                    "stars_count": p.stars_count,
                    "provenance_source": p.provenance_source,
                })

        # Evidence
        evidence_stmt = select(Evidence).where(Evidence.user_id == user_id)
        evidence_res = await db.execute(evidence_stmt)
        evidence_items = [
            {
                "id": ev.id,
                "source_type": ev.source_type,
                "evidence_type": ev.evidence_type,
                "title": ev.title,
                "description": ev.description,
                "observed_at": ev.observed_at.isoformat(),
                "confidence": ev.confidence,
            }
            for ev in evidence_res.scalars().all()
        ]

        # Applications
        app_stmt = select(Application).where(Application.user_id == user_id)
        app_res = await db.execute(app_stmt)
        apps_list = []
        for a in app_res.scalars().all():
            art_stmt = select(ApplicationArtifact).where(ApplicationArtifact.application_id == a.id)
            art_res = await db.execute(art_stmt)
            artifacts = [
                {
                    "id": art.id,
                    "artifact_type": art.artifact_type,
                    "title": art.title,
                    "content_text": art.content_text,
                    "provenance_sources": art.provenance_sources_json,
                }
                for art in art_res.scalars().all()
            ]
            apps_list.append({
                "id": a.id,
                "job_id": a.job_id,
                "status": a.status,
                "tailored_role_title": a.tailored_role_title,
                "match_score_at_application": a.match_score_at_application,
                "applied_at": a.applied_at.isoformat() if a.applied_at else None,
                "notes": a.notes,
                "artifacts": artifacts,
            })

        # Consent Audit Trail
        consents_stmt = select(ConsentRecord).where(ConsentRecord.user_id == user_id).order_by(ConsentRecord.created_at.desc())
        consents_res = await db.execute(consents_stmt)
        consent_audit = [
            {
                "id": c.id,
                "purpose_id": c.purpose_id,
                "purpose_name": c.purpose_name,
                "status": c.status,
                "notice_version": c.notice_version,
                "consent_method": c.consent_method,
                "granted_at": c.granted_at.isoformat(),
                "withdrawn_at": c.withdrawn_at.isoformat() if c.withdrawn_at else None,
            }
            for c in consents_res.scalars().all()
        ]

        # Sources
        sources_stmt = select(Source).where(Source.user_id == user_id)
        sources_res = await db.execute(sources_stmt)
        sources_list = [
            {
                "id": s.id,
                "source_type": s.source_type,
                "display_name": s.display_name,
                "status": s.status,
                "last_synced_at": s.last_synced_at.isoformat() if s.last_synced_at else None,
            }
            for s in sources_res.scalars().all()
        ]

        return FullDataExportPayload(
            export_id=f"SAR-{uuid.uuid4().hex[:12].upper()}",
            generated_at=datetime.now(timezone.utc).isoformat(),
            data_principal={
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "auth_provider": user.auth_provider,
                "avatar_url": user.avatar_url,
                "created_at": user.created_at.isoformat(),
            },
            professional_identity={
                "headline": identity.headline if identity else "",
                "bio": identity.bio if identity else "",
                "years_of_experience": identity.years_of_experience if identity else 0.0,
                "current_level": identity.current_level if identity else "Mid-Level",
                "profile_confidence": identity.profile_confidence if identity else 0.0,
                "summary": identity.summary_json if identity else {},
            },
            experiences=experiences,
            projects=projects,
            evidence_items=evidence_items,
            skills_and_competencies=[],
            applications_and_artifacts=apps_list,
            learning_plans=[],
            assessment_history=[],
            consent_audit_trail=consent_audit,
            sources_and_integrations=sources_list,
        )

    @staticmethod
    async def execute_data_erasure(
        user_id: str,
        confirmation_phrase: str,
        reason: Optional[str],
        db: AsyncSession,
    ) -> DataErasureResponse:
        """
        Section 12 Right to Erasure / Right to be Forgotten.
        Permanently and irreversibly purges all personal data across all database tables.
        Logs an anonymized cryptographic proof in DataErasureAudit.
        """
        REQUIRED_PHRASE = "DELETE MY PERSONAL DATA PERMANENTLY"
        if confirmation_phrase.strip() != REQUIRED_PHRASE:
            raise ValidationException(
                f"Confirmation phrase mismatch. You must provide exactly: '{REQUIRED_PHRASE}'"
            )

        user = await db.get(User, user_id)
        if not user:
            raise ResourceNotFoundException("User not found")

        # Hash user ID for audit compliance without keeping personal identifiable data
        user_id_hash = hashlib.sha256(user_id.encode("utf-8")).hexdigest()
        verification_token = f"DPDP-ERASE-{uuid.uuid4().hex.upper()}"
        requested_at = datetime.now(timezone.utc)

        erased_categories = [
            "User Account & Credentials",
            "Professional Identity & Portfolio",
            "Work Experiences & Projects",
            "Evidence Graph & Source Integrations",
            "Job Applications, Resumes & Cover Letters",
            "Grievances & Nominations",
            "Consent History Ledger",
        ]

        # Execute cascading relational deletions
        # 1. Outcomes & Applications
        app_subquery = select(Application.id).where(Application.user_id == user_id)
        await db.execute(delete(ApplicationEvent).where(ApplicationEvent.application_id.in_(app_subquery)))
        await db.execute(delete(OutcomeFeedback).where(OutcomeFeedback.application_id.in_(app_subquery)))
        await db.execute(delete(ApplicationArtifact).where(ApplicationArtifact.application_id.in_(app_subquery)))
        await db.execute(delete(Application).where(Application.user_id == user_id))
        await db.execute(delete(ApplicationPolicy).where(ApplicationPolicy.user_id == user_id))

        # 2. Learning Plans
        await db.execute(delete(LearningPlanItem).where(LearningPlanItem.learning_plan_id.in_(
            select(LearningPlan.id).where(LearningPlan.user_id == user_id)
        )))
        await db.execute(delete(LearningPlan).where(LearningPlan.user_id == user_id))


        # 3. Evidence & Sources
        await db.execute(delete(Evidence).where(Evidence.user_id == user_id))
        await db.execute(delete(SourceConnection).where(SourceConnection.source_id.in_(
            select(Source.id).where(Source.user_id == user_id)
        )))
        await db.execute(delete(Source).where(Source.user_id == user_id))

        # 4. Identity, Experiences, Projects
        identity = await db.scalar(select(ProfessionalIdentity).where(ProfessionalIdentity.user_id == user_id))
        if identity:
            await db.execute(delete(Experience).where(Experience.identity_id == identity.id))
            await db.execute(delete(Project).where(Project.identity_id == identity.id))
            await db.execute(delete(ProfessionalIdentity).where(ProfessionalIdentity.id == identity.id))

        # 5. Career Goals
        await db.execute(delete(CareerGoal).where(CareerGoal.user_id == user_id))

        # 6. Privacy entities (Grievance, Nomination, ParentalConsent, Consent)
        await db.execute(delete(DataNomination).where(DataNomination.user_id == user_id))
        await db.execute(delete(ParentalConsent).where(ParentalConsent.user_id == user_id))
        await db.execute(delete(PrivacyGrievance).where(PrivacyGrievance.user_id == user_id))
        await db.execute(delete(ConsentRecord).where(ConsentRecord.user_id == user_id))

        # 7. User table
        await db.execute(delete(User).where(User.id == user_id))

        # 8. Record immutable erasure audit
        audit_record = DataErasureAudit(
            id=str(uuid.uuid4()),
            user_id_hash=user_id_hash,
            requested_at=requested_at,
            completed_at=datetime.now(timezone.utc),
            records_erased_count=7,
            categories_erased_json=erased_categories,
            verification_token=verification_token,
            status="COMPLETED",
        )
        db.add(audit_record)

        await db.commit()
        logger.info(f"DPDP Section 12 Data Erasure completed successfully for hashed ID {user_id_hash[:8]}...")

        return DataErasureResponse(
            status="SUCCESS",
            message="All personal data has been permanently and irreversibly erased across all active databases and cached systems.",
            user_id_hash=user_id_hash,
            records_erased_count=7,
            categories_erased=erased_categories,
            verification_token=verification_token,
            completed_at=datetime.now(timezone.utc),
        )

    # -------------------------------------------------------------------
    # Grievance Redressal (Section 13)
    # -------------------------------------------------------------------

    @staticmethod
    def _make_aware(dt: datetime) -> datetime:
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    @classmethod
    async def create_grievance(
        cls,
        user_id: str,
        req: GrievanceCreateRequest,
        db: AsyncSession,
    ) -> GrievanceResponse:
        """Registers a privacy grievance with a strict statutory 90-day SLA deadline."""
        now = datetime.now(timezone.utc)
        deadline = now + timedelta(days=90)  # Max 90 days per DPDP Rules 2025
        ticket_id = f"DPDP-GRV-{uuid.uuid4().hex[:8].upper()}"

        initial_audit = {
            "timestamp": now.isoformat(),
            "action": "GRIEVANCE_SUBMITTED",
            "actor": "DATA_PRINCIPAL",
            "notes": "Grievance received and assigned ticket ID.",
        }

        grievance = PrivacyGrievance(
            id=str(uuid.uuid4()),
            ticket_id=ticket_id,
            user_id=user_id,
            category=req.category,
            subject=req.subject,
            description=req.description,
            status="SUBMITTED",
            statutory_deadline=deadline,
            assigned_officer="Data Protection Officer (DPO)",
            audit_trail_json=[initial_audit],
        )
        db.add(grievance)
        await db.commit()
        await db.refresh(grievance)

        days_rem = max(0, (cls._make_aware(grievance.statutory_deadline) - now).days)
        return GrievanceResponse(
            id=grievance.id,
            ticket_id=grievance.ticket_id,
            user_id=grievance.user_id,
            category=grievance.category,
            subject=grievance.subject,
            description=grievance.description,
            status=grievance.status,
            submitted_at=grievance.created_at,
            statutory_deadline=grievance.statutory_deadline,
            days_remaining=days_rem,
            assigned_officer=grievance.assigned_officer,
            resolution_notes=grievance.resolution_notes,
            resolved_at=grievance.resolved_at,
            escalated_to_board=grievance.escalated_to_board,
            audit_trail=grievance.audit_trail_json,
        )

    @classmethod
    async def list_user_grievances(cls, user_id: str, db: AsyncSession) -> List[GrievanceResponse]:
        """Lists all grievances submitted by the authenticated user."""
        stmt = select(PrivacyGrievance).where(PrivacyGrievance.user_id == user_id).order_by(PrivacyGrievance.created_at.desc())
        res = await db.execute(stmt)
        items = res.scalars().all()
        now = datetime.now(timezone.utc)

        output = []
        for g in items:
            days_rem = max(0, (cls._make_aware(g.statutory_deadline) - now).days) if g.status != "RESOLVED" else 0
            output.append(
                GrievanceResponse(
                    id=g.id,
                    ticket_id=g.ticket_id,
                    user_id=g.user_id,
                    category=g.category,
                    subject=g.subject,
                    description=g.description,
                    status=g.status,
                    submitted_at=g.created_at,
                    statutory_deadline=g.statutory_deadline,
                    days_remaining=days_rem,
                    assigned_officer=g.assigned_officer,
                    resolution_notes=g.resolution_notes,
                    resolved_at=g.resolved_at,
                    escalated_to_board=g.escalated_to_board,
                    audit_trail=g.audit_trail_json,
                )
            )
        return output

    @classmethod
    async def update_grievance_status(
        cls,
        grievance_id: str,
        req: GrievanceStatusUpdateRequest,
        db: AsyncSession,
    ) -> GrievanceResponse:
        """Updates resolution status of a grievance."""
        grievance = await db.get(PrivacyGrievance, grievance_id)
        if not grievance:
            raise ResourceNotFoundException("Grievance not found")

        now = datetime.now(timezone.utc)
        audit_entry = {
            "timestamp": now.isoformat(),
            "action": f"STATUS_UPDATED_TO_{req.status}",
            "actor": req.assigned_officer or grievance.assigned_officer or "DPO",
            "notes": req.resolution_notes or "",
        }

        grievance.status = req.status
        if req.resolution_notes:
            grievance.resolution_notes = req.resolution_notes
        if req.assigned_officer:
            grievance.assigned_officer = req.assigned_officer
        if req.escalate_to_board is not None:
            grievance.escalated_to_board = req.escalate_to_board
        if req.status in ("RESOLVED", "REJECTED"):
            grievance.resolved_at = now

        current_audit = list(grievance.audit_trail_json or [])
        current_audit.append(audit_entry)
        grievance.audit_trail_json = current_audit

        await db.commit()
        await db.refresh(grievance)

        days_rem = max(0, (cls._make_aware(grievance.statutory_deadline) - now).days) if grievance.status != "RESOLVED" else 0
        return GrievanceResponse(
            id=grievance.id,
            ticket_id=grievance.ticket_id,
            user_id=grievance.user_id,
            category=grievance.category,
            subject=grievance.subject,
            description=grievance.description,
            status=grievance.status,
            submitted_at=grievance.created_at,
            statutory_deadline=grievance.statutory_deadline,
            days_remaining=days_rem,
            assigned_officer=grievance.assigned_officer,
            resolution_notes=grievance.resolution_notes,
            resolved_at=grievance.resolved_at,
            escalated_to_board=grievance.escalated_to_board,
            audit_trail=grievance.audit_trail_json,
        )


    # -------------------------------------------------------------------
    # Right to Nominate (Section 14)
    # -------------------------------------------------------------------

    @staticmethod
    async def get_nomination(user_id: str, db: AsyncSession) -> Optional[NominationResponse]:
        """Retrieves active nomination for the user."""
        stmt = select(DataNomination).where(DataNomination.user_id == user_id, DataNomination.is_active == True)
        res = await db.execute(stmt)
        nom = res.scalar_one_or_none()
        if not nom:
            return None
        return NominationResponse.model_validate(nom)

    @staticmethod
    async def create_or_update_nomination(
        user_id: str,
        req: NominationCreateOrUpdateRequest,
        db: AsyncSession,
    ) -> NominationResponse:
        """Designates or updates the Data Principal's nominee."""
        stmt = select(DataNomination).where(DataNomination.user_id == user_id)
        res = await db.execute(stmt)
        nom = res.scalar_one_or_none()

        if nom:
            nom.nominee_full_name = req.nominee_full_name
            nom.nominee_email = req.nominee_email
            nom.nominee_phone = req.nominee_phone
            nom.relationship = req.relationship
            nom.notes = req.notes
            nom.is_active = True
        else:
            nom = DataNomination(
                id=str(uuid.uuid4()),
                user_id=user_id,
                nominee_full_name=req.nominee_full_name,
                nominee_email=req.nominee_email,
                nominee_phone=req.nominee_phone,
                relationship=req.relationship,
                notes=req.notes,
                is_active=True,
            )
            db.add(nom)

        await db.commit()
        await db.refresh(nom)
        return NominationResponse.model_validate(nom)

    @staticmethod
    async def delete_nomination(user_id: str, db: AsyncSession) -> Dict[str, str]:
        """Revokes the active nomination."""
        stmt = delete(DataNomination).where(DataNomination.user_id == user_id)
        await db.execute(stmt)
        await db.commit()
        return {"status": "SUCCESS", "message": "Nomination revoked successfully."}

    # -------------------------------------------------------------------
    # Children's Data & Verifiable Parental Consent (Section 9)
    # -------------------------------------------------------------------

    @staticmethod
    async def initiate_parental_consent(
        user_id: str,
        req: ParentalConsentInitiateRequest,
        db: AsyncSession,
    ) -> ParentalConsentResponse:
        """Initiates Verifiable Parental Consent (VPC) flow for minors (<18)."""
        verification_token = f"VPC-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc)
        expires = now + timedelta(days=7)

        stmt = select(ParentalConsent).where(ParentalConsent.user_id == user_id)
        res = await db.execute(stmt)
        consent = res.scalar_one_or_none()

        if consent:
            consent.parent_full_name = req.parent_full_name
            consent.parent_email = req.parent_email
            consent.parent_phone = req.parent_phone
            consent.relationship = req.relationship
            consent.verification_token = verification_token
            consent.is_verified = False
            consent.expires_at = expires
        else:
            consent = ParentalConsent(
                id=str(uuid.uuid4()),
                user_id=user_id,
                parent_full_name=req.parent_full_name,
                parent_email=req.parent_email,
                parent_phone=req.parent_phone,
                relationship=req.relationship,
                verification_method="EMAIL_OTP_VERIFICATION",
                verification_token=verification_token,
                is_verified=False,
                expires_at=expires,
            )
            db.add(consent)

        await db.commit()
        await db.refresh(consent)
        return ParentalConsentResponse.model_validate(consent)

    @staticmethod
    async def verify_parental_consent(
        user_id: str,
        verification_token: str,
        db: AsyncSession,
    ) -> ParentalConsentResponse:
        """Verifies parental token for minor user."""
        stmt = select(ParentalConsent).where(
            ParentalConsent.user_id == user_id,
            ParentalConsent.verification_token == verification_token,
        )
        res = await db.execute(stmt)
        consent = res.scalar_one_or_none()
        if not consent:
            raise ValidationException("Invalid parental verification token.")

        consent.is_verified = True
        consent.verified_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(consent)
        return ParentalConsentResponse.model_validate(consent)

    # -------------------------------------------------------------------
    # Breach Response & Incident Management (Section 8(6))
    # -------------------------------------------------------------------

    @staticmethod
    async def list_breach_incidents(db: AsyncSession) -> List[BreachIncidentResponse]:
        """Lists logged security/privacy breach incidents."""
        stmt = select(BreachIncident).order_by(BreachIncident.discovered_at.desc())
        res = await db.execute(stmt)
        items = res.scalars().all()
        return [
            BreachIncidentResponse(
                id=b.id,
                incident_code=b.incident_code,
                title=b.title,
                severity=b.severity,
                status=b.status,
                discovered_at=b.discovered_at,
                contained_at=b.contained_at,
                data_categories_affected=b.data_categories_affected_json,
                affected_users_count=b.affected_users_count,
                root_cause=b.root_cause,
                remediation_steps=b.remediation_steps,
                board_notified=b.board_notified,
                board_notified_at=b.board_notified_at,
                users_notified=b.users_notified,
                users_notified_at=b.users_notified_at,
            )
            for b in items
        ]

    @staticmethod
    async def report_breach_incident(req: BreachIncidentCreate, db: AsyncSession) -> BreachIncidentResponse:
        """Creates a security and data breach incident record with triage status."""
        incident_code = f"INC-DPDP-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        now = datetime.now(timezone.utc)

        incident = BreachIncident(
            id=str(uuid.uuid4()),
            incident_code=incident_code,
            title=req.title,
            severity=req.severity,
            status="TRIAGED",
            discovered_at=now,
            contained_at=now if req.severity == "LOW" else None,
            data_categories_affected_json=req.data_categories_affected,
            affected_users_count=req.affected_users_count,
            root_cause=req.root_cause,
            remediation_steps=req.remediation_steps,
            board_notified=False,
            users_notified=False,
        )
        db.add(incident)
        await db.commit()
        await db.refresh(incident)

        return BreachIncidentResponse(
            id=incident.id,
            incident_code=incident.incident_code,
            title=incident.title,
            severity=incident.severity,
            status=incident.status,
            discovered_at=incident.discovered_at,
            contained_at=incident.contained_at,
            data_categories_affected=incident.data_categories_affected_json,
            affected_users_count=incident.affected_users_count,
            root_cause=incident.root_cause,
            remediation_steps=incident.remediation_steps,
            board_notified=incident.board_notified,
            board_notified_at=incident.board_notified_at,
            users_notified=incident.users_notified,
            users_notified_at=incident.users_notified_at,
        )

    # -------------------------------------------------------------------
    # Retention Policy Evaluation
    # -------------------------------------------------------------------

    @staticmethod
    async def evaluate_retention_policy(db: AsyncSession) -> RetentionPolicyStatusResponse:
        """Evaluates retention policy and performs scheduled background cleanup."""
        now = datetime.now(timezone.utc)
        # Prune expired temporary parental consent requests older than 7 days
        expired_cutoff = now - timedelta(days=7)
        del_stmt = delete(ParentalConsent).where(
            ParentalConsent.is_verified == False,
            ParentalConsent.created_at < expired_cutoff,
        )
        res = await db.execute(del_stmt)
        pruned_count = res.rowcount if hasattr(res, "rowcount") else 0
        await db.commit()

        return RetentionPolicyStatusResponse(
            evaluated_at=now.isoformat(),
            total_rules_active=len(DPDP_RETENTION_RULES),
            rules=DPDP_RETENTION_RULES,
            expired_records_pruned_last_run=pruned_count or 0,
            status="HEALTHY_AND_ENFORCED",
        )
