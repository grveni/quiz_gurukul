import React, { useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';

const AdminDashboard = () => {
  const [content, setContent] = useState([]);

  const handleAddContent = () => {
    setContent((prevContent) => [
      ...prevContent,
      'This is some dummy content. Keep adding more content to test the scroll functionality. ',
    ]);
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1">
          Here you can manage users, create quizzes, view quiz reports, and
          more.
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAddContent}>
          Add Content
        </Button>
        <Box mt={2}>
          {content.map((text, index) => (
            <Typography key={index} variant="body1">
              {text}
            </Typography>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
