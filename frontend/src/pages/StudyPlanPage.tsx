import React from 'react';
import { Container, Alert } from '@mui/material';
// Remove unused Typography, Box
// import { Typography, Box } from '@mui/material';
// Import the actual StudyPlan component
import StudyPlan from '../components/features/StudyPlan';
// Removed SyllabusAnalysisResponse import
import { useAnalysis } from '../context/AnalysisContext'; // Import useAnalysis

const StudyPlanPage: React.FC = () => {
  const { analysisResult } = useAnalysis(); // Get analysis from context

  // --- Remove MOCK DATA ---
  // const [mockAnalysis, setMockAnalysis] = useState<SyllabusAnalysisResponse | null>(null);
  // React.useEffect(() => { ... });
  // --- END MOCK DATA ---

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
       {/* Show info alert only if analysis isn't available */}
       {!analysisResult && (
          <Alert severity="info" sx={{ mb: 2 }}>
              Please upload and analyze a syllabus first to generate a study plan.
          </Alert>
       )}
       {/* Remove analysis prop - StudyPlan gets it from context */}
      <StudyPlan />
    </Container>
  );
};

export default StudyPlanPage;