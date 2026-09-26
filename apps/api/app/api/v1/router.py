from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.overview import router as overview_router
from app.domains.applications.router import router as applications_router
from app.domains.assessments.router import router as assessments_router
from app.domains.auth.router import router as auth_router
from app.domains.career_goals.router import router as career_goals_router
from app.domains.evidence.router import router as evidence_router
from app.domains.gaps.router import router as gaps_router
from app.domains.identity.router import router as identity_router
from app.domains.jobs.router import router as jobs_router
from app.domains.learning.router import router as learning_router
from app.domains.matching.router import router as matching_router
from app.domains.outcomes.router import router as outcomes_router
from app.domains.privacy.router import router as privacy_router
from app.domains.skills.router import router as skills_router
from app.domains.sources.router import router as sources_router

api_v1_router = APIRouter(prefix="/api/v1")

# Mount all domain routers
api_v1_router.include_router(health_router)
api_v1_router.include_router(overview_router)
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(privacy_router)
api_v1_router.include_router(identity_router)
api_v1_router.include_router(sources_router)
api_v1_router.include_router(evidence_router)
api_v1_router.include_router(skills_router)
api_v1_router.include_router(career_goals_router)
api_v1_router.include_router(jobs_router)
api_v1_router.include_router(matching_router)
api_v1_router.include_router(gaps_router)
api_v1_router.include_router(learning_router)
api_v1_router.include_router(assessments_router)
api_v1_router.include_router(applications_router)
api_v1_router.include_router(outcomes_router)

