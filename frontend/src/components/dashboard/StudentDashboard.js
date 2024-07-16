import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const StudentDashboard = () => (
  <Container>
    <Box my={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        Student Dashboard
      </Typography>
      <Typography variant="body1">
        Here you can take new quizzes, retake quizzes, view your scores, and
        more.
      </Typography>
    </Box>
  </Container>
);

export default StudentDashboard;
