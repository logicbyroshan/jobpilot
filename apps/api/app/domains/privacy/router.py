from typing import List, Optional
from fastapi import APIRouter, Depends, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import CurrentUser, get_current_user
from app.domains.privacy.schemas import (
    BreachIncidentCreate,
    BreachIncidentResponse,
    ConsentBatchUpdateRequest,
    ConsentRecordResponse,
    ConsentWithdrawalRequest,
    DataAccessSummaryResponse,
    DataErasureRequest,
    DataErasureResponse,
    DPDPNoticeResponse,
    FullDataExportPayload,
    GrievanceCreateRequest,
    GrievanceResponse,
    GrievanceStatusUpdateRequest,
    NominationCreateOrUpdateRequest,
    NominationResponse,
    ParentalConsentInitiateRequest,
    ParentalConsentResponse,
    ParentalConsentVerificationRequest,
    ProcessorRegistryResponse,
    RetentionPolicyStatusResponse,
    UserConsentOverviewResponse,
)
from app.domains.privacy.services import PrivacyService

router = APIRouter(prefix="/privacy", tags=["DPDP Privacy & Data Governance"])


# -------------------------------------------------------------------
# Notice & Public Registries (Section 5, Section 8)
# -------------------------------------------------------------------

@router.get("/notice", response_model=DPDPNoticeResponse, summary="Retrieve DPDP Section 5 Itemised Privacy Notice")
async def get_dpdp_notice() -> DPDPNoticeResponse:
    """Returns the official itemised DPDP Privacy Notice with purposes, rights, and DPO contacts."""
    return PrivacyService.get_notice()


@router.get("/processors", response_model=ProcessorRegistryResponse, summary="List Third-Party Data Processors")
async def get_processor_registry() -> ProcessorRegistryResponse:
    """Returns the inventory of third-party data processors and security safeguards."""
    return PrivacyService.get_processor_registry()


# -------------------------------------------------------------------
# Consent Architecture & Ledger (Section 6)
# -------------------------------------------------------------------

