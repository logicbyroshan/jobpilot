from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# -------------------------------------------------------------------
# Notice & Purpose Schemas
# -------------------------------------------------------------------

class ProcessingPurposeInfo(BaseModel):
    purpose_id: str
    purpose_name: str
    description: str
    is_essential: bool
    data_categories_collected: List[str]
    retention_period_days: int
    third_party_processors: List[str]


class DPDPNoticeResponse(BaseModel):
    notice_version: str
    published_date: str
    organization_name: str
    fiduciary_role: str
    dpo_name: Optional[str] = None
    dpo_email: Optional[str] = None
    grievance_email: str
    board_name: str
    board_portal_url: str
    purposes: List[ProcessingPurposeInfo]
    available_rights: List[str]
    supported_languages: List[str]
    last_updated: str


# -------------------------------------------------------------------
# Consent Schemas
# -------------------------------------------------------------------

class ConsentItemUpdate(BaseModel):
    purpose_id: str
    granted: bool


class ConsentBatchUpdateRequest(BaseModel):
    consents: List[ConsentItemUpdate]
    notice_version: Optional[str] = "v1.0-dpdp-2025"
    method: Optional[str] = "SETTINGS_TOGGLE"


class ConsentRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    purpose_id: str
    purpose_name: str
    status: str
    notice_version: str
    consent_method: str
    granted_at: datetime
    withdrawn_at: Optional[datetime] = None
    withdrawal_reason: Optional[str] = None



class ConsentWithdrawalRequest(BaseModel):
    purpose_id: str
    reason: Optional[str] = None


class UserConsentOverviewResponse(BaseModel):
    user_id: str
    active_consents: List[ConsentRecordResponse]
    all_available_purposes: List[ProcessingPurposeInfo]
    last_updated: datetime


# -------------------------------------------------------------------
# Data Principal Rights: Access / Export Schemas
# -------------------------------------------------------------------

class PersonalDataCategorySummary(BaseModel):
    category_name: str
    description: str
    record_count: int
    storage_location: str
    processors_involved: List[str]


class DataAccessSummaryResponse(BaseModel):
    user_id: str
    data_principal_name: str
    email: str
    account_created_at: datetime
    categories: List[PersonalDataCategorySummary]
    active_consent_purposes: List[str]
    connected_integrations: List[str]
    last_login: Optional[str] = None


class FullDataExportPayload(BaseModel):
    export_id: str
    generated_at: str
    data_principal: Dict[str, Any]
    professional_identity: Dict[str, Any]
    experiences: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    evidence_items: List[Dict[str, Any]]
    skills_and_competencies: List[Dict[str, Any]]
    applications_and_artifacts: List[Dict[str, Any]]
    learning_plans: List[Dict[str, Any]]
    assessment_history: List[Dict[str, Any]]
    consent_audit_trail: List[Dict[str, Any]]
    sources_and_integrations: List[Dict[str, Any]]
    export_format: str = "JSON_MACHINE_READABLE"


# -------------------------------------------------------------------
# Data Principal Rights: Erasure Schemas
# -------------------------------------------------------------------

class DataErasureRequest(BaseModel):
    confirmation_phrase: str = Field(
        ...,
        description="Must match 'DELETE MY PERSONAL DATA PERMANENTLY'",
    )
    reason: Optional[str] = None


class DataErasureResponse(BaseModel):
    status: str
    message: str
    user_id_hash: str
    records_erased_count: int
    categories_erased: List[str]
    verification_token: str
    completed_at: datetime


# -------------------------------------------------------------------
# Data Principal Rights: Grievance Redressal Schemas
# -------------------------------------------------------------------

class GrievanceCreateRequest(BaseModel):
    category: str = Field(
        ...,
        description="CONSENT_WITHDRAWAL, DATA_ACCESS, DATA_CORRECTION, DATA_ERASURE, UNAUTHORIZED_PROCESSING, SECURITY_CONCERN, OTHER",
    )
    subject: str = Field(..., max_length=255)
    description: str


