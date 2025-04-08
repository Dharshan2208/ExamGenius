import groq
from app.core.config import settings
from app.models.syllabus import SyllabusAnalysisResponse, Topic
import json
import logging
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Groq Configuration ---
def configure_groq():
    try:
        # Initialize the Groq client
        client = groq.Client(api_key=settings.GROQ_API_KEY)
        logger.info("Groq API client configured successfully.")
        return client
    except Exception as e:
        logger.error(f"Error configuring Groq API: {e}. Analysis will likely fail.")
        return None

# --- Helper Functions ---
def clean_json_response(text: str) -> str:
    """Removes markdown fences and leading/trailing whitespace."""
    text = text.strip()
    # Handle cases where the response starts with triple backticks
    if text.startswith("```"):
        if "\n" in text:
            first_line_end = text.find("\n")
            text = text[first_line_end:].strip()
        else:
            text = text[3:].strip()
    
    # Handle cases with explicit ```json format
    if text.startswith("```json"):
        text = text[7:].strip()
    
    # Handle cases where the response ends with triple backticks
    if text.endswith("```"):
        text = text[:-3].strip()
    
    # Handle any trailing or leading whitespace
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
    Analyze syllabus content asynchronously using Groq API.
    """
    try:
        client = configure_groq()
        if not client:
            raise ValueError("Could not initialize Groq API client.")
    except Exception as e:
        logger.error(f"Failed to initialize Groq Client: {e}")
        raise ValueError("Could not initialize AI model.") from e

    prompt = f"""
You are an expert curriculum analyzer. Your task is to meticulously analyze the provided syllabus content and extract specific information.

**Analysis Requirements:**

1.  **Hierarchical Structure:** Identify all topics and subtopics mentioned in the syllabus. Organize them into a hierarchical list, accurately reflecting the structure presented or implied in the text.
2.  **Relative Importance:** Assign a relative importance level ("High", "Medium", or "Low") to *each* topic and subtopic.
    *   **Basis for Importance:** Prioritize explicit cues in the syllabus (e.g., stated weightage, time allocation, required vs. optional).
    *   **Inference:** If no explicit cues exist, infer importance based on factors like: position in the syllabus (early topics are often foundational), depth of coverage, or whether it seems like a core concept versus a supporting detail or example. Default to "Medium" if uncertain but crucial. Assign "High" to clearly major sections/foundational concepts, and "Low" to supplementary or minor points.
3.  **Estimated Study Hours:** Estimate the number of study hours required *only* for the lowest-level topics/subtopics (i.e., leaf nodes in the hierarchy – those with no further subtopics listed under them).
    *   **Basis for Hours:** Use any time allocations mentioned in the syllabus as the primary guide.
    *   **Inference:** If no specific times are given, estimate hours based on the perceived complexity, depth, and relative importance of the leaf-node content. Ensure the hours reflect the importance (e.g., a 'High' importance leaf node should generally have more estimated hours than a 'Low' one). Provide estimates as numbers (e.g., `2`, `4.5`).
    *   **Parent Nodes:** All topics/subtopics that have further subtopics *must* have `estimated_hours: null`.

**Output Format:**

*   Format the *entire* output as a single, valid JSON object.
*   Strictly adhere to the following JSON structure:

```json
{{
  "topics": [
    {{
      "name": "Topic Name", // Concise yet descriptive name
      "importance": "High/Medium/Low",
      "estimated_hours": null, // Always null for parent topics
      "subtopics": [
        {{
          "name": "Subtopic Name",
          "importance": "High/Medium/Low",
          "estimated_hours": null, // Null if it has further subtopics
          "subtopics": [
            {{
              "name": "Lowest-Level Subtopic Name",
              "importance": "High/Medium/Low",
              "estimated_hours": 3.5, // Numeric value ONLY for leaf nodes
              "subtopics": [] // Empty list for leaf nodes
            }}
          ]
        }},
        {{
          "name": "Another Lowest-Level Subtopic Name",
          "importance": "High/Medium/Low",
          "estimated_hours": 2.0, // Numeric value ONLY for leaf nodes
          "subtopics": []
        }}
        // ... more subtopics
      ]
    }}
    // ... more top-level topics
  ]
}}
```

**VERY IMPORTANT:**

1. The output MUST be a valid JSON object
2. DO NOT include any markdown formatting (no ``` or ```json)
3. DO NOT include any explanation or text before or after the JSON
4. Return ONLY the JSON object itself
5. Assign hours only to leaf nodes (topics/subtopics with no further subtopics)
6. Ensure topic names are descriptive and accurately reflect the syllabus section

Syllabus content:
---
{text_content}
---
    """

    try:
        logger.info("Sending request to Groq API...")
        # Use Groq's chat completion API
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model="llama3-8b-8192",  # Using more stable Llama 3 8B model
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs only valid JSON without markdown formatting."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,  # Lower temperature for more deterministic output
            max_tokens=5000,   # Updated to match the specified token limit
            response_format={"type": "json_object"}  # Force JSON format
        )

        logger.info("Received response from Groq API.")
        raw_json = clean_json_response(response.choices[0].message.content)
        
        # Log the cleaned response for debugging
        logger.info(f"Cleaned response: {raw_json[:100]}...")
        
        try:
            # Try to parse the JSON regardless of format checks
            parsed_data = json.loads(raw_json)
            
            # Validate the parsed data has the expected structure
            if 'topics' not in parsed_data:
                logger.error(f"Missing 'topics' key in response: {raw_json[:200]}...")
                raise ValueError("AI model returned an incomplete response without topics.")
                
            raw_topics = parsed_data.get('topics', [])
            
            if not raw_topics:
                logger.warning("No topics extracted from syllabus by Groq.")
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
            # If JSON parsing fails, try to extract JSON from the response
            logger.error(f"Error decoding JSON: {e}. Attempting to extract JSON manually...")
            
            # Try to find JSON object between curly braces
            start_idx = raw_json.find('{')
            end_idx = raw_json.rfind('}')
            
            if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                extracted_json = raw_json[start_idx:end_idx+1]
                logger.info(f"Manually extracted JSON: {extracted_json[:100]}...")
                
                try:
                    parsed_data = json.loads(extracted_json)
                    
                    if 'topics' not in parsed_data:
                        logger.error("Missing 'topics' key in extracted JSON.")
                        raise ValueError("AI model returned an incomplete response without topics.")
                        
                    raw_topics = parsed_data.get('topics', [])
                    
                    if not raw_topics:
                        logger.warning("No topics extracted from syllabus by Groq.")
                        return SyllabusAnalysisResponse(topics=[], total_study_hours=0, priority_topics=[])
                        
                    # Process topics recursively
                    logger.info("Processing extracted topics...")
                    validated_topics, total_hours, priority_topics = await _recursive_topic_processor(raw_topics)
                    logger.info(f"Processed {len(validated_topics)} top-level topics. Total hours: {total_hours}")
                    
                    return SyllabusAnalysisResponse(
                        topics=validated_topics,
                        total_study_hours=total_hours if total_hours > 0 else None,
                        priority_topics=list({topic.name: topic for topic in priority_topics}.values())
                    )
                except json.JSONDecodeError:
                    logger.error("Failed to parse manually extracted JSON.")
                    
            # If all attempts fail, raise the original error
            raise ValueError("Failed to parse AI model response. The response format was not valid JSON.") from e

    except Exception as e:
        # Catch other potential errors (API call issues, validation errors)
        logger.exception(f"An unexpected error occurred during syllabus analysis: {e}") # Log stack trace
        raise ValueError(f"An error occurred during syllabus analysis: {str(e)}") from e
