import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizResults } from '../../utils/QuizAPI';
import { useNavigate } from 'react-router-dom';
import './css/QuizResults.css';

const QuizResults = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getQuizResults(quizId);
        setResults(response);
      } catch (err) {
        setError('Failed to load results');
      }
    };

    fetchResults();
  }, [quizId]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!results) {
    return <div>Loading...</div>;
  }

  return (
    <div className="quiz-results">
      <h2>Quiz Results</h2>
      <p>Score: {results.score}</p>
      <p>Percentage: {results.percentScore}%</p>
      {results.questions.map((question, index) => (
        <div
          key={question.id}
          className={`question-block ${
            question.response_correct ? 'correct' : 'incorrect'
          }`}
        >
          <h3>{`Q${index + 1}: ${question.question_text}`}</h3>
          <ul className="options">
            {question.options.map((option) => (
              <li
                key={option.id}
                className={`option ${
                  option.option_text === question.user_response
                    ? 'user-response'
                    : ''
                } ${
                  showCorrectAnswers && option.is_correct
                    ? 'correct-answer'
                    : ''
                }`}
              >
                {option.option_text}
                {option.option_text === question.user_response && (
                  <span
                    className={`response-icon ${
                      question.response_correct ? 'correct' : 'incorrect'
                    }`}
                  >
                    {question.response_correct ? '✔️' : '❌'}
                  </span>
                )}
                {showCorrectAnswers && option.is_correct && (
                  <span className="correct-icon">✔️</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}>
        {showCorrectAnswers ? 'Hide Correct Answers' : 'Show Correct Answers'}
      </button>
      <button onClick={() => navigate(`/student/take-quiz/${quizId}`)}>
        Retake Quiz
      </button>
    </div>
  );
};

export default QuizResults;
