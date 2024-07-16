import React from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const AdminDashboardPage = () => (
  <div className="container">
    <Header />
    <div className="dashboard-container">
      <Sidebar role="admin" />
      <div className="dashboard-content">
        <AdminDashboard />
      </div>
    </div>
    <Footer />
  </div>
);

export default AdminDashboardPage;
