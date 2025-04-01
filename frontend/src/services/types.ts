// Corresponds to backend/app/models/syllabus.py

export interface Topic {
  name: string;
  importance: "High" | "Medium" | "Low" | string; // Allow string for flexibility from LLM
  estimated_hours?: number | null;
  subtopics: Topic[];
}

export interface SyllabusAnalysisResponse {
  topics: Topic[];
  total_study_hours?: number | null;
  priority_topics: Topic[];
  // Add error field if backend might return errors within the response body
  // error?: string;
}

// Corresponds to backend/app/models/resource.py

export interface SearchResultItem {
  title: string;
  url: string; // Pydantic validates HttpUrl on backend, string is fine here
  content: string;
  score?: number | null;
  raw_content?: string | null;
}

export interface ResourceSearchResponse {
  query: string;
  results: SearchResultItem[];
  answer?: string | null; // Tavily might provide a summarized answer
  error?: string | null; // To pass back errors from the service
}

// Add other shared types here as needed

// Placeholder Types for Study Plan (backend/app/models/study_plan.py)
// These will likely evolve as the backend implementation progresses.

export interface StudyTask {
  id: string; // Unique ID for the task
  topic_name: string; // Reference to the syllabus topic
  description: string; // e.g., "Read chapter 5", "Complete practice problems"
  estimated_duration_minutes?: number;
  due_date?: string; // ISO date string
  completed: boolean;
  related_resources?: SearchResultItem[]; // Optional related resources
}

export interface StudySession {
  id: string;
  title: string; // e.g., "Week 1, Day 1", "Topic: Introduction to React"
  date?: string; // ISO date string
  tasks: StudyTask[];
  notes?: string;
}

export interface StudyPlanResponse {
  id: string; // ID of the generated plan
  title: string; // e.g., "Study Plan for CS101 Final Exam"
  sessions: StudySession[];
  total_estimated_hours?: number;
  // Add error field if needed
  error?: string;
}

// Add export keyword
export interface RecommendedResource {
  title: string;
  url: string; // Using string type from backend model
  explanation: string;
  type: string;
}

// Add export keyword
export interface TopicResourceResponse {
  topic_name: string;
  videos: RecommendedResource[];
  articles: RecommendedResource[];
  error?: string | null; // Match Optional[str]
}
