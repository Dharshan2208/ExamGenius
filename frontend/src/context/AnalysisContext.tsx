import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { SyllabusAnalysisResponse } from '../services/types';

// Define the shape of the context data
interface AnalysisContextType {
  analysisResult: SyllabusAnalysisResponse | null;
  setAnalysisResult: Dispatch<SetStateAction<SyllabusAnalysisResponse | null>>;
  // Add other relevant states if needed, e.g., loading/error state specifically for analysis
}

// Create the context with a default value
const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Create a provider component
interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [analysisResult, setAnalysisResult] = useState<SyllabusAnalysisResponse | null>(null);

  const value = { analysisResult, setAnalysisResult };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Create a custom hook to use the context
export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};