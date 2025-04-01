import React from 'react';
import { Container } from '@mui/material';
import Resources from '../components/features/Resources';

const ResourcesPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Resources />
    </Container>
  );
};

export default ResourcesPage;