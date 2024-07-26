import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from '../components/common/Layout';
import AddQuiz from '../components/quiz/AddQuiz';
import QuizList from '../components/quiz/QuizList';
import QuizDetails from '../components/quiz/QuizDetails';
import AddQuizQuestions from '../components/quiz/AddQuizQuestions';
import StudentList from '../components/users/StudentList';
import StudentReport from '../components/reports/StudentReport';
import ConsolidatedReport from '../components/reports/ConsolidatedReport';
import ManageUsers from '../components/users/ManageUsers';
import AdminDashboard from '../components/dashboard/AdminDashboard';

const AdminDashboardPage = () => (
  <Routes>
    <Route path="/" element={<Layout role="admin" />}>
      <Route index element={<AdminDashboard />} />
      <Route path="add-quiz" element={<AddQuiz />} />
      <Route path="quizzes" element={<QuizList />} />
      <Route path="quizzes/:quizId" element={<QuizDetails />} />
      <Route path="students" element={<StudentList />} />
      <Route path="student/:id/report" element={<StudentReport />} />
      <Route path="consolidated-report" element={<ConsolidatedReport />} />
      <Route path="manage-users" element={<ManageUsers />} />
      <Route path="add-questions" element={<AddQuizQuestions />} />
    </Route>
  </Routes>
);

export default AdminDashboardPage;
