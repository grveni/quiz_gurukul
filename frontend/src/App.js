// src/App.js

import React, { useState } from 'react';

import formConfig from './formConfig.json';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';

import './styles.css'; // Import the CSS file

const App = () => {
  const [formType, setFormType] = useState(null);

  return (
    <div className="container">
      <h1>Welcome</h1>
      <button onClick={() => setFormType('register')}>Register</button>
      <button onClick={() => setFormType('login')}>Login</button>

      {formType === 'register' && <RegisterForm />}
      {formType === 'login' && <LoginForm />}
    </div>
  );
};

export default App;
