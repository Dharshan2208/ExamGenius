import google.generativeai as genai
from app.core.config import settings
from app.models.syllabus import SyllabusAnalysisResponse, Topic
import json
import logging
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Gemini Configuration ---
def configure_gemini():
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        logger.info("Gemini API configured successfully.")
        # Perform a quick test listing models
        # models = genai.list_models()
        # if not any(m.name == 'models/gemini-1.5-flash' for m in models):
        #     logger.warning("gemini-1.5-flash model may not be available.")
    except Exception as e:
        logger.error(f"Error configuring Gemini API: {e}. Analysis will likely fail.")

# Configure on import
configure_gemini()

# --- Helper Functions ---
def clean_json_response(text: str) -> str:
    """Removes markdown fences and leading/trailing whitespace."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

async def _recursive_topic_processor(topic_data_list: list) -> tuple[list[Topic], float, list[Topic]]:
    """Recursively processes topics, validates, calculates hours, and finds priority."""
    validated_topics = []
    total_hours = 0.0
    priority_topics = []

    for topic_data in topic_data_list:
        subtopics, sub_hours, sub_priority = [], 0.0, []
        if topic_data.get('subtopics'):
            subtopics, sub_hours, sub_priority = await _recursive_topic_processor(topic_data['subtopics'])

        # Create Topic model, handle potential validation errors
        try:
            # Ensure estimated_hours is float or None
            hours = topic_data.get('estimated_hours')
            if hours is not None:
                try:
                    hours = float(hours)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid hours format '{hours}' for topic '{topic_data.get('name')}'. Setting to None.")
                    hours = None

            topic = Topic(
                name=topic_data.get('name', 'Unknown Topic'),
                importance=topic_data.get('importance', 'Medium'), # Default importance
                estimated_hours=hours,
                subtopics=subtopics
            )
        except Exception as e:
            logger.error(f"Error validating topic data: {topic_data}. Error: {e}")
            continue # Skip this invalid topic

        # Accumulate hours (use subtopic sum if parent has none)
        if not topic.subtopics and topic.estimated_hours is not None:
             topic_hours = topic.estimated_hours
        elif topic.subtopics and topic.estimated_hours is None:
             topic.estimated_hours = sub_hours # Assign sum to parent
             topic_hours = sub_hours
        elif topic.subtopics and topic.estimated_hours is not None:
            # If parent has hours AND subtopics have hours, prioritize parent's?
            # Or sum? Current logic assumes parent hour is override/aggregate.
            # Let's use parent if specified, otherwise sum. For now, use parent.
            topic_hours = topic.estimated_hours
        else: # No subtopics, no hours
             topic_hours = 0.0

        total_hours += topic_hours

        # Add to priority list
        if topic.importance and topic.importance.lower() == "high":
            priority_topics.append(topic)
        priority_topics.extend(sub_priority) # Add priority subtopics

        validated_topics.append(topic)

    return validated_topics, total_hours, priority_topics

# --- Main Service Function ---
async def analyze_syllabus(text_content: str) -> SyllabusAnalysisResponse:
    """
    Analyze syllabus content asynchronously using Google's Gemini API.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        logger.error(f"Failed to initialize Gemini Model: {e}")
        raise ValueError("Could not initialize AI model.") from e

    prompt = f"""
    Analyze the following syllabus content. Extract:
    1. A hierarchical list of all topics and subtopics.
    2. The relative importance of each topic/subtopic (High, Medium, Low).
    3. An estimated number of study hours needed for each lowest-level topic/subtopic.

    Format the response STRICTLY as a JSON object following this structure:
    {{
      "topics": [
        {{
          "name": "Topic Name",
          "importance": "High/Medium/Low",
          "estimated_hours": null, // Only add hours at the lowest level (leaf nodes)
          "subtopics": [
            {{
              "name": "Subtopic Name",
              "importance": "High/Medium/Low",
              "estimated_hours": 3.5, // e.g., hours only on leaf nodes
              "subtopics": []
            }}
            // ... more subtopics
          ]
        }}
        // ... more top-level topics
      ]
    }}

    Ensure the output is ONLY the JSON object, with no surrounding text or markdown.
    Assign hours only to leaf nodes (topics/subtopics with no further subtopics).
    Ensure topic names are descriptive and accurately reflect the syllabus section.

    Syllabus content:
    ---
    {text_content}
    ---
    """

    try:
        logger.info("Sending request to Gemini API...")
        # Use generate_content_async for non-blocking call
        response = await model.generate_content_async(prompt)

        logger.info("Received response from Gemini API.")
        raw_json = clean_json_response(response.text)

        if not raw_json.startswith("{") or not raw_json.endswith("}"):
             logger.error(f"Gemini response is not valid JSON format. Response: {raw_json[:500]}...")
             raise ValueError("AI model returned an invalid format.")

        parsed_data = json.loads(raw_json)
        raw_topics = parsed_data.get('topics', [])

        if not raw_topics:
             logger.warning("No topics extracted from syllabus by Gemini.")
             return SyllabusAnalysisResponse(topics=[], total_study_hours=0, priority_topics=[])

        # Process topics recursively
        logger.info("Processing extracted topics...")
        validated_topics, total_hours, priority_topics = await _recursive_topic_processor(raw_topics)
        logger.info(f"Processed {len(validated_topics)} top-level topics. Total hours: {total_hours}")

        return SyllabusAnalysisResponse(
            topics=validated_topics,
            total_study_hours=total_hours if total_hours > 0 else None,
            priority_topics=list({topic.name: topic for topic in priority_topics}.values()) # Deduplicate priority by name
        )

    except json.JSONDecodeError as e:
        logger.error(f"Error decoding Gemini JSON response: {e}. Raw response: {response.text if 'response' in locals() else 'N/A'}")
        raise ValueError("Failed to parse AI model response.") from e
    except Exception as e:
        # Catch other potential errors (API call issues, validation errors)
        logger.exception(f"An unexpected error occurred during syllabus analysis: {e}") # Log stack trace
        raise ValueError(f"An error occurred during syllabus analysis: {str(e)}") from e