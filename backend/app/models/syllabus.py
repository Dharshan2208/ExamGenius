from pydantic import BaseModel
from typing import List, Optional

class SyllabusUploadRequest(BaseModel):
    courseName: str
    examDate: str

class Topic(BaseModel):
    name: str
    importance: str # e.g., high, medium, low
    estimated_hours: Optional[float] = None
    subtopics: List['Topic'] = []

# Allow Topic to reference itself for subtopics
Topic.model_rebuild()

class SyllabusResponse(BaseModel):
    topics: list[Topic]

class SyllabusAnalysisResponse(BaseModel):
    topics: List[Topic]
    total_study_hours: Optional[float] = None
    priority_topics: List[Topic] = []