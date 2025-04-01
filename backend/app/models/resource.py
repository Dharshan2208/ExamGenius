from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Any

class Resource(BaseModel):
    title: str
    url: str
    snippet: str

class SearchResultItem(BaseModel):
    title: str
    url: str # Keep as str for flexibility, validate later if needed
    content: str
    score: Optional[float] = None # Tavily provides a relevance score
    raw_content: Optional[Any] = None # Can be complex, keep as Any

class ResourceSearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem] = []
    answer: Optional[str] = None # Tavily might provide a direct answer
    error: Optional[str] = None # To pass back errors from the service

# New Models for Curated Topic Resources
class RecommendedResource(BaseModel):
    title: str
    url: HttpUrl # Use HttpUrl for validation
    explanation: str = Field(..., description="Brief explanation of why the resource is valuable for the topic.")
    type: str = Field(..., description="Type of resource, e.g., 'video' or 'article'.")

class TopicResourceResponse(BaseModel):
    topic_name: str
    videos: List[RecommendedResource] = []
    articles: List[RecommendedResource] = []
    error: Optional[str] = None