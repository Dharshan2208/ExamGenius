from pydantic import BaseModel

class StudyResource(BaseModel):
    title: str
    url: str # Keep as string, validation can happen elsewhere if needed
