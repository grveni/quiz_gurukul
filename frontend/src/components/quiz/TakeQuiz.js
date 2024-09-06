import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getQuizById,
  getNextUntakenQuiz,
  submitQuizAnswers,
} from '../../utils/QuizAPI';
import { useNavigate } from 'react-router-dom';
import './css/TakeQuiz.css'; // Import the new CSS file

const TakeQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [noNewQuiz, setNoNewQuiz] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuiz() {
      try {
        let quizData;
        if (quizId) {
          quizData = await getQuizById(quizId);
        } else {
          quizData = await getNextUntakenQuiz();
        }

        if (
          !quizData ||
          !quizData.quiz ||
          !quizData.quiz.questions ||
          quizData.quiz.questions.length === 0
        ) {
          setNoNewQuiz(true);
        } else {
          const questionsWithOptions = quizData.quiz.questions.map(
            (question) => ({
              ...question,
              options: question.options || [],
            })
          );

          setQuiz({
            ...quizData.quiz,
            questions: questionsWithOptions,
          });

          setAnswers(
            questionsWithOptions.map((question) => ({
              questionId: question.id,
              selectedOption: '',
              answerText: '',
            }))
          );
        }
      } catch (err) {
        setError('Failed to load quiz');
      }
    }
    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionId, optionId, optionText) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId
        ? { ...answer, selectedOption: optionId, answerText: optionText }
        : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleAnswerTextChange = (questionId, text) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId
        ? { ...answer, selectedOption: '', answerText: text }
        : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const result = await submitQuizAnswers(quiz.id, answers);
      navigate(`/student/results/${quiz.id}`);
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  if (noNewQuiz || !quiz) {
    return (
      <div className="no-quiz-message">
        <p>No new quiz published.</p>
        <p>New quizzes will be published soon.</p>
        <p>Please come back again later.</p>
      </div>
    );
  }

  return (
    <div className="take-quiz">
      <h4>{quiz.title}</h4>
      <form onSubmit={handleSubmit}>
        {Array.isArray(quiz.questions) &&
          quiz.questions.map((question, index) => (
            <div key={question.id} className="question-block">
              <h3>{`Q${index + 1}: ${question.question_text}`}</h3>
              {question.question_type === 'multiple-choice' &&
                question.options.map((option) => (
                  <div key={option.id}>
                    <input
                      type="radio"
                      id={`option-${option.id}`}
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={
                        answers.find((ans) => ans.questionId === question.id)
                          .selectedOption === option.id
                      }
                      onChange={() =>
                        handleOptionChange(
                          question.id,
                          option.id,
                          option.option_text
                        )
                      }
                    />
                    <label htmlFor={`option-${option.id}`}>
                      {option.option_text}
                    </label>
                  </div>
                ))}
              {question.question_type === 'true-false' &&
                question.options.map((option) => (
                  <div key={option.id}>
                    <input
                      type="radio"
                      id={`option-${option.id}`}
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={
                        answers.find((ans) => ans.questionId === question.id)
                          .selectedOption === option.id
                      }
                      onChange={() =>
                        handleOptionChange(
                          question.id,
                          option.id,
                          option.option_text
                        )
                      }
                    />
                    <label htmlFor={`option-${option.id}`}>
                      {option.option_text}
                    </label>
                  </div>
                ))}
              {question.question_type === 'text' && (
                <input
                  type="text"
                  value={
                    answers.find((ans) => ans.questionId === question.id)
                      .answerText
                  }
                  onChange={(e) =>
                    handleAnswerTextChange(question.id, e.target.value)
                  }
                />
              )}
            </div>
          ))}
        <button type="submit">Submit Quiz</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default TakeQuiz;
