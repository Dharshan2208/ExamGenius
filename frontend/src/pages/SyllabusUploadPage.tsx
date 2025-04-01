import React from 'react';
// Remove unused Typography
import { Container } from '@mui/material';
// import { Typography } from '@mui/material';
// Import the actual SyllabusUpload component
import SyllabusUpload from '../components/features/SyllabusUpload';

const SyllabusUploadPage: React.FC = () => {
  return (
    <Container sx={{ mt: 4, mb: 4 }}> {/* Add bottom margin */}
      {/* Remove title here if SyllabusUpload includes one */}
      {/* <Typography variant="h4" gutterBottom>
        Upload Syllabus
      </Typography> */}
      <SyllabusUpload />
      {/* Remove placeholder text */}
      {/* <Typography>
        (Syllabus Upload Component will go here)
      </Typography> */}
    </Container>
  );
};

export default SyllabusUploadPage;