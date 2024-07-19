// src/components/admin/QuizList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzesWithPagination } from '../../utils/QuizAPI';
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

  return (
    <div className="quiz-list">
      <h2>Quiz List</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <Link to={`/admin/quizzes/${quiz.id}`}>{quiz.title}</Link>
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