class GrievanceStatusUpdateRequest(BaseModel):
    status: str  # ACKNOWLEDGED, UNDER_INVESTIGATION, RESOLVED, REJECTED
    resolution_notes: Optional[str] = None
    assigned_officer: Optional[str] = None
    escalate_to_board: Optional[bool] = False


class GrievanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    ticket_id: str
    user_id: str
    category: str
    subject: str
    description: str
    status: str
    submitted_at: datetime
    statutory_deadline: datetime
    days_remaining: int
    assigned_officer: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    escalated_to_board: bool
    audit_trail: List[Dict[str, Any]]


# -------------------------------------------------------------------
# Data Principal Rights: Nomination Schemas
# -------------------------------------------------------------------

class NominationCreateOrUpdateRequest(BaseModel):
    nominee_full_name: str = Field(..., min_length=2, max_length=255)
    nominee_email: str = Field(..., min_length=3, max_length=255)
    nominee_phone: Optional[str] = None
    relationship: str = Field(
        ...,
        description="SPOUSE, PARENT, CHILD, SIBLING, LEGAL_GUARDIAN, AUTHORIZED_REPRESENTATIVE",
    )
    notes: Optional[str] = None


class NominationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    nominee_full_name: str
    nominee_email: str
    nominee_phone: Optional[str] = None
    relationship: str
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


# -------------------------------------------------------------------
# Age Gate & Parental Consent Schemas
# -------------------------------------------------------------------

class ParentalConsentInitiateRequest(BaseModel):
    child_dob: str = Field(..., description="YYYY-MM-DD")
    parent_full_name: str
    parent_email: str = Field(..., min_length=3, max_length=255)
    parent_phone: Optional[str] = None
    relationship: str = "PARENT"


class ParentalConsentVerificationRequest(BaseModel):
    verification_token: str


class ParentalConsentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    parent_full_name: str
    parent_email: str
    parent_phone: Optional[str] = None
    relationship: str
    verification_method: str
    is_verified: bool
    verified_at: Optional[datetime] = None


# -------------------------------------------------------------------
# Third-Party Processor Registry Schemas
# -------------------------------------------------------------------

class DataProcessorItem(BaseModel):
    processor_name: str
    entity_type: str
    purpose: str
    personal_data_categories_processed: List[str]
    hosting_location: str
    safeguards_and_dpa: str
    cross_border_transfer: bool


class ProcessorRegistryResponse(BaseModel):
    fiduciary_name: str
    processors: List[DataProcessorItem]
    total_processors_count: int


# -------------------------------------------------------------------
# Breach Management Schemas
# -------------------------------------------------------------------

class BreachIncidentCreate(BaseModel):
    title: str
    severity: str = "MEDIUM"
    data_categories_affected: List[str]
    affected_users_count: int = 0
    root_cause: Optional[str] = None
    remediation_steps: Optional[str] = None


class BreachIncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    incident_code: str
    title: str
    severity: str
    status: str
    discovered_at: datetime
    contained_at: Optional[datetime] = None
    data_categories_affected: List[str]
    affected_users_count: int
    root_cause: Optional[str] = None
    remediation_steps: Optional[str] = None
    board_notified: bool
    board_notified_at: Optional[datetime] = None
    users_notified: bool
    users_notified_at: Optional[datetime] = None



# -------------------------------------------------------------------
# Retention Policy Schemas
# -------------------------------------------------------------------

class RetentionRuleInfo(BaseModel):
    data_category: str
    purpose: str
    retention_period_days: int
    legal_justification: str
    action_on_expiry: str


class RetentionPolicyStatusResponse(BaseModel):
    evaluated_at: str
    total_rules_active: int
    rules: List[RetentionRuleInfo]
    expired_records_pruned_last_run: int
    status: str
