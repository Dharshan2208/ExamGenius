import * as api from "../services/api";

// This hook provides access to the API service functions.
// It could be expanded later to include context for API state, caching, etc.
export const useApi = () => {
  // Return the API functions directly for now
  // Could potentially wrap them or add context here later
  return {
    uploadSyllabus: api.uploadSyllabus,
    searchResources: api.searchResources,
    generateStudyPlan: api.generateStudyPlan,
    getCuratedResourcesForTopic: api.getCuratedResourcesForTopic,
  };
};
