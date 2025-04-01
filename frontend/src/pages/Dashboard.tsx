import React from 'react';
import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
} from '@mui/material';
import {
  LightbulbOutlined,
  PersonPinCircleOutlined,
  TrendingUp,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Avatar sx={{ mx: 'auto' }}>
        {icon}
      </Avatar>
      <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 8, md: 12 },
          mb: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Transform Your Study Journey with AI
          </Typography>
          <Typography
            variant="h5"
            component="p"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Upload your syllabus and let ExamGenius create a personalized study plan using advanced AI. Get smart recommendations, track your progress, and maximize your learning efficiency.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/upload"
            sx={{ py: 1.5, px: 5 }}
          >
            Get Started Now
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 5, fontWeight: 'bold' }}
        >
          Our Mission
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 4,
            justifyContent: 'center',
            alignItems: { xs: 'center', sm: 'stretch' },
          }}
        >
          <Box sx={{ width: { xs: '90%', sm: 'auto' }, flex: { sm: 1 } }}>
            <FeatureCard
              icon={<LightbulbOutlined />}
              title="Smart Learning"
              description="We believe in leveraging AI to make studying more efficient and effective for every student."
            />
          </Box>
          <Box sx={{ width: { xs: '90%', sm: 'auto' }, flex: { sm: 1 } }}>
            <FeatureCard
              icon={<PersonPinCircleOutlined />}
              title="Personalized Approach"
              description="Every student has unique learning needs, and our platform adapts to individual study patterns."
            />
          </Box>
          <Box sx={{ width: { xs: '90%', sm: 'auto' }, flex: { sm: 1 } }}>
            <FeatureCard
              icon={<TrendingUp />}
              title="Continuous Growth"
              description="We're committed to helping students achieve their academic goals through data-driven insights."
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;