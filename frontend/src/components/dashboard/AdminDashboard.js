import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminDashboard = () => (
  <Container>
    <Box my={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1">
        Here you can manage users, create quizzes, view quiz reports, and more.
      </Typography>
    </Box>
  </Container>
);

export default AdminDashboard;
