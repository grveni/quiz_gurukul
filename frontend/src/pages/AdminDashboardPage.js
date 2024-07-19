import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import AddQuiz from '../components/quiz/AddQuiz';
import QuizList from '../components/quiz/QuizList';
import QuizDetails from '../components/quiz/QuizDetails';
import AddQuizQuestions from '../components/quiz/AddQuizQuestions';
import StudentList from '../components/users/StudentList';
import StudentReport from '../components/reports/StudentReport';
import ConsolidatedReport from '../components/reports/ConsolidatedReport';
import ManageUsers from '../components/users/ManageUsers';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const AdminDashboardPage = () => (
  <div className="container">
    <Header />
    <div className="dashboard-container">
      <Sidebar role="admin" />
      <div className="dashboard-content">
        <Routes>
          <Route path="add-quiz" element={<AddQuiz />} />
          <Route path="quizzes" element={<QuizList />} />
          <Route path="quizzes/:quizId" element={<QuizDetails />} />
          <Route path="students" element={<StudentList />} />
          <Route path="student/:id/report" element={<StudentReport />} />
          <Route path="consolidated-report" element={<ConsolidatedReport />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="add-questions" element={<AddQuizQuestions />} />
        </Routes>
        <AdminDashboard />
      </div>
    </div>
    <Footer />
  </div>
);

export default AdminDashboardPage;
