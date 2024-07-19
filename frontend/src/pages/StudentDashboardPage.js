import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import TakeQuiz from '../components/quiz/TakeQuiz';
import Quizzes from '../components/quiz/QuizListStudent';
import ViewProfile from '../components/quiz/ViewProfile';
import QuizResults from '../components/quiz/QuizResults';
import DummyPage from '../components/quiz/DummyPage';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const StudentDashboardPage = () => (
  <div className="container">
    <Header />
    <div className="dashboard-container">
      <Sidebar role="student" />
      <div className="dashboard-content">
        <Routes>
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="take-quiz" element={<TakeQuiz />} />
          <Route path="profile" element={<ViewProfile />} />
          <Route path="results/:quizId" element={<QuizResults />} />
          <Route path="dummy" element={<DummyPage />} />
        </Routes>
      </div>
    </div>
    <Footer />
  </div>
);

export default StudentDashboardPage;
