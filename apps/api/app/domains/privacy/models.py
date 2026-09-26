from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ConsentRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    DPDP Act 2023 Section 6 compliant consent record.
    Maintains an immutable, auditable log of user consent for specified processing purposes.
    """
    __tablename__ = "dpdp_consent_records"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    purpose_id: Mapped[str] = mapped_column(
        String(100), index=True, nullable=False
    )  # CORE_CAREER_OPERATING_SYSTEM, AI_RESUME_TAILORING_AUTONOMY, AUTO_APPLY_EXECUTION, TELEMETRY_AND_ANALYTICS, COMMUNICATIONS_AND_ALERTS
    purpose_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="GRANTED", nullable=False
    )  # GRANTED, WITHDRAWN, EXPIRED, RESTRICTED
    notice_version: Mapped[str] = mapped_column(String(50), default="v1.0-dpdp-2025", nullable=False)
    consent_method: Mapped[str] = mapped_column(
        String(50), default="EXPLICIT_WEB_FORM", nullable=False
    )  # EXPLICIT_WEB_FORM, GOOGLE_SSO_ONBOARDING, SETTINGS_TOGGLE
    ip_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    withdrawn_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    withdrawal_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)


class PrivacyGrievance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    DPDP Act 2023 Section 13 & DPDP Rules 2025 compliant Grievance Redressal mechanism.
    Tracks grievance ticket, status, and strictly enforces resolution within statutory timeline (<=90 days).
    """
    __tablename__ = "dpdp_privacy_grievances"

    ticket_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # CONSENT_WITHDRAWAL, DATA_ACCESS, DATA_CORRECTION, DATA_ERASURE, UNAUTHORIZED_PROCESSING, SECURITY_CONCERN, OTHER
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="SUBMITTED", index=True, nullable=False
    )  # SUBMITTED, ACKNOWLEDGED, UNDER_INVESTIGATION, RESOLVED, REJECTED
    statutory_deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )  # Max 90 days from submission per DPDP Rules 2025
    assigned_officer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    escalated_to_board: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    audit_trail_json: Mapped[List[dict]] = mapped_column(JSON, default=list, nullable=False)


class DataNomination(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    DPDP Act 2023 Section 14 compliant right to nominate a representative.
    Allows Data Principal to designate an individual to exercise their rights in event of death/incapacity.
    """
    __tablename__ = "dpdp_data_nominations"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    nominee_full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    nominee_email: Mapped[str] = mapped_column(String(255), nullable=False)
    nominee_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    relationship: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # SPOUSE, PARENT, CHILD, SIBLING, LEGAL_GUARDIAN, AUTHORIZED_REPRESENTATIVE
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class DataErasureAudit(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Immutable audit record proving completion of Section 12 Data Erasure without retaining the personal data itself.
    """
    __tablename__ = "dpdp_erasure_audits"

    user_id_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    records_erased_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    categories_erased_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    verification_token: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="COMPLETED", nullable=False)


class ParentalConsent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    DPDP Act 2023 Section 9 Verifiable Parental Consent (VPC) record for users under 18.
    """
    __tablename__ = "dpdp_parental_consents"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    parent_full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_email: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    relationship: Mapped[str] = mapped_column(String(50), default="PARENT", nullable=False)
    verification_method: Mapped[str] = mapped_column(
        String(50), default="EMAIL_OTP_VERIFICATION", nullable=False
    )  # EMAIL_OTP_VERIFICATION, GOVT_ID_TOKEN, GUARDIAN_DECLARATION
    verification_token: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class BreachIncident(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    DPDP Act 2023 Section 8(6) & DPDP Rules 2025 Incident and Breach Registry.
    Tracks breach triage, containment, Data Protection Board of India notification, and affected user notice.
    """
    __tablename__ = "dpdp_breach_incidents"

    incident_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(
        String(30), default="MEDIUM", nullable=False
    )  # LOW, MEDIUM, HIGH, CRITICAL
    status: Mapped[str] = mapped_column(
        String(50), default="DETECTED", nullable=False
    )  # DETECTED, TRIAGED, CONTAINED, BOARD_NOTIFIED, USERS_NOTIFIED, RESOLVED
    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    contained_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    data_categories_affected_json: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    affected_users_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    root_cause: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    remediation_steps: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    board_notified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    board_notified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    users_notified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    users_notified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
