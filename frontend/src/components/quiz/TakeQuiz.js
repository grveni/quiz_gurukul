import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getQuizById,
  getNextUntakenQuiz,
  submitQuizAnswers,
} from '../../utils/QuizAPI';
import './css/TakeQuiz.css';

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quizData = quizId
          ? await getQuizById(quizId)
          : await getNextUntakenQuiz();

        if (quizData && quizData.quiz && quizData.quiz.questions.length > 0) {
          const shuffledQuestions = quizData.quiz.questions.map((question) => {
            if (question.question_type === 'correct-order') {
              question.options = shuffleArray([...question.options]);
            } else if (question.question_type === 'match-pairs') {
              question.options = question.options.map((pair) => ({
                ...pair,
                right_options: shuffleArray(
                  question.options.map((p) => p.right_option_text)
                ),
              }));
            }
            return question;
          });

          setQuiz({ ...quizData.quiz, questions: shuffledQuestions });

          const initialAnswers = shuffledQuestions.map((question) => ({
            questionId: question.id,
            questionType: question.question_type,
            answer:
              question.question_type === 'multiple-choice' ||
              question.question_type === 'correct-order'
                ? []
                : question.question_type === 'true-false'
                ? ''
                : '',
            matchPairs:
              question.question_type === 'match-pairs'
                ? Array(question.options.length).fill('')
                : null,
          }));
          setAnswers(initialAnswers);
        } else {
          setMessage('No new quiz available.');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz');
      }
    }
    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionId, optionId, questionType) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId
        ? {
            ...answer,
            answer:
              questionType === 'multiple-choice'
                ? answer.answer.includes(optionId)
                  ? answer.answer.filter((id) => id !== optionId)
                  : [...answer.answer, optionId]
                : optionId,
          }
        : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleAnswerTextChange = (questionId, text) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId ? { ...answer, answer: text } : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleOrderSelection = (questionId, optionIndex, order) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId
        ? {
            ...answer,
            answer: answer.answer.map((item, i) =>
              i === optionIndex ? order : item
            ),
          }
        : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleMatchPairSelection = (questionId, optionIndex, selection) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId
        ? {
            ...answer,
            matchPairs: answer.matchPairs.map((item, i) =>
              i === optionIndex ? selection : item
            ),
          }
        : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const submissionData = {
        quizId: quiz.id,
        answers: answers.map((answer) => {
          const { questionId, questionType } = answer;
          if (questionType === 'multiple-choice') {
            return { questionId, questionType, selectedOptions: answer.answer };
          } else if (questionType === 'true-false') {
            return { questionId, questionType, selectedOption: answer.answer };
          } else if (questionType === 'text') {
            return { questionId, questionType, answerText: answer.answer };
          } else if (questionType === 'correct-order') {
            return { questionId, questionType, orderedOptions: answer.answer };
          } else if (questionType === 'match-pairs') {
            return {
              questionId,
              questionType,
              pairs: answer.matchPairs.map((selection, i) => ({
                leftOption: quiz.questions.find((q) => q.id === questionId)
                  .options[i].left_option_text,
                rightOption: selection,
              })),
            };
          }
          return null;
        }),
      };

      console.log('Submitting answers:', submissionData);
      await submitQuizAnswers(quiz.id, submissionData);
      navigate(`/student/results/${quiz.id}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz');
    }
  };

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="take-quiz">
      <h4>{quiz.title}</h4>
      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <div key={question.id} className="question-block">
            <h3>{`Q${index + 1}: ${question.question_text}`}</h3>

            {question.question_type === 'multiple-choice' &&
              question.options.map((option) => (
                <div key={option.id} className="option">
                  <input
                    type="checkbox"
                    id={`option-${option.id}`}
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={answers
                      .find((ans) => ans.questionId === question.id)
                      .answer.includes(option.id)}
                    onChange={() =>
                      handleOptionChange(
                        question.id,
                        option.id,
                        question.question_type
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
                <div key={option.id} className="option">
                  <input
                    type="radio"
                    id={`option-${option.id}`}
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={
                      answers.find((ans) => ans.questionId === question.id)
                        .answer === option.id
                    }
                    onChange={() =>
                      handleOptionChange(
                        question.id,
                        option.id,
                        question.question_type
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
                  answers.find((ans) => ans.questionId === question.id).answer
                }
                onChange={(e) =>
                  handleAnswerTextChange(question.id, e.target.value)
                }
              />
            )}

            {question.question_type === 'correct-order' &&
              question.options.map((option, optionIndex) => (
                <div key={option.id} className="option-with-dropdown">
                  <label>{option.option_text}</label>
                  <select
                    value={
                      answers.find((ans) => ans.questionId === question.id)
                        .answer[optionIndex]
                    }
                    onChange={(e) =>
                      handleOrderSelection(
                        question.id,
                        optionIndex,
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select Order</option>
                    {question.options.map((_, orderIndex) => (
                      <option key={orderIndex} value={orderIndex + 1}>
                        {orderIndex + 1}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

            {question.question_type === 'match-pairs' &&
              question.options.map((pair, pairIndex) => (
                <div key={pairIndex} className="pair-option">
                  <label>{pair.left_option_text}</label>
                  <select
                    value={
                      answers.find((ans) => ans.questionId === question.id)
                        .matchPairs[pairIndex]
                    }
                    onChange={(e) =>
                      handleMatchPairSelection(
                        question.id,
                        pairIndex,
                        e.target.value
                      )
                    }
                  >
                    <option value="">Select Match</option>
                    {pair.right_options.map((rightOption, rightIndex) => (
                      <option key={rightIndex} value={rightOption}>
                        {rightOption}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
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
