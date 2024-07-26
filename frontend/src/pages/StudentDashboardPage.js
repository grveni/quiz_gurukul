import React from 'react';
import { Route, Routes } from 'react-router-dom';
import TakeQuiz from '../components/quiz/TakeQuiz';
import Quizzes from '../components/quiz/QuizListStudent';
import ViewProfile from '../components/quiz/ViewProfile';
import QuizResults from '../components/quiz/QuizResults';
import QuizDetails from '../components/quiz/QuizDetails';
import Layout from '../components/common/Layout';

const StudentDashboardPage = () => (
  <Routes>
    <Route path="/" element={<Layout role="student" />}>
      <Route path="quizzes" element={<Quizzes />} />
      <Route path="take-quiz" element={<TakeQuiz />} />
      <Route path="take-quiz/:quizId" element={<TakeQuiz />} />
      <Route path="profile" element={<ViewProfile />} />
      <Route path="results/:quizId" element={<QuizResults />} />
      <Route path="quizzes/:quizId" element={<QuizDetails />} />
    </Route>
  </Routes>
);

export default StudentDashboardPage;
