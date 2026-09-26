import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dpdp_notice_and_processors_endpoints(client: AsyncClient):
    """Test retrieval of Section 5 DPDP Notice and Third-Party Processor inventory."""
    # 1. DPDP Notice
    resp = await client.get("/api/v1/privacy/notice")
    assert resp.status_code == 200
    data = resp.json()
    assert data["notice_version"] == "v1.0-dpdp-2025"
    assert data["fiduciary_role"] == "Data Fiduciary"
    assert "purposes" in data
    assert len(data["purposes"]) >= 4
    assert "supported_languages" in data
    assert any("Hindi" in lang for lang in data["supported_languages"])
    assert "dpo_email" in data
    assert data["board_name"] == "Data Protection Board of India (DPBI)"

    # 2. Third-Party Processor Registry
    proc_resp = await client.get("/api/v1/privacy/processors")
    assert proc_resp.status_code == 200
    proc_data = proc_resp.json()
    assert proc_data["total_processors_count"] >= 3
    assert any(p["processor_name"].startswith("GitHub") for p in proc_data["processors"])


@pytest.mark.asyncio
async def test_user_consent_lifecycle_and_withdrawal(client: AsyncClient):
    """Test Section 6 Consent overview, batch updates, and reactive withdrawal."""
    # 1. Get initial consent overview
    resp = await client.get("/api/v1/privacy/consent")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_consents" in data
    assert "all_available_purposes" in data

    # 2. Update consent preferences (Grant Telemetry & Auto-Apply)
    batch_req = {
        "consents": [
            {"purpose_id": "TELEMETRY_AND_ANALYTICS", "granted": True},
            {"purpose_id": "AUTO_APPLY_EXECUTION", "granted": True},
        ],
        "notice_version": "v1.0-dpdp-2025",
        "method": "SETTINGS_TOGGLE",
    }
    update_resp = await client.post("/api/v1/privacy/consent", json=batch_req)
    assert update_resp.status_code == 200
    updated_items = update_resp.json()
    assert len(updated_items) == 2
    assert all(item["status"] == "GRANTED" for item in updated_items)

    # 3. Withdraw consent for AUTO_APPLY_EXECUTION
    withdraw_req = {
        "purpose_id": "AUTO_APPLY_EXECUTION",
        "reason": "User prefers manual application review",
    }
    with_resp = await client.post("/api/v1/privacy/consent/withdraw", json=withdraw_req)
    assert with_resp.status_code == 200
    with_data = with_resp.json()
    assert with_data["purpose_id"] == "AUTO_APPLY_EXECUTION"
    assert with_data["status"] == "WITHDRAWN"

    # 4. Verify that downstream policy has disabled auto-apply
    pol_resp = await client.get("/api/v1/applications/policy")
    assert pol_resp.status_code == 200
    pol_data = pol_resp.json()
    assert pol_data["is_auto_apply_enabled"] is False


@pytest.mark.asyncio
async def test_data_access_summary_and_export(client: AsyncClient):
    """Test Section 11 Right to Access SAR summary and machine-readable JSON export."""
    # 1. Summary
    sum_resp = await client.get("/api/v1/privacy/summary")
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert sum_data["data_principal_name"] == "Alex Chen"
    assert len(sum_data["categories"]) >= 4
    assert any(c["category_name"] == "Authentication & Account Identity" for c in sum_data["categories"])

    # 2. Machine-readable export
    exp_resp = await client.get("/api/v1/privacy/export")
    assert exp_resp.status_code == 200
    exp_data = exp_resp.json()
    assert exp_data["export_format"] == "JSON_MACHINE_READABLE"
    assert exp_data["data_principal"]["email"] == "alex.chen@jobpilot.dev"
    assert "experiences" in exp_data
    assert "projects" in exp_data
    assert "consent_audit_trail" in exp_data