@router.get("/consent", response_model=UserConsentOverviewResponse, summary="Get Data Principal's active consents")
async def get_user_consent_overview(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> UserConsentOverviewResponse:
    """Retrieve all active consent purposes and available optional processing purposes."""
    return await PrivacyService.get_user_consent_overview(current_user.id, db)


@router.post("/consent", response_model=List[ConsentRecordResponse], summary="Update purpose-specific consent settings")
async def update_consent_batch(
    req: ConsentBatchUpdateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[ConsentRecordResponse]:
    """Updates consent preferences and records an immutable entry in the DPDP Consent Ledger."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await PrivacyService.update_consent_batch(current_user.id, req, client_ip, user_agent, db)


@router.post("/consent/withdraw", response_model=ConsentRecordResponse, summary="Withdraw consent for a purpose")
async def withdraw_consent(
    req: ConsentWithdrawalRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> ConsentRecordResponse:
    """Immediately withdraws consent for a processing purpose and triggers downstream pauses."""
    return await PrivacyService.withdraw_consent(current_user.id, req.purpose_id, req.reason, db)


# -------------------------------------------------------------------
# Data Principal Rights: Access & SAR Export (Section 11)
# -------------------------------------------------------------------

@router.get("/summary", response_model=DataAccessSummaryResponse, summary="Subject Access Request summary")
async def get_data_access_summary(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> DataAccessSummaryResponse:
    """Returns a category-level inventory of all personal data held about the Data Principal."""
    return await PrivacyService.get_data_access_summary(current_user.id, db)


@router.get("/export", response_model=FullDataExportPayload, summary="Download complete personal data export (JSON)")
async def export_full_user_data(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> FullDataExportPayload:
    """Generates a complete, machine-readable JSON archive containing all personal data and audit logs."""
    return await PrivacyService.export_full_user_data(current_user.id, db)


# -------------------------------------------------------------------
# Data Principal Rights: Erasure (Section 12)
# -------------------------------------------------------------------

@router.post("/erasure", response_model=DataErasureResponse, summary="Permanently erase all personal data")
async def execute_data_erasure(
    req: DataErasureRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> DataErasureResponse:
    """Irreversibly deletes all personal data across all database tables, caches, and storage."""
    return await PrivacyService.execute_data_erasure(
        current_user.id, req.confirmation_phrase, req.reason, db
    )


# -------------------------------------------------------------------
# Grievance Redressal (Section 13)
# -------------------------------------------------------------------

@router.get("/grievances", response_model=List[GrievanceResponse], summary="List privacy grievances")
async def list_grievances(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[GrievanceResponse]:
    """Lists all grievances submitted by the Data Principal with statutory SLA tracking."""
    return await PrivacyService.list_user_grievances(current_user.id, db)


@router.post(
    "/grievances",
    response_model=GrievanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a privacy grievance",
)
async def create_grievance(
    req: GrievanceCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> GrievanceResponse:
    """Submits a formal privacy grievance subject to the statutory 90-day resolution timeline."""
    return await PrivacyService.create_grievance(current_user.id, req, db)


@router.patch("/grievances/{grievance_id}", response_model=GrievanceResponse, summary="Update grievance status")
async def update_grievance(
    grievance_id: str,
    req: GrievanceStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> GrievanceResponse:
    """Updates grievance resolution notes and status."""
    return await PrivacyService.update_grievance_status(grievance_id, req, db)


# -------------------------------------------------------------------
# Right to Nominate (Section 14)
# -------------------------------------------------------------------

@router.get("/nomination", response_model=Optional[NominationResponse], summary="Get nominee details")
async def get_nomination(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> Optional[NominationResponse]:
    """Retrieves the active representative nomination for the Data Principal."""
    return await PrivacyService.get_nomination(current_user.id, db)


@router.post("/nomination", response_model=NominationResponse, summary="Set or update nominee")
async def create_or_update_nomination(
    req: NominationCreateOrUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> NominationResponse:
    """Designates an individual to exercise Data Principal rights in case of death or incapacity."""
    return await PrivacyService.create_or_update_nomination(current_user.id, req, db)


@router.delete("/nomination", summary="Revoke nominee")
async def delete_nomination(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Revokes the existing representative nomination."""
    return await PrivacyService.delete_nomination(current_user.id, db)


# -------------------------------------------------------------------
# Children's Data & Verifiable Parental Consent (Section 9)
# -------------------------------------------------------------------

@router.post("/parental-consent/initiate", response_model=ParentalConsentResponse, summary="Initiate minor VPC")
async def initiate_parental_consent(
    req: ParentalConsentInitiateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> ParentalConsentResponse:
    """Initiates Verifiable Parental Consent workflow for users under 18 years."""
    return await PrivacyService.initiate_parental_consent(current_user.id, req, db)


@router.post("/parental-consent/verify", response_model=ParentalConsentResponse, summary="Verify parental token")
async def verify_parental_consent(
    req: ParentalConsentVerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> ParentalConsentResponse:
    """Verifies the parent/guardian authorization token."""
    return await PrivacyService.verify_parental_consent(current_user.id, req.verification_token, db)


# -------------------------------------------------------------------
# Retention Policy & Breach Registry (Section 8)
# -------------------------------------------------------------------

@router.get("/retention", response_model=RetentionPolicyStatusResponse, summary="Retention policy status")
async def get_retention_policy_status(
    db: AsyncSession = Depends(get_db),
) -> RetentionPolicyStatusResponse:
    """Evaluates retention matrices and triggers background cleanup."""
    return await PrivacyService.evaluate_retention_policy(db)


@router.get("/breach/incidents", response_model=List[BreachIncidentResponse], summary="List breach incidents")
async def list_breach_incidents(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> List[BreachIncidentResponse]:
    """Lists security and data breach incidents logged in the DPDP Breach Registry."""
    return await PrivacyService.list_breach_incidents(db)


@router.post("/breach/report", response_model=BreachIncidentResponse, summary="Report a breach incident")
async def report_breach_incident(
    req: BreachIncidentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
) -> BreachIncidentResponse:
    """Logs a new data breach incident for triage and regulatory board notification."""
    return await PrivacyService.report_breach_incident(req, db)
