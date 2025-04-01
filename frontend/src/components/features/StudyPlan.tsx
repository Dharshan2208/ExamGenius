import React, { useState, useCallback } from 'react';
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useApi } from '../../hooks/useApi';
import { useAnalysis } from '../../context/AnalysisContext';
import {
  StudyPlanResponse,
} from '../../services/types';

const StudyPlan: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const { generateStudyPlan } = useApi();
  const { analysisResult } = useAnalysis();

  const handleGeneratePlan = useCallback(async () => {
    if (!analysisResult || !analysisResult.topics || analysisResult.topics.length === 0) {
      setError('Cannot generate study plan without analyzed syllabus topics. (Hint: Upload a syllabus first)');
      return;
    }

    setLoading(true);
    setError(null);
    setStudyPlan(null);

    try {
      const planResult = await generateStudyPlan(
          analysisResult.topics,
          analysisResult.total_study_hours ?? undefined
      );
      if (planResult.error) {
          throw new Error(planResult.error);
      }
      setStudyPlan(planResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred generating the plan.';
      setError(errorMessage);
      console.error("Study plan generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [analysisResult, generateStudyPlan]);

  const handleToggleTask = (sessionId: string, taskId: string) => {
    console.log(`Toggle task ${taskId} in session ${sessionId}`);
    setStudyPlan((prevPlan) => {
      if (!prevPlan) return null;
      return {
        ...prevPlan,
        sessions: prevPlan.sessions.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              tasks: session.tasks.map((task) => {
                if (task.id === taskId) {
                  return { ...task, completed: !task.completed };
                }
                return task;
              }),
            };
          }
          return session;
        }),
      };
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Your Study Plan
        </Typography>
        <Button
          variant="contained"
          onClick={handleGeneratePlan}
          disabled={loading || !analysisResult || !analysisResult.topics.length}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Plan'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!studyPlan && !loading && !error && (
          <Typography color="text.secondary">
              {analysisResult && analysisResult.topics.length > 0
                ? "Click 'Generate Plan' to create a study schedule based on your syllabus analysis."
                : "Upload and analyze a syllabus first to generate a study plan."
              }
          </Typography>
      )}

      {studyPlan && (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Plan Title: {studyPlan.title}
            </Typography>
            {studyPlan.total_estimated_hours != null && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Estimated Hours: {studyPlan.total_estimated_hours.toFixed(1)}
                </Typography>
            )}

          {studyPlan.sessions.length > 0 ? (
            studyPlan.sessions.map((session) => (
              <Accordion key={session.id} defaultExpanded sx={{ my: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`session-${session.id}-content`}
                  id={`session-${session.id}-header`}
                >
                  <Typography sx={{ flexShrink: 0, mr: 2 }}>{session.title}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{session.date}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {session.tasks.map((task) => (
                      <ListItem
                        key={task.id}
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={task.completed}
                            onChange={() => handleToggleTask(session.id, task.id)}
                            inputProps={{ 'aria-labelledby': `task-label-${task.id}` }}
                          />
                        }
                        disablePadding
                      >
                        <ListItemText
                          id={`task-label-${task.id}`}
                          primary={task.description}
                          secondary={task.estimated_duration_minutes ? `${task.estimated_duration_minutes} min` : null}
                          sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                   {session.notes && (
                       <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                           Notes: {session.notes}
                       </Typography>
                   )}
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography>No study sessions generated in this plan.</Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default StudyPlan;