// src/App.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the message from the backend
    axios
      .get('http://localhost:5001')
      .then((response) => {
        setMessage(response.data);
      })
      .catch((error) => {
        console.error('Error fetching message:', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>{message || 'Hello World from the frontend!'}</p>
      </header>
    </div>
  );
};

export default App;
