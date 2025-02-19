import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizResults, getCorrectAnswers } from '../../utils/QuizAPI';
import './css/QuizResults.css';

const QuizResults = () => {
  const [quiz, setQuiz] = useState(null);
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
        if (response && response.quiz) {
          setQuiz(response.quiz);
        }
        setResults(response);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load results');
      }
    };

    fetchResults();
  }, [quizId]);

  const handleFetchCorrectAnswers = async () => {
    if (showCorrectAnswers) {
      // Hide correct answers
      setShowCorrectAnswers(false);
      setResults((prevResults) => ({
        ...prevResults,
        correctAnswers: null, // Clear correct answers data
      }));
    } else {
      try {
        const correctAnswers = await getCorrectAnswers(quizId);
        setResults((prevResults) => ({
          ...prevResults,
          correctAnswers, // Merge correct answers into results
        }));
        setShowCorrectAnswers(true); // Enable correct answers display
      } catch (error) {
        console.error('Error fetching correct answers:', error);

        if (error.message.includes('403')) {
          setError(
            'Unauthorized or score is below 60%. Correct answers not available.'
          );
        } else {
          setError('Failed to fetch correct answers.');
        }
      }
    }
  };

  const renderOptions = (question) => {
    const correctAnswer =
      showCorrectAnswers &&
      results.correctAnswers?.find((q) => q.questionId === question.questionId);

    switch (question.questionType) {
      case 'multiple-choice':
      case 'true-false':
        return (
          <ul className="options">
            {question.options.map((option) => {
              const isCorrect = correctAnswer?.correctAnswers?.includes(
                option.optionUUID
              );
              return (
                <li
                  key={option.optionUUID}
                  className={`option ${
                    option.userSelected
                      ? question.responseCorrect
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  } ${showCorrectAnswers && isCorrect ? 'correct' : ''}`}
                >
                  <label>
                    <input
                      type="radio"
                      disabled
                      checked={option.userSelected || false}
                    />
                    {option.optionText}{' '}
                    {showCorrectAnswers && isCorrect && (
                      <span className="response-icon correct-icon">✔️</span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        );

      case 'text':
        return (
          <table className="text-response-table">
            <tbody>
              <tr>
                <td>
                  <strong>Your Answer:</strong>
                </td>
                <td>
                  <textarea
                    className="response-text"
                    value={question.userResponse?.[0] || ''}
                    readOnly
                    placeholder="None Provided"
                  ></textarea>
                </td>
              </tr>
              {showCorrectAnswers && (
                <tr className="correct-answer-row">
                  <td colSpan={2}>
                    <strong>Correct Answer:</strong>{' '}
                    {correctAnswer?.correctText || 'N/A'}{' '}
                    {correctAnswer?.correctText && (
                      <span className="response-icon correct-icon">✔️</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case 'match-pairs':
      case 'correct-order':
        return (
          <table className="match-pairs-table">
            <thead>
              <tr>
                <th>Left Option</th>
                <th>Your Answer</th>
              </tr>
            </thead>
            <tbody>
              {question.options.map(({ leftUUID, leftText, userSelected }) => {
                const correctPair = correctAnswer?.correctAnswers?.find(
                  (pair) => pair.left_option_uuid === leftUUID
                );

                const isCorrect =
                  correctPair &&
                  correctPair.right_option_uuid === userSelected?.rightUUID;

                return (
                  <React.Fragment key={leftUUID}>
                    <tr>
                      <td>{leftText}</td>
                      <td>
                        {userSelected ? (
                          <span>{userSelected.rightText}</span>
                        ) : (
                          <span className="none-selected">None Selected</span>
                        )}
                      </td>
                    </tr>
                    {showCorrectAnswers && (
                      <tr className="correct-answer-row">
                        <td colSpan={2}>
                          <strong>Correct Answer:</strong>{' '}
                          {correctPair?.right_option_text || 'None'}{' '}
                          {correctPair?.right_option_text && (
                            <span className="response-icon correct-icon">
                              ✔️
                            </span>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
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
      <h4>{quiz.title}</h4>
      {quiz.description && (
        <p className="quiz-description">{quiz.description}</p>
      )}
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
          onClick={handleFetchCorrectAnswers}
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
