import React from 'react';
import {
  Typography,
  Container,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Info, AutoAwesome, AssignmentTurnedIn, Search, Build } from '@mui/icons-material'; // Icons for sections

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Info sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            About ExamGenius
          </Typography>
        </Box>
        <Typography variant="h6" gutterBottom>
          Your AI-Powered Study Partner
        </Typography>
        <Typography paragraph color="text.secondary">
          ExamGenius is designed to revolutionize the way students prepare for exams.
          We understand the challenges of navigating complex syllabi, prioritizing topics,
          and finding relevant study materials. Our goal is to leverage the power of
          Artificial Intelligence to make your study process smarter, more efficient,
          and ultimately more successful.
        </Typography>
        <Typography paragraph color="text.secondary">
          By simply uploading your syllabus, ExamGenius provides a comprehensive analysis,
          identifying key concepts and suggesting how to allocate your valuable study time.
          It then helps you build a dynamic, personalized study plan and discover targeted
          resources to deepen your understanding.
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }, // Stack on small screens, row on medium+
          gap: 4, // Spacing between items
        }}
      >
        <Box sx={{ flex: { md: 1 } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesome sx={{ mr: 1, color: 'secondary.main' }} /> Core Features
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><AssignmentTurnedIn fontSize="small" /></ListItemIcon>
                <ListItemText primary="AI Syllabus Analysis" secondary="Extract topics, importance, and estimated study time." />
              </ListItem>
              <ListItem>
                <ListItemIcon><AssignmentTurnedIn fontSize="small" /></ListItemIcon>
                <ListItemText primary="Personalized Study Plans" secondary="Generate structured schedules based on analysis and priorities." />
              </ListItem>
              <ListItem>
                <ListItemIcon><Search fontSize="small" /></ListItemIcon>
                <ListItemText primary="Resource Recommendations" secondary="Find relevant articles, videos, and tutorials via web search." />
              </ListItem>
              {/* Add more features as they are developed */}
            </List>
          </Paper>
        </Box>

        <Box sx={{ flex: { md: 1 } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Build sx={{ mr: 1, color: 'secondary.main' }} /> Technology Stack
            </Typography>
            <Typography paragraph color="text.secondary">
              ExamGenius is built using modern web technologies:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Frontend: React (TypeScript), Material UI" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Backend: Python (FastAPI)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="AI/Search: Google Gemini, Tavily API" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Orchestration: LangChain" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Infrastructure: Docker" />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>

      {/* Add more sections like 'Our Team', 'Contact', etc. if needed */}

    </Container>
  );
};

export default AboutPage;