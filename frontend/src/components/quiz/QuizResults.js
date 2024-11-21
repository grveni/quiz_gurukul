import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResults } from '../../utils/QuizAPI';
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
        console.log('Fetched Quiz Results:', response); // Debug log
        setResults(response);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load results');
      }
    };

    fetchResults();
  }, [quizId]);

  const renderOptions = (question) => {
    console.log('Rendering options for question:', question); // Debug log

    switch (question.questionType) {
      case 'multiple-choice':
        return (
          <ul className="options">
            {question.options.map((option) => (
              <li
                key={option.optionUUID}
                className={`option ${
                  option.userSelected ? 'user-response' : ''
                }`}
              >
                <label>
                  <input
                    type="radio"
                    disabled
                    checked={option.userSelected || false}
                  />
                  {option.optionText}
                </label>
                {option.userSelected && (
                  <span
                    className={`response-icon ${
                      question.responseCorrect
                        ? 'correct-icon'
                        : 'incorrect-icon'
                    }`}
                  >
                    {question.responseCorrect ? '✔️' : '❌'}
                  </span>
                )}
              </li>
            ))}
            {!question.userResponse.length && (
              <li className="option none-selected">
                User Response: None Selected
              </li>
            )}
          </ul>
        );

      case 'text':
        return (
          <div>
            <p>User Response:</p>
            <textarea
              className="response-text"
              value={question.userResponse?.[0] || ''}
              readOnly
              placeholder="No response"
            ></textarea>
          </div>
        );

      case 'true-false':
        return (
          <ul className="options">
            {question.options.map((option) => (
              <li
                key={option.optionUUID}
                className={`option ${
                  option.userSelected
                    ? question.responseCorrect
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
              >
                <label>
                  <input
                    type="radio"
                    name={`question-${question.questionId}`} // Group by question
                    checked={option.userSelected || false} // Pre-select the user's choice
                    disabled // Display only
                  />
                  {option.optionText}
                </label>
                {option.userSelected && (
                  <span
                    className={`response-icon ${
                      question.responseCorrect
                        ? 'correct-icon'
                        : 'incorrect-icon'
                    }`}
                  >
                    {question.responseCorrect ? '✔️' : '❌'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        );

      case 'match-pairs':
      case 'correct-order':
        return (
          <ul className="options">
            {question.options.map(({ leftUUID, leftText, userSelected }) => {
              console.log(
                `Left Option: ${leftText}, Selected Right Option: ${
                  userSelected?.rightText || 'None'
                }`
              ); // Debug log

              return (
                <li key={leftUUID} className="option">
                  <strong>{leftText}</strong> →{' '}
                  <select className="dropdown" disabled>
                    {/* Default "None Selected" option */}
                    <option value="" selected={!userSelected}>
                      None Selected
                    </option>
                    {/* Display the user-selected option directly */}
                    {userSelected && (
                      <option value={userSelected.rightUUID} selected>
                        {userSelected.rightText}
                      </option>
                    )}
                  </select>
                </li>
              );
            })}
          </ul>
        );

      default:
        return <p>Unknown question type</p>;
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!results) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="quiz-results">
      <h2>Quiz Results</h2>
      <p>Score: {results.score}</p>
      <p>Percentage: {results.percentage}%</p>

      {!results.showCorrectAnswersEnabled && (
        <div className="notice-message">
          <p style={{ fontStyle: 'italic', fontSize: 'smaller' }}>
            To view correct answers, your percentage must be at least 60%.
          </p>
        </div>
      )}

      <div className="actions">
        <button
          disabled={!results.showCorrectAnswersEnabled}
          onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
        >
          {showCorrectAnswers ? 'Hide Correct Answers' : 'Show Correct Answers'}
        </button>
        <button onClick={() => navigate(`/student/take-quiz/${quizId}`)}>
          Retake Quiz
        </button>
      </div>

      {results.results.map((question, index) => (
        <div
          key={question.questionId}
          className={`question-block ${
            question.responseCorrect ? 'correct' : 'incorrect'
          }`}
        >
          <h3>{`Q${index + 1}: ${question.questionText}`}</h3>
          {renderOptions(question)}
        </div>
      ))}
    </div>
  );
};

export default QuizResults;
