import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RegisterForm from './components/forms/RegisterForm';
import LoginForm from './components/forms/LoginForm';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import { getUserRole } from './utils/Auth'; // Assuming there's a function to get user role

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
    <div className="home-container">
      <h1>Welcome</h1>
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const App = () => {
  const [formType, setFormType] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user role and set it
    const fetchUserRole = async () => {
      const userRole = await getUserRole();
      setRole(userRole);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    // Redirect based on role
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'student') {
      navigate('/student');
    }
  }, [role, navigate]);

  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home setFormType={setFormType} />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/student" element={<StudentDashboardPage />} />
      </Routes>
    </div>
  );
};

export default App;
