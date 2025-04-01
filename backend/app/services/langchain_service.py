import logging
import json
from typing import List, Dict, Optional
import asyncio

from app.core.config import settings
from app.models.study_plan import StudyPlan, StudySession, StudyTask, GenerateStudyPlanRequest
from app.models.syllabus import Topic # Assuming Topic model is used/available from syllabus analysis
from app.models.study_resource import StudyResource
from app.services.tavily_service import TavilyService, get_tavily_service

# LangChain components
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser, PydanticOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.exceptions import OutputParserException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LangChainService:
    def __init__(self, tavily_service: TavilyService):
        self.tavily_service = tavily_service
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.6,
                convert_system_message_to_human=True
            )
            logger.info("LangChain LLM (ChatGoogleGenerativeAI) initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing LangChain LLM: {e}")
            self.llm = None

    async def _fetch_resources_for_task(self, task: StudyTask, suggested_query: Optional[str]) -> List[StudyResource]:
        if not suggested_query and not task.description:
            return [] # Cannot search without a query

        # Prefer suggested query, fall back to task description
        search_query = suggested_query if suggested_query else f"Resources for: {task.description}"

        try:
            search_response = await self.tavily_service.search_resources(search_query, max_results=2) # Fetch 2 results per task
            if search_response.error:
                logger.warning(f"Tavily search failed for query '{search_query}': {search_response.error}")
                return []

            # Convert SearchResultItem to StudyResource
            resources = [
                StudyResource(title=item.title, url=str(item.url))
                for item in search_response.results
            ]
            logger.info(f"Found {len(resources)} resources for task '{task.description}' query: '{search_query}'")
            return resources
        except Exception as e:
            logger.error(f"Error fetching resources for task '{task.description}' query '{search_query}': {e}")
            return []

    async def generate_study_plan(self, request: GenerateStudyPlanRequest) -> StudyPlan:
        if not self.llm:
            logger.error("LLM not initialized. Cannot generate study plan.")
            raise ValueError("AI model component is not available.")

        logger.info(f"Generating study plan structure for {len(request.topics)} topics...")

        # --- Define Pydantic Output Parser ---
        plan_parser = PydanticOutputParser(pydantic_object=StudyPlan)

        # --- Define Prompt Template (Enhanced) ---
        system_prompt_text = (
            "You are an expert academic planner. Create a structured study plan based on the provided topics, their importance, and estimated hours. "
            "Organize the plan into logical study sessions (e.g., daily or weekly). For each session, list specific, actionable tasks. "
            "\n**Prioritization:** Prioritize topics marked as 'High' importance. Schedule them earlier in the plan and allocate sufficient time for thorough understanding before moving to lower-priority items. Follow the Pareto principle by focusing effort on these key topics.\n"
            "Assign estimated durations (in minutes) to each task based on the overall topic hours. "
            "For each task, also suggest a concise, effective web search query (`suggested_search_query`) that a student could use to find relevant resources for that specific task. "
            "Format the output ONLY as a JSON object conforming to the specified Pydantic models (StudyPlan, StudySession, StudyTask). "
            "Include fields: id (use placeholders like 'plan-1', 'session-1', 'task-1-1'), title, date (e.g., 'Day 1' or 'Week 1'), "
            "tasks (with id, topic_name, description, estimated_duration_minutes, completed=false, suggested_search_query). "
            "Do NOT include the related_resources field in your JSON output; it will be populated later."
        )

        human_prompt_text = (
             "Generate the study plan based on these topics, ensuring high-importance topics are prioritized:\n\n"
             "{topics_json}\n\n"
             "{format_instructions}" # Instructions from Pydantic parser
        )

        prompt_template = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(system_prompt_text),
            HumanMessagePromptTemplate.from_template(human_prompt_text)
        ])

        # --- Create LangChain Chain ---
        chain = (
            RunnablePassthrough.assign(topics_json=lambda x: json.dumps(x['topics'], indent=2))
            | prompt_template
            | self.llm
            | plan_parser
        )

        # --- Invoke Chain and Get Initial Plan ---
        try:
            logger.info("Invoking LangChain study plan structure generation chain...")
            initial_plan : StudyPlan = await chain.ainvoke({
                "topics": request.topics,
                "format_instructions": plan_parser.get_format_instructions(),
            })
            logger.info(f"Successfully generated and parsed initial study plan structure: {initial_plan.id}")

        except OutputParserException as e:
             logger.error(f"Failed to parse LLM output directly with Pydantic parser: {e}")
             raise ValueError("AI model returned an invalid format for the study plan structure.") from e
        except Exception as e:
            logger.exception(f"An unexpected error occurred during initial study plan generation: {e}")
            raise ValueError(f"An error occurred during initial study plan generation: {str(e)}") from e

        # --- Fetch Resources Concurrently ---
        logger.info(f"Fetching resources for {sum(len(s.tasks) for s in initial_plan.sessions)} tasks...")
        resource_fetch_tasks = []
        tasks_to_update_map = {}

        for session in initial_plan.sessions:
            for task in session.tasks:
                # WORKAROUND: Use description as query source
                suggested_query = f"Study resources for {task.description}"
                fetch_task = self._fetch_resources_for_task(task, suggested_query)
                resource_fetch_tasks.append(fetch_task)
                tasks_to_update_map[id(task)] = task

        all_resource_results = await asyncio.gather(*resource_fetch_tasks)

        # --- Populate Plan with Resources ---
        logger.info("Populating study plan with fetched resources...")
        resource_idx = 0
        for session in initial_plan.sessions:
            updated_tasks = []
            for task in session.tasks:
                 if id(task) in tasks_to_update_map and resource_idx < len(all_resource_results):
                     task.related_resources = all_resource_results[resource_idx]
                     resource_idx += 1
                 updated_tasks.append(task)
            session.tasks = updated_tasks

        logger.info(f"Finished populating study plan with resources: {initial_plan.id}")
        return initial_plan

    async def prioritize_topics_with_pareto(self, topics: List[Dict]) -> List[Dict]:
        logger.info(f"Prioritizing {len(topics)} topics (simple sort by importance)...")
        try:
            importance_map = {"high": 3, "medium": 2, "low": 1}
            sorted_topics = sorted(
                topics,
                key=lambda t: importance_map.get(str(t.get('importance', '')).lower(), 0),
                reverse=True
            )
            return sorted_topics
        except Exception as e:
             logger.warning(f"Could not sort topics by importance: {e}")
             return topics

# --- Dependency Provider (Lazy Initialization) ---
_langchain_service_instance: Optional[LangChainService] = None # Initialize as None

def get_langchain_service() -> LangChainService:
    """Provides a singleton instance of the LangChainService, initialized lazily."""
    global _langchain_service_instance
    if _langchain_service_instance is None:
        logger.info("Initializing LangChainService singleton instance.")
        # Get the dependency lazily too
        tavily_service = get_tavily_service()
        _langchain_service_instance = LangChainService(tavily_service=tavily_service)

    # Optional: Add check here if LLM failed init and maybe try again or raise
    if _langchain_service_instance.llm is None:
        logger.error("LangChain LLM failed to initialize earlier. Study plan generation will fail.")
        # Depending on desired behavior, you could try re-initializing or just let it fail in the endpoint

    return _langchain_service_instance

    # Add other LangChain related methods as needed (e.g., document processing)