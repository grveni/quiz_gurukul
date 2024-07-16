import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import StudentDashboard from '../components/dashboard/StudentDashboard';

const StudentDashboardPage = () => (
  <div className="container">
    <Header />
    <div className="dashboard-container">
      <Sidebar role="student" />
      <div className="dashboard-content">
        <StudentDashboard />
      </div>
    </div>
    <Footer />
  </div>
);

export default StudentDashboardPage;
