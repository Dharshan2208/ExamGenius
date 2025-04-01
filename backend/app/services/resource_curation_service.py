import logging
import json
from typing import List, Optional

from pydantic import BaseModel
from app.core.config import settings
from app.models.resource import SearchResultItem, RecommendedResource, TopicResourceResponse
from app.services.tavily_service import TavilyService, get_tavily_service

# LangChain components
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.exceptions import OutputParserException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResourceCurationService:
    def __init__(self, tavily_service: TavilyService):
        self.tavily_service = tavily_service
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.5, # Slightly lower temp for more focused curation
                convert_system_message_to_human=True
            )
            logger.info("ResourceCurationService: LLM (ChatGoogleGenerativeAI) initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing LLM for ResourceCurationService: {e}")
            self.llm = None

    async def curate_resources(self, topic_name: str) -> TopicResourceResponse:
        if not self.llm:
            logger.error("LLM not initialized. Cannot curate resources.")
            return TopicResourceResponse(topic_name=topic_name, error="AI model component is not available.")

        logger.info(f"Starting resource curation for topic: '{topic_name}'")

        # 1. Search with Tavily
        try:
            search_query = f"beginner to intermediate tutorials and articles for {topic_name}"
            logger.info(f"Performing Tavily search with query: '{search_query}'")
            # Fetch more results to give the LLM a better selection pool
            search_response = await self.tavily_service.search_resources(search_query, max_results=10)
            if search_response.error:
                logger.error(f"Tavily search failed for topic '{topic_name}': {search_response.error}")
                return TopicResourceResponse(topic_name=topic_name, error=f"Search failed: {search_response.error}")
            if not search_response.results:
                 logger.warning(f"Tavily search returned no results for topic '{topic_name}'")
                 return TopicResourceResponse(topic_name=topic_name) # Return empty lists, not an error

            logger.info(f"Tavily returned {len(search_response.results)} results for topic '{topic_name}'.")
            # Prepare results for LLM (limit context size)
            tavily_results_simplified = [
                {"title": r.title, "url": r.url, "content_snippet": r.content[:200]} # Send only snippets
                for r in search_response.results
            ]

        except Exception as e:
            logger.exception(f"An unexpected error occurred during Tavily search for topic '{topic_name}'.")
            return TopicResourceResponse(topic_name=topic_name, error="An unexpected error occurred during resource search.")

        # 2. Curate with LLM
        # Define Pydantic Output Parser (for the part LLM needs to generate)
        class LLMCurationOutput(BaseModel):
            videos: List[RecommendedResource] = []
            articles: List[RecommendedResource] = []

        curation_parser = PydanticOutputParser(pydantic_object=LLMCurationOutput)

        system_prompt_text = ("""
            You are an expert learning resource curator. Analyze the provided search results for a specific topic.
            Your task is to select the best resources (up to 3 videos and up to 3 articles/written tutorials) that are:

            1. Directly relevant to the specific topic: '{topic_name}'.

            2. Suitable for a beginner to intermediate skill level.

            3. From reputable sources (e.g., official documentation, well-known educational platforms like YouTube (for tutorials), Udemy, Coursera, Khan Academy, respected blogs, technical sites). Avoid forums/Q&A sites unless the content is exceptionally structured like a tutorial.

            For each selected resource, provide:

            - The original title and URL.

            - A concise explanation (1-2 sentences) of *why* this specific resource is valuable for learning *this specific topic* at a beginner/intermediate level.

            - The type ('video' or 'article').

            Format your response ONLY as a JSON object conforming to the specified Pydantic schema below. Ensure URLs are valid.

            {format_instructions}
            """
        )

        human_prompt_text = (
            "Please curate resources for the topic: '{topic_name}' based on these search results:\n\n"
            "{search_results_json}\n\n"
            "Remember to only include resources directly addressing '{topic_name}' and suitable for beginners/intermediates. Provide explanations for each selection."
        )

        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(system_prompt_text),
            HumanMessagePromptTemplate.from_template(human_prompt_text)
        ])

        chain = prompt_template | self.llm | curation_parser

        try:
            logger.info(f"Invoking LLM chain for topic '{topic_name}' curation...")
            curation_result: LLMCurationOutput = await chain.ainvoke({
                "topic_name": topic_name,
                "search_results_json": json.dumps(tavily_results_simplified, indent=2),
                "format_instructions": curation_parser.get_format_instructions(),
            })
            logger.info(f"Successfully curated resources for topic '{topic_name}'. Found {len(curation_result.videos)} videos and {len(curation_result.articles)} articles.")

            # Construct the final response
            return TopicResourceResponse(
                topic_name=topic_name,
                videos=curation_result.videos,
                articles=curation_result.articles
            )

        except OutputParserException as e:
             logger.error(f"Failed to parse LLM curation output for topic '{topic_name}': {e}")
             # Optionally: Include raw output in log: logger.error(f"Raw output: {e.llm_output}")
             return TopicResourceResponse(topic_name=topic_name, error="AI model returned an invalid format for curated resources.")
        except Exception as e:
            logger.exception(f"An unexpected error occurred during LLM curation for topic '{topic_name}'.")
            return TopicResourceResponse(topic_name=topic_name, error="An unexpected error occurred during resource curation.")

# --- Dependency Provider ---
_resource_curation_service_instance: Optional[ResourceCurationService] = None

def get_resource_curation_service() -> ResourceCurationService:
    global _resource_curation_service_instance
    if _resource_curation_service_instance is None:
        logger.info("Initializing ResourceCurationService singleton instance.")
        tavily_service = get_tavily_service()
        _resource_curation_service_instance = ResourceCurationService(tavily_service=tavily_service)
    if _resource_curation_service_instance.llm is None:
         logger.error("ResourceCurationService LLM failed to initialize earlier. Curation will fail.")

    return _resource_curation_service_instance