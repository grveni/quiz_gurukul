import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import TakeQuiz from '../components/quiz/TakeQuiz';
import Quizzes from '../components/quiz/QuizListStudent';
import ViewProfile from '../components/users/ViewProfile';
import QuizResults from '../components/quiz/QuizResults';
import QuizDetails from '../components/quiz/QuizDetails';
import Layout from '../components/common/Layout';
import AllQuizListStudent from '../components/quiz/AllQuizListStudent'; // Adjust the path as necessary
import { getUserId } from '../utils/UserAPI'; // Assuming you have a function to fetch user profile

const TEST_USER_ID = Number('10'); // Replace with the actual test user ID

const StudentDashboardPage = () => {
  const [isTestUser, setIsTestUser] = useState(false);

  // Fetch the current logged-in user's profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = await getUserId();
        // Check if the logged-in user matches the test user ID
        if (userId === TEST_USER_ID) {
          setIsTestUser(true);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout role="student" />}>
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="take-quiz" element={<TakeQuiz />} />
        <Route path="take-quiz/:quizId" element={<TakeQuiz />} />
        <Route path="profile" element={<ViewProfile />} />
        <Route path="results/:quizId" element={<QuizResults />} />
        <Route path="quizzes/:quizId" element={<QuizDetails />} />

        {/* Conditionally render "All Quizzes" button for test user */}
        {isTestUser && (
          <Route path="all-quizzes" element={<AllQuizListStudent />} />
        )}
      </Route>
    </Routes>
  );
};

export default StudentDashboardPage;
