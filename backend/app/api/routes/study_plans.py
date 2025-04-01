from fastapi import APIRouter, Depends, HTTPException
import logging

from app.services.langchain_service import LangChainService, get_langchain_service
from app.models.study_plan import StudyPlan, GenerateStudyPlanRequest

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# --- API Endpoints ---
@router.post("/generate", response_model=StudyPlan)
async def generate_study_plan_endpoint(
    request: GenerateStudyPlanRequest,
    langchain_service: LangChainService = Depends(get_langchain_service)
):
    """
    Receives syllabus topics and generates a study plan using LangChain.
    Includes fetching related resources via Tavily.
    """
    logger.info(f"Received request to generate study plan.")
    if not request.topics:
         raise HTTPException(status_code=400, detail="No topics provided for study plan generation.")

    try:
        study_plan = await langchain_service.generate_study_plan(request)
        logger.info(f"Study plan generated successfully: {study_plan.id}")
        return study_plan
    except ValueError as ve: # Catch specific errors from the service
        logger.error(f"Value error during study plan generation: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception("Unexpected error in study plan generation endpoint.") # Log stack trace
        raise HTTPException(status_code=500, detail="An internal error occurred while generating the study plan.")

# TODO: Add endpoints for getting, updating, deleting study plans if needed