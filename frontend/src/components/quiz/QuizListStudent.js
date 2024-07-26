import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserActiveQuizzes } from '../../utils/QuizAPI';

const QuizListStudent = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getUserActiveQuizzes();
        console.log(response);
        setQuizzes(response);
      } catch (err) {
        setError('Failed to fetch quizzes');
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="quiz-list-student">
      <h2>Active Quizzes Taken</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.id}>
            <Link to={`/student/results/${quiz.id}`}>{quiz.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizListStudent;
