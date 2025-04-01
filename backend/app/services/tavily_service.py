import logging
from tavily import TavilyClient
from app.core.config import settings
from app.models.resource import ResourceSearchResponse, SearchResultItem
from typing import Optional

logger = logging.getLogger(__name__)

class TavilyService:
    client: Optional[TavilyClient] = None

    def _initialize_client(self) -> Optional[TavilyClient]:
        """Initializes the Tavily client if not already done."""
        if self.client:
            return self.client

        if not settings.TAVILY_API_KEY or settings.TAVILY_API_KEY == "YOUR_TAVILY_API_KEY_HERE":
            logger.warning("Tavily API key is not configured. Tavily search will not work.")
            return None

        try:
            self.client = TavilyClient(api_key=settings.TAVILY_API_KEY)
            logger.info("Tavily client initialized successfully.")
            return self.client
        except Exception as e:
            logger.error(f"Error initializing Tavily client: {e}")
            self.client = None # Ensure client is None if init fails
            return None

    async def search_resources(self, query: str, max_results: int = 3) -> ResourceSearchResponse:
        """Performs a search using the Tavily API and returns structured results."""
        client = self._initialize_client()
        if not client:
            return ResourceSearchResponse(query=query, error="Tavily client is not initialized. Check API key configuration.")

        try:
            logger.info(f"Performing Tavily search for query: '{query}'")
            # Note: TavilyClient methods might not be async yet, run in thread pool if needed
            # For now, assume it's okay or use sync endpoint definition if necessary.
            response = client.search(query=query, search_depth="basic", max_results=max_results)
            logger.info(f"Tavily search successful for query: '{query}'")

            search_results = []
            if response and 'results' in response:
                for item in response['results']:
                    try:
                        search_results.append(SearchResultItem(
                            title=item.get('title', 'No Title'),
                            url=str(item.get('url', '')), # Ensure URL is string
                            content=item.get('content', ''),
                            score=item.get('score'),
                            raw_content=item.get('raw_content')
                        ))
                    except Exception as validation_error:
                        logger.warning(f"Skipping Tavily result due to validation error: {validation_error} - Item: {item}")

            return ResourceSearchResponse(
                query=query,
                results=search_results,
                answer=response.get('answer')
            )

        except Exception as e:
            logger.error(f"Error during Tavily search for query '{query}': {e}")
            return ResourceSearchResponse(query=query, error=f"An error occurred during resource search: {str(e)}")

# --- Dependency Provider (Lazy Initialization) ---
_tavily_service_instance: Optional[TavilyService] = None # Initialize as None

def get_tavily_service() -> TavilyService:
    global _tavily_service_instance
    if _tavily_service_instance is None:
        logger.info("Initializing TavilyService singleton instance.")
        _tavily_service_instance = TavilyService()
        _tavily_service_instance._initialize_client() # Try to init client right away, but allow failure
    return _tavily_service_instance

# Example usage (can be removed or kept for testing)
# async def main():
#     service = TavilyService()
#     if service.client:
#         results = await service.search_resources("Explain quantum computing")
#         print(results)
#
# if __name__ == "__main__":
#     import asyncio
#     asyncio.run(main())