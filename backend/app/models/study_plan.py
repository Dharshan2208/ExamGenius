from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
import uuid

# Remove StudyResource definition - it's moved to study_resource.py
# class StudyResource(BaseModel):
#     title: str
#     url: str

class StudyTask(BaseModel):
    id: str = Field(default_factory=lambda: f"task-{uuid.uuid4()}")
    topic_name: str
    description: str
    estimated_duration_minutes: Optional[int] = None
    due_date: Optional[date] = None
    completed: bool = False
    # related_resources should now use the imported type if strict typing is needed
    # For now, keep as list, LangChainService populates it with StudyResource instances
    related_resources: List = []
    # Optional: If adding suggested_search_query from LLM
    # suggested_search_query: Optional[str] = None

class StudySession(BaseModel):
    id: str = Field(default_factory=lambda: f"session-{uuid.uuid4()}")
    title: str
    date: Optional[str] = None
    tasks: List[StudyTask] = []
    notes: Optional[str] = None

class StudyPlan(BaseModel):
    id: str = Field(default_factory=lambda: f"plan-{uuid.uuid4()}")
    title: str = "Generated Study Plan"
    syllabus_analysis_id: Optional[str] = None # Link back to the analysis if stored
    sessions: List[StudySession] = []
    total_estimated_hours: Optional[float] = None

# Model for the request to generate a plan
class GenerateStudyPlanRequest(BaseModel):
    topics: List # Use raw list/dict from Gemini/Syllabus analysis for flexibility initially
    total_hours_available: Optional[float] = None
    # Add other parameters like start_date, weekly_hours, etc.

class StudyPlanRequest(BaseModel):
    topics: list[str]
    exam_date: str
    availability: dict

class DayPlan(BaseModel):
    topics: list[str]
    hours: int

class StudyPlanResponse(BaseModel):
    plan: dict[str, DayPlan]