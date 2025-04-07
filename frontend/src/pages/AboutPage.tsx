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
  Button,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Info,
  AutoAwesome,
  AssignmentTurnedIn,
  Search,
  Timeline,
  Psychology,
  Lightbulb,
  Schedule,
  TrendingUp,
  Rocket,
  BarChart,
  CloudUpload,
  MenuBook,
  VideoLibrary,
  Article,
} from '@mui/icons-material'; // Icons for sections
import { Link as RouterLink } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Our Mission */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Info sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h2">
            Our Mission
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
          At ExamGenius, we believe that every student deserves access to personalized, efficient study tools.
          By simply uploading your syllabus, our AI provides a comprehensive analysis,
          identifying key concepts and suggesting how to allocate your valuable study time.
          It then helps you build a dynamic, personalized study plan and discover targeted
          resources to deepen your understanding.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
          Our platform is built to adapt to your unique learning needs, helping you focus on what matters most
          and making your exam preparation journey smoother and more effective.
        </Typography>
      </Paper>

      {/* How It Works Section */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}
        >
          <Timeline sx={{ mr: 2, fontSize: 40 }} /> How ExamGenius Works
        </Typography>

        <Box sx={{ position: 'relative', mb: 6 }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 6, md: 2 },
            position: 'relative',
            zIndex: 1
          }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CloudUpload sx={{ fontSize: 50, color: theme.palette.secondary.main }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Upload</Typography>
              <Card elevation={3} sx={{ width: '100%', height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    Upload your syllabus document (PDF, DOCX, or TXT) to our secure platform for instant analysis.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Psychology sx={{ fontSize: 50, color: theme.palette.secondary.main }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Analyze</Typography>
              <Card elevation={3} sx={{ width: '100%', height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    Our AI identifies key topics, assesses their importance, and estimates required study time.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Schedule sx={{ fontSize: 50, color: theme.palette.secondary.main }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Plan</Typography>
              <Card elevation={3} sx={{ width: '100%', height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    Generate a personalized study schedule optimized for your learning needs and available time.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MenuBook sx={{ fontSize: 50, color: theme.palette.secondary.main }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Study</Typography>
              <Card elevation={3} sx={{ width: '100%', height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography color="text.secondary">
                    Access curated resources for each topic and follow your personalized study plan to success.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Core Features Section - Enhanced */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AutoAwesome sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} /> Core Features
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: { md: 1 }, minWidth: { md: '45%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <AssignmentTurnedIn sx={{ color: theme.palette.secondary.main, fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>AI Syllabus Analysis</Typography>
                <Typography color="text.secondary">
                  Upload your syllabus to automatically extract topics, assess their importance, and estimate required study time. Our advanced AI identifies key concepts and helps you understand what to prioritize.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: { md: 1 }, minWidth: { md: '45%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <Schedule sx={{ color: theme.palette.secondary.main, fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>Personalized Study Plans</Typography>
                <Typography color="text.secondary">
                  Generate structured study schedules based on your syllabus analysis. Our AI creates logical learning sequences, organizing topics into coherent sessions optimized for your available study time.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: { md: 1 }, minWidth: { md: '45%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <VideoLibrary sx={{ color: theme.palette.secondary.main, fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>Curated Topic Resources</Typography>
                <Typography color="text.secondary">
                  Access AI-curated video and article recommendations specifically tailored for each topic in your syllabus. Get explanations suitable for beginner to intermediate levels to enhance your understanding.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: { md: 1 }, minWidth: { md: '45%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
                <Search sx={{ color: theme.palette.secondary.main, fontSize: 30 }} />
              </Box>
              <Box>
                <Typography variant="h6" gutterBottom>Resource Search</Typography>
                <Typography color="text.secondary">
                  Search for learning resources across the web using custom queries. Find relevant articles, videos, and tutorials to supplement your study materials and deepen your knowledge on specific topics.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Benefits Section */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Lightbulb sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} /> Benefits for Students
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { md: 1 } }}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} /> Improved Efficiency
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Save valuable time by focusing on what matters most. Our AI helps you prioritize topics based on importance and complexity.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { md: 1 } }}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <BarChart sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} /> Structured Approach
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transform overwhelming syllabi into manageable, organized study plans. Follow a clear path to exam success with logical learning sequences.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { md: 1 } }}>
            <Card elevation={1} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Article sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} /> Quality Resources
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access curated, high-quality learning materials specific to your syllabus topics. No more wasting time searching for relevant content.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>





      {/* Future Roadmap */}
      <Paper sx={{ p: { xs: 3, md: 4 }, mb: 5, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Rocket sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} /> Future Roadmap
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We're constantly working to improve ExamGenius. Here's what's coming next:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon><AutoAwesome sx={{ color: theme.palette.secondary.main }} /></ListItemIcon>
            <ListItemText
              primary="Advanced Progress Tracking"
              secondary="Monitor your study progress with detailed analytics and insights."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><AutoAwesome sx={{ color: theme.palette.secondary.main }} /></ListItemIcon>
            <ListItemText
              primary="Collaborative Study Groups"
              secondary="Create and join study groups to collaborate with peers on the same courses."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><AutoAwesome sx={{ color: theme.palette.secondary.main }} /></ListItemIcon>
            <ListItemText
              primary="AI-Generated Practice Questions"
              secondary="Get customized practice questions and quizzes based on your syllabus topics."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><AutoAwesome sx={{ color: theme.palette.secondary.main }} /></ListItemIcon>
            <ListItemText
              primary="Mobile Application"
              secondary="Access ExamGenius on-the-go with our upcoming mobile app."
            />
          </ListItem>
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/"
            size="large"
          >
            Start Your Study Journey Today
          </Button>
        </Box>
      </Paper>

    </Container>
  );
};

export default AboutPage;