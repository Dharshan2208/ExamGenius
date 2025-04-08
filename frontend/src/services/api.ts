import {
  SyllabusAnalysisResponse,
  ResourceSearchResponse,
  Topic,
  StudyPlanResponse,
  TopicResourceResponse,
} from "./types";

// Use Render environment variable for the *full* backend API base URL in production/preview,
// otherwise default for local dev
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"; // Keep local default

/**
 * Uploads a syllabus file to the backend for analysis.
 * @param file The syllabus file (PDF, DOCX, TXT).
 * @returns A promise resolving to the SyllabusAnalysisResponse.
 */
export const uploadSyllabus = async (
  file: File
): Promise<SyllabusAnalysisResponse> => {
  console.log('uploadSyllabus called with file:', file.name, 'size:', file.size, 'type:', file.type);
  console.log('API_BASE_URL:', API_BASE_URL);
  
  const formData = new FormData();
  formData.append("file", file);

  // Log FormData (this is limited due to FormData's nature)
  console.log('FormData created with file appended');
  
  try {
    console.log(`Making fetch request to ${API_BASE_URL}/syllabus/upload`);
    const response = await fetch(`${API_BASE_URL}/syllabus/upload`, {
      method: "POST",
      body: formData,
      // No 'Content-Type' header needed; browser sets it correctly for FormData
    });
    
    console.log('Fetch response received:', response.status, response.statusText);

    if (!response.ok) {
      // Attempt to parse error details from the backend response
      let errorDetail = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail; // FastAPI often uses 'detail' key
      } catch (e) {
        // Ignore if response is not JSON or empty
        console.error("Could not parse error response body", e);
      }
      console.error("Syllabus upload failed:", errorDetail);
      throw new Error(`Syllabus upload failed: ${errorDetail}`);
    }

    // Check content type before parsing JSON
    const contentType = response.headers.get("content-type");
    console.log('Response content-type:', contentType);
    
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      console.log('Parsed JSON response:', data);
      return data as SyllabusAnalysisResponse;
    } else {
      const textResponse = await response.text();
      console.error("Received non-JSON response:", textResponse);
      throw new Error("Received unexpected response format from server.");
    }
  } catch (error) {
    console.error('Error in uploadSyllabus:', error);
    throw error;
  }
};

/**
 * Searches for resources using the backend Tavily integration.
 * @param query The search query string.
 * @param max_results Maximum number of results to fetch (optional, defaults to backend default).
 * @returns A promise resolving to the ResourceSearchResponse.
 */
export const searchResources = async (
  query: string,
  max_results?: number
): Promise<ResourceSearchResponse> => {
  const params = new URLSearchParams({ query });
  if (max_results !== undefined) {
    params.append("max_results", max_results.toString());
  }

  const response = await fetch(
    `${API_BASE_URL}/resources/search?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    let errorDetail = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (e) {
      console.error("Could not parse error response body", e);
    }
    console.error("Resource search failed:", errorDetail);
    throw new Error(`Resource search failed: ${errorDetail}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const data = (await response.json()) as ResourceSearchResponse;
    if (data.error) {
      console.error("Backend resource search error:", data.error);
      throw new Error(`Resource search failed: ${data.error}`);
    }
    return data;
  } else {
    const textResponse = await response.text();
    console.error("Received non-JSON response:", textResponse);
    throw new Error("Received unexpected response format from server.");
  }
};

/**
 * Generates a study plan by calling the backend endpoint.
 * @param topics The list of topics from syllabus analysis.
 * @param total_hours_available The total study hours available (optional).
 * @returns A promise resolving to the StudyPlanResponse.
 */
export const generateStudyPlan = async (
  topics: Topic[],
  total_hours_available?: number
): Promise<StudyPlanResponse> => {
  console.log("Sending request to generate study plan with:", {
    topics,
    total_hours_available,
  });

  const response = await fetch(`${API_BASE_URL}/study-plans/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topics: topics, // Send the topics array
      total_hours_available: total_hours_available, // Send optional hours
    }),
  });

  if (!response.ok) {
    let errorDetail = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (e) {
      console.error(
        "Could not parse error response body for study plan generation",
        e
      );
    }
    console.error("Study plan generation failed:", errorDetail);
    throw new Error(`Study plan generation failed: ${errorDetail}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const data = (await response.json()) as StudyPlanResponse;
    // Check if the backend response contains an error (though it should use HTTP status)
    if (data.error) {
      console.error("Backend study plan generation error:", data.error);
      throw new Error(`Study plan generation failed: ${data.error}`);
    }
    console.log("Received study plan:", data);
    return data;
  } else {
    const textResponse = await response.text();
    console.error("Received non-JSON response for study plan:", textResponse);
    throw new Error(
      "Received unexpected response format from server for study plan."
    );
  }
};

/**
 * Fetches curated resources for a specific topic.
 * @param topicName The name of the topic.
 * @returns A promise resolving to the TopicResourceResponse.
 */
export const getCuratedResourcesForTopic = async (
  topicName: string
): Promise<TopicResourceResponse> => {
  const encodedTopicName = encodeURIComponent(topicName);
  const response = await fetch(
    `${API_BASE_URL}/resources/topic?topic_name=${encodedTopicName}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    let errorDetail = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (e) {
      console.error(
        "Could not parse error response body for topic resources",
        e
      );
    }
    console.error("Topic resource fetch failed:", errorDetail);
    // Return an object indicating error, consistent with TopicResourceResponse structure
    return {
      topic_name: topicName,
      videos: [],
      articles: [],
      error: `Topic resource fetch failed: ${errorDetail}`,
    };
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const data = (await response.json()) as TopicResourceResponse;
    // Add topic_name if backend doesn't explicitly return it (good practice though)
    if (!data.topic_name) {
      data.topic_name = topicName;
    }
    // Check for errors within the response body itself
    if (data.error) {
      console.error(
        `Backend error fetching resources for ${topicName}:`,
        data.error
      );
      // Return the error within the response structure
      return data;
    }
    return data;
  } else {
    const textResponse = await response.text();
    console.error(
      "Received non-JSON response for topic resources:",
      textResponse
    );
    return {
      topic_name: topicName,
      videos: [],
      articles: [],
      error: "Received unexpected response format from server.",
    };
  }
};

// Add other API functions here (e.g., searchResources)
