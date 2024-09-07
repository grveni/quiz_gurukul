import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link from react-router-dom
import { login } from '../../utils/AuthAPI';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      const userRole = await login(email, password);
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'student') {
        navigate('/student');
      } else {
        setError('Invalid role');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="form-container">
      <h1>Login</h1>
      <div className="form-field">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-field">
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin}>Login</button>
      {error && <p className="error-message">{error}</p>}
      <div className="register-link">
        <p>
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