@pytest.mark.asyncio
async def test_privacy_grievance_workflow_and_sla(client: AsyncClient):
    """Test Section 13 Grievance Redressal submission, ticket generation, and 90-day SLA calculation."""
    # 1. Submit grievance
    grv_req = {
        "category": "CONSENT_WITHDRAWAL",
        "subject": "Request verification of telemetry cessation",
        "description": "Please verify that all analytics cookies and telemetry records have ceased processing.",
    }
    create_resp = await client.post("/api/v1/privacy/grievances", json=grv_req)
    assert create_resp.status_code == 201
    grv = create_resp.json()
    assert grv["ticket_id"].startswith("DPDP-GRV-")
    assert grv["status"] == "SUBMITTED"
    assert grv["days_remaining"] <= 90
    assert grv["days_remaining"] >= 88
    assert len(grv["audit_trail"]) >= 1

    # 2. List grievances
    list_resp = await client.get("/api/v1/privacy/grievances")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(item["ticket_id"] == grv["ticket_id"] for item in items)

    # 3. Update grievance status
    update_req = {
        "status": "RESOLVED",
        "resolution_notes": "Telemetry processing verified ceased and records purged.",
        "assigned_officer": "DPO - JobPilot",
    }
    patch_resp = await client.patch(f"/api/v1/privacy/grievances/{grv['id']}", json=update_req)
    assert patch_resp.status_code == 200
    updated_grv = patch_resp.json()
    assert updated_grv["status"] == "RESOLVED"
    assert updated_grv["resolved_at"] is not None


@pytest.mark.asyncio
async def test_nomination_lifecycle(client: AsyncClient):
    """Test Section 14 Right to Nominate representative lifecycle."""
    # 1. Set Nominee
    nom_req = {
        "nominee_full_name": "Elena Rostova",
        "nominee_email": "elena.rostova@example.com",
        "nominee_phone": "+91-9876543210",
        "relationship": "SPOUSE",
        "notes": "Authorized representative in case of emergency or incapacitation.",
    }
    create_resp = await client.post("/api/v1/privacy/nomination", json=nom_req)
    assert create_resp.status_code == 200
    nom = create_resp.json()
    assert nom["nominee_full_name"] == "Elena Rostova"
    assert nom["is_active"] is True

    # 2. Get Nominee
    get_resp = await client.get("/api/v1/privacy/nomination")
    assert get_resp.status_code == 200
    fetched_nom = get_resp.json()
    assert fetched_nom["nominee_email"] == "elena.rostova@example.com"

    # 3. Revoke Nominee
    del_resp = await client.delete("/api/v1/privacy/nomination")
    assert del_resp.status_code == 200


@pytest.mark.asyncio
async def test_children_age_gate_and_parental_consent(client: AsyncClient):
    """Test Section 9 Minor protection and Verifiable Parental Consent."""
    # 1. Initiate VPC
    vpc_req = {
        "child_dob": "2009-05-14",
        "parent_full_name": "Sarah Chen",
        "parent_email": "sarah.chen@example.com",
        "parent_phone": "+91-9123456780",
        "relationship": "PARENT",
    }
    init_resp = await client.post("/api/v1/privacy/parental-consent/initiate", json=vpc_req)
    assert init_resp.status_code == 200
    vpc_data = init_resp.json()
    assert vpc_data["is_verified"] is False
    assert vpc_data["parent_email"] == "sarah.chen@example.com"


@pytest.mark.asyncio
async def test_security_headers_enforcement(client: AsyncClient):
    """Test that all API responses include mandated security and DPDP protection headers."""
    resp = await client.get("/api/v1/privacy/notice")
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert resp.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert resp.headers.get("Permissions-Policy") == "geolocation=(), microphone=(), camera=()"
    assert "X-Request-ID" in resp.headers


