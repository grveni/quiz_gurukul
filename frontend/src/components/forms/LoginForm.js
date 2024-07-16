import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../utils/Auth'; // Assume you have a login function in auth.js

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      const userRole = await login(email, password); // Assume login returns the user role
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'student') {
        navigate('/student');
      } else {
        setError('LoginForm : Invalid role');
      }
    } catch (err) {
      if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <div className="nested-home-container">
      <h1>Login</h1>
      <div className="form-container">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginForm;
