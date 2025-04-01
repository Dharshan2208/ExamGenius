from fastapi import APIRouter, Query, Depends, HTTPException
from app.services.tavily_service import TavilyService, get_tavily_service
from app.services.resource_curation_service import ResourceCurationService, get_resource_curation_service
from app.models.resource import ResourceSearchResponse, TopicResourceResponse

router = APIRouter()

# Dependency to get TavilyService instance
# This allows for potential future setup/teardown or mocking
def get_tavily_service():
    return TavilyService()

@router.get("/search", response_model=ResourceSearchResponse)
async def search_resources(
    query: str = Query(..., description="The search query for finding resources."),
    max_results: int = Query(5, ge=1, le=10, description="Maximum number of search results."),
    tavily_service: TavilyService = Depends(get_tavily_service)
):
    """
    Search for relevant resources using the Tavily API based on a query.
    """
    print(f"Received search request for query: '{query}', max_results: {max_results}")
    try:
        results = await tavily_service.search_resources(query=query, max_results=max_results)
        if results.error:
            # If the service returned an error in the response object
            raise HTTPException(status_code=503, detail=results.error)
        print(f"Search successful. Found {len(results.results)} results.")
        return results
    except HTTPException as he:
        # Re-raise HTTPExceptions
        raise he
    except Exception as e:
        print(f"Unexpected error during resource search: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during resource search: {str(e)}")

# --- New Endpoint for Curated Topic Resources ---
@router.get("/topic", response_model=TopicResourceResponse)
async def get_resources_for_topic(
    topic_name: str = Query(..., description="The specific topic name to find curated resources for."),
    curation_service: ResourceCurationService = Depends(get_resource_curation_service)
):
    """
    Fetches curated learning resources (videos, articles) for a specific topic
    using Tavily search and LLM-based curation.
    """
    print(f"Received request to curate resources for topic: '{topic_name}'")
    if not topic_name:
        raise HTTPException(status_code=400, detail="Topic name cannot be empty.")

    try:
        # Call the curation service
        curated_resources = await curation_service.curate_resources(topic_name)

        if curated_resources.error:
            # Handle errors reported by the curation service
            # Map service errors to appropriate HTTP status codes if needed
            if "AI model component is not available" in curated_resources.error or \
               "AI model returned an invalid format" in curated_resources.error:
                status_code = 503 # Service Unavailable (dependent service issue)
            elif "Search failed" in curated_resources.error:
                 status_code = 504 # Gateway Timeout (upstream search issue)
            else:
                status_code = 500 # Internal Server Error (generic)
            raise HTTPException(status_code=status_code, detail=curated_resources.error)

        print(f"Successfully curated resources for topic: '{topic_name}'")
        return curated_resources

    except HTTPException as he:
        # Re-raise HTTPExceptions (e.g., from parameter validation)
        raise he
    except Exception as e:
        # Catch any other unexpected errors during the request handling
        print(f"Unexpected error in /topic endpoint for '{topic_name}': {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred while curating resources for the topic.")