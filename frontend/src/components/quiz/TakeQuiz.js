import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getQuizById,
  getNextUntakenQuiz,
  submitQuizAnswers,
} from '../../utils/QuizAPI';
import './css/TakeQuiz.css';

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
          setQuiz(quizData.quiz);

          const initialAnswers = quizData.quiz.questions.map((question) => {
            const previousAnswer = question.previous_answer || {};
            return {
              questionId: question.id,
              questionType: question.question_type,
              answer:
                question.question_type === 'multiple-choice'
                  ? previousAnswer.selected_option_ids || []
                  : question.question_type === 'true-false'
                  ? previousAnswer.selected_option_id || ''
                  : question.question_type === 'text'
                  ? previousAnswer.answer_text || ''
                  : null,
              optionPairs:
                (question.question_type === 'match-pairs' ||
                  question.question_type === 'correct-order') &&
                question.options.left_options.map((leftOption, index) => ({
                  leftUUID: leftOption.left_option_uuid,
                  rightUUID:
                    previousAnswer.optionPairs?.[index]?.rightUUID || '',
                })),
            };
          });

          console.log('Initialized Answers State:', initialAnswers);
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

  const handleOptionChange = (questionId, optionUuid, questionType) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId
        ? {
            ...answer,
            answer:
              questionType === 'multiple-choice'
                ? answer.answer.includes(optionUuid)
                  ? answer.answer.filter((uuid) => uuid !== optionUuid)
                  : [...answer.answer, optionUuid]
                : questionType === 'true-false'
                ? optionUuid // Directly assign the selected UUID for true/false
                : answer.answer,
          }
        : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleTextChange = (questionId, text) => {
    const updatedAnswers = answers.map((answer) =>
      answer.questionId === questionId ? { ...answer, answer: text } : answer
    );
    setAnswers(updatedAnswers);
  };

  const handleDropdownChange = (questionId, index, selectedUuid, type) => {
    console.log('Dropdown Change:', {
      questionId,
      index,
      selectedUuid,
      type,
    });

    setAnswers((prevAnswers) => {
      const updatedAnswers = prevAnswers.map((answer) => {
        if (answer.questionId === questionId) {
          const key = 'optionPairs';
          const updatedArray = [...(answer[key] || [])];

          const leftUUID =
            answer[key]?.[index]?.leftUUID ||
            quiz.questions.find((q) => q.id === questionId).options
              .left_options[index].left_option_uuid;

          // Ensure rightUUID is a string
          const rightUUID =
            typeof selectedUuid === 'string'
              ? selectedUuid
              : selectedUuid?.rightUUID || '';

          console.log('Mapping OptionPair:', { leftUUID, rightUUID });

          updatedArray[index] = { leftUUID, rightUUID };

          return {
            ...answer,
            [key]: updatedArray,
          };
        }
        return answer;
      });

      console.log(
        'Updated Answers State After Dropdown Change:',
        updatedAnswers
      );
      return updatedAnswers;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const submissionData = {
        answers: answers.map((answer) => {
          const { questionId, questionType, optionPairs } = answer;

          if (questionType === 'multiple-choice') {
            return {
              questionId,
              questionType,
              selectedOptions: answer.answer, // Now sending UUIDs
            };
          } else if (questionType === 'true-false') {
            return {
              questionId,
              questionType,
              selectedOption: answer.answer, // Now sending UUID
            };
          } else if (questionType === 'text') {
            return { questionId, questionType, answerText: answer.answer };
          } else if (
            questionType === 'correct-order' ||
            questionType === 'match-pairs'
          ) {
            return {
              questionId,
              questionType,
              optionPairs: optionPairs.map(({ leftUUID, rightUUID }) => ({
                leftUUID,
                rightUUID:
                  typeof rightUUID === 'object'
                    ? rightUUID.rightUUID
                    : rightUUID,
              })),
            };
          }
          return null;
        }),
      };

      console.log('Prepared Submission Data:', submissionData);
      await submitQuizAnswers(quizId, submissionData);
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
                <div key={option.option_uuid} className="option">
                  <input
                    type="checkbox"
                    id={`option-${option.option_uuid}`}
                    name={`question-${question.id}`}
                    value={option.option_uuid}
                    checked={answers
                      .find((ans) => ans.questionId === question.id)
                      .answer.includes(option.option_uuid)}
                    onChange={() =>
                      handleOptionChange(
                        question.id,
                        option.option_uuid,
                        question.question_type
                      )
                    }
                  />
                  <label htmlFor={`option-${option.option_uuid}`}>
                    {option.option_text}
                  </label>
                </div>
              ))}

            {question.question_type === 'true-false' &&
              question.options.map((option) => (
                <div key={option.option_uuid} className="option">
                  <input
                    type="radio"
                    id={`option-${option.option_uuid}`}
                    name={`question-${question.id}`}
                    value={option.option_uuid}
                    checked={
                      answers.find((ans) => ans.questionId === question.id)
                        ?.answer === option.option_uuid
                    }
                    onChange={() =>
                      handleOptionChange(
                        question.id,
                        option.option_uuid,
                        question.question_type
                      )
                    }
                  />
                  <label htmlFor={`option-${option.option_uuid}`}>
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
                onChange={(e) => handleTextChange(question.id, e.target.value)}
              />
            )}

            {question.question_type === 'match-pairs' &&
              question.options.left_options.map((leftOption, i) => {
                const selectedValue =
                  answers.find((ans) => ans.questionId === question.id)
                    ?.optionPairs?.[i]?.rightUUID || '';

                return (
                  <div
                    key={leftOption.left_option_uuid}
                    className="pair-option"
                  >
                    <label>{leftOption.left_option_text}</label>
                    <select
                      value={selectedValue}
                      onChange={(e) =>
                        handleDropdownChange(
                          question.id,
                          i,
                          e.target.value,
                          'match-pairs'
                        )
                      }
                    >
                      <option value="">Select Match</option>
                      {question.options.right_options.map((rightOption) => (
                        <option
                          key={rightOption.right_option_uuid}
                          value={rightOption.right_option_uuid}
                        >
                          {rightOption.right_option_text}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}

            {question.question_type === 'correct-order' &&
              question.options.left_options.map((leftOption, i) => {
                const selectedValue =
                  answers.find((ans) => ans.questionId === question.id)
                    ?.optionPairs?.[i]?.rightUUID || '';

                return (
                  <div
                    key={leftOption.left_option_uuid}
                    className="pair-option"
                  >
                    <label>{leftOption.left_option_text}</label>
                    <select
                      value={selectedValue}
                      onChange={(e) =>
                        handleDropdownChange(
                          question.id,
                          i,
                          e.target.value,
                          'correct-order'
                        )
                      }
                    >
                      <option value="">Select Order</option>
                      {question.options.right_options.map((rightOption) => (
                        <option
                          key={rightOption.right_option_uuid}
                          value={rightOption.right_option_uuid}
                        >
                          {rightOption.right_option_text}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
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