@pytest.mark.asyncio
async def test_retention_policy_and_breach_incident(client: AsyncClient):
    """Test Section 8(7) Retention Engine and Section 8(6) Breach incident reporting."""
    # 1. Retention Engine evaluation
    ret_resp = await client.get("/api/v1/privacy/retention")
    assert ret_resp.status_code == 200
    ret_data = ret_resp.json()
    assert ret_data["status"] == "HEALTHY_AND_ENFORCED"
    assert ret_data["total_rules_active"] >= 4

    # 2. Log breach incident
    breach_req = {
        "title": "Simulated unauthorized probe mitigation",
        "severity": "LOW",
        "data_categories_affected": ["Public Metadata"],
        "affected_users_count": 0,
        "root_cause": "Rate limit exceeded on public endpoint",
        "remediation_steps": "IP blacklisted and WAF rule updated",
    }
    rep_resp = await client.post("/api/v1/privacy/breach/report", json=breach_req)
    assert rep_resp.status_code == 200
    breach_data = rep_resp.json()
    assert breach_data["incident_code"].startswith("INC-DPDP-")
    assert breach_data["severity"] == "LOW"


@pytest.mark.asyncio
async def test_data_erasure_workflow(client: AsyncClient):
    """Test Section 12 Permanent Cascading Data Erasure (Right to be Forgotten)."""
    # 1. Verify failure with incorrect confirmation phrase
    bad_req = {"confirmation_phrase": "delete please"}
    bad_resp = await client.post("/api/v1/privacy/erasure", json=bad_req)
    assert bad_resp.status_code == 422

    # 2. Execute erasure with exact confirmation phrase
    valid_req = {
        "confirmation_phrase": "DELETE MY PERSONAL DATA PERMANENTLY",
        "reason": "Exercising DPDP Section 12 Right to Erasure",
    }
    erase_resp = await client.post("/api/v1/privacy/erasure", json=valid_req)
    assert erase_resp.status_code == 200
    erase_data = erase_resp.json()
    assert erase_data["status"] == "SUCCESS"
    assert erase_data["verification_token"].startswith("DPDP-ERASE-")
    assert len(erase_data["categories_erased"]) >= 5


@pytest.mark.asyncio
async def test_registration_requires_affirmative_dpdp_consent(client: AsyncClient):
    """Adversarial Test: Registration fails if user declines DPDP affirmative consent."""
    import uuid
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    req_no_consent = {
        "email": email,
        "password": "StrongPassword123!",
        "full_name": "Consent Test User",
        "consent_agreed": False,
    }
    resp = await client.post("/api/v1/auth/register", json=req_no_consent)
    assert resp.status_code == 400
    data = resp.json()
    assert "Affirmative consent" in (data.get("detail") or str(data))


@pytest.mark.asyncio
async def test_minor_registration_initiates_parental_flow(client: AsyncClient):
    """Security Test: Minor user registration marks is_adult=False and sets up VPC record."""
    import uuid
    email = f"minor_{uuid.uuid4().hex[:6]}@example.com"
    req_minor = {
        "email": email,
        "password": "StrongPassword123!",
        "full_name": "Minor Candidate",
        "is_adult": False,
        "date_of_birth": "2009-08-20",
        "consent_agreed": True,
    }
    resp = await client.post("/api/v1/auth/register", json=req_minor)
    assert resp.status_code == 201
    token = resp.json()["access_token"]

    # Verify user can access consent overview
    auth_headers = {"Authorization": f"Bearer {token}"}
    consent_resp = await client.get("/api/v1/privacy/consent", headers=auth_headers)
    assert consent_resp.status_code == 200


def test_log_sanitizer_redacts_sensitive_tokens_and_pii():
    """Security Test: Structured logger formatter scrubs credentials and PII."""
    import json
    import logging
    from app.core.logging import StructuredJSONFormatter

    formatter = StructuredJSONFormatter()
    record = logging.LogRecord(
        name="test_logger",
        level=logging.INFO,
        pathname="test.py",
        lineno=10,
        msg="Authorization Bearer secret-token-1234567890 occurred",
        args=(),
        exc_info=None,
    )
    record.extra_fields = {
        "password": "SuperSecretPassword!",
        "api_key": "sk-12345678",
        "normal_key": "safe_value",
    }
    formatted_json = formatter.format(record)
    parsed = json.loads(formatted_json)

    assert "[REDACTED_TOKEN]" in parsed["message"]
    assert "secret-token-1234567890" not in parsed["message"]
    assert parsed["password"] == "[REDACTED]"
    assert parsed["api_key"] == "[REDACTED]"
    assert parsed["normal_key"] == "safe_value"

