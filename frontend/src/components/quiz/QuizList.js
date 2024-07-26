import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getQuizzesWithPagination,
  updateQuizStatus,
} from '../../utils/QuizAPI';
import Pagination from '../common/Pagination';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { quizzes, totalPages } = await getQuizzesWithPagination(
          currentPage
        );
        setQuizzes(quizzes);
        setTotalPages(totalPages);
      } catch (error) {
        setError('Failed to fetch quizzes');
      }
    };

    fetchQuizzes();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleToggleStatus = async (quizId, currentStatus) => {
    try {
      await updateQuizStatus(quizId, !currentStatus);
      setQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) =>
          quiz.id === quizId ? { ...quiz, is_active: !currentStatus } : quiz
        )
      );
    } catch (error) {
      setError('Failed to update quiz status');
    }
  };

  return (
    <div className="quiz-list">
      <h2>Quiz List</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <Link to={`/admin/quizzes/${quiz.id}`}>{quiz.title}</Link>
            <button
              onClick={() => handleToggleStatus(quiz.id, quiz.is_active)}
              style={{ marginLeft: '10px' }}
            >
              {quiz.is_active ? 'Draft' : 'Publish'}
            </button>
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default QuizList;
