import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './styles.css'; // Import the CSS file

const Home = ({ setFormType }) => {
  const navigate = useNavigate();

  const handleRegister = () => {
    setFormType('register');
    navigate('/register');
  };

  const handleLogin = () => {
    setFormType('login');
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>Welcome</h1>
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const App = () => {
  const [formType, setFormType] = useState(null);

  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home setFormType={setFormType} />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </div>
  );
};

export default App;
