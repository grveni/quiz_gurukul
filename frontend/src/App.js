import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RegisterForm from './components/forms/RegisterForm';
import LoginForm from './components/forms/LoginForm';
import AdminDashboardPage from './pages/AdminDashboardPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import { getUserRole } from './utils/AuthAPI';
import './index.css'; // Assuming you have an App.css file for styles

const App = () => {
  const [formType, setFormType] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const userRole = await getUserRole();
      setRole(userRole);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'student') {
      navigate('/student');
    }
  }, [role, navigate]);

  return (
    <div className="wrapper">
      <header className="header">
        {/* Removed the Home button */}
        <button onClick={() => navigate('/register')}>Register</button>
        <button onClick={() => navigate('/login')}>Login</button>
      </header>
      <main className="content-wrapper">
        <Routes>
          {/* Set default route ("/") to login */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
          <Route path="/student/*" element={<StudentDashboardPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2024 Quiz System</p>
      </footer>
    </div>
  );
};

export default App;
