import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getQuiz, updateQuiz, listAllQuestions } from '../../utils/QuizAPI';

const QuizDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    metaEdited: false, // Flag for title or description change
  });
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]); // Track validation errors per question

  useEffect(() => {
    async function fetchQuizDetails() {
      try {
        const quizData = await getQuiz(quizId);
        if (quizData && quizData.quiz) {
          setQuiz({
            title: quizData.quiz.title || '',
            description: quizData.quiz.description || '',
            metaEdited: false, // Initialize as false
          });
        } else {
          setError('Title and Description not set');
        }

        const questionData = await listAllQuestions(quizId);
        if (questionData && Array.isArray(questionData.questions)) {
          setQuestions(
            questionData.questions.map((q) => ({
              ...q,
              isEdited: false,
              deleted: false,
            }))
          );
        } else {
          setError('No Questions to be edited in this quiz.');
        }
      } catch (err) {
        setError('Failed to load quiz details');
      }
    }
    fetchQuizDetails();
  }, [quizId]);

  const handleQuizChange = (field, value) => {
    setQuiz({ ...quiz, [field]: value, metaEdited: true });
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex][field] = value;
    if (!newQuestions[qIndex].deleted) {
      newQuestions[qIndex].isEdited = true;
    }
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    if (!newQuestions[index].deleted) {
      newQuestions[index].isEdited = true;
    }
    if (field === 'question_type' && value === 'true-false') {
      newQuestions[index].options = [
        { option_text: 'True', is_correct: false },
        { option_text: 'False', is_correct: false },
      ];
    }
    setQuestions(newQuestions);
  };

  const validateQuestions = () => {
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.deleted) {
        if (question.question_type === 'multiple-choice') {
          const hasCorrectOption = question.options.some(
            (opt) => opt.is_correct
          );
          if (!hasCorrectOption) {
            errors.push(
              `Question ${i + 1} (${
                question.question_text
              }) must have at least one correct answer.`
            );
          }
          if (question.options.length < 1) {
            errors.push(
              `Question ${i + 1} (${
                question.question_text
              }) must have at least one option.`
            );
          }
        } else if (question.question_type === 'true-false') {
          const correctOptionsCount = question.options.filter(
            (opt) => opt.is_correct
          ).length;
          if (correctOptionsCount !== 1) {
            errors.push(
              `Question ${i + 1} (${
                question.question_text
              }) must have exactly one correct answer.`
            );
          }
        } else if (question.question_type === 'text') {
          if (!question.options[0]?.option_text) {
            errors.push(
              `Question ${i + 1} (${
                question.question_text
              }) must have a correct answer.`
            );
          }
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!validateQuestions()) {
      return;
    }
    try {
      // Create a list of updated or deleted questions
      const updatedQuestions = questions.filter((q) => q.isEdited || q.deleted);

      await updateQuiz(quizId, {
        title: quiz.title,
        description: quiz.description,
        metaEdited: quiz.metaEdited, // Send metaEdited flag
        questions: updatedQuestions, // Send only updated or deleted questions
      });
      setMessage('Quiz updated successfully!');
      setError(''); // Clear error message
      setValidationErrors([]); // Clear validation errors
    } catch (error) {
      setError('Failed to update quiz');
      setMessage(''); // Clear success message
    }
  };

  const handleToggleDeleteQuestion = (questionId) => {
    const newQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, deleted: !q.deleted, isEdited: !q.deleted };
      }
      return q;
    });
    setQuestions(newQuestions);
  };

  const handleDeleteOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 1) {
      newQuestions[qIndex].options.splice(oIndex, 1);
      if (!newQuestions[qIndex].deleted) {
        newQuestions[qIndex].isEdited = true;
      }
      setQuestions(newQuestions);
    } else {
      setError('Multiple-choice questions must have at least one option.');
    }
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({
      option_text: '',
      is_correct: false,
    });
    if (!newQuestions[qIndex].deleted) {
      newQuestions[qIndex].isEdited = true;
    }
    setQuestions(newQuestions);
  };

  return (
    <div className="dashboard-content">
      {quiz && (
        <form onSubmit={handleUpdateQuiz}>
          <div>
            <label>Title</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => handleQuizChange('title', e.target.value)}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={quiz.description}
              onChange={(e) => handleQuizChange('description', e.target.value)}
              required
            />
          </div>
        </form>
      )}
      <h2>Questions</h2>
      {questions.map((question, index) => (
        <div
          key={question.id}
          className={`question-block ${
            validationErrors.length > 0 ? 'error-highlight' : ''
          }`}
        >
          <div className="question-header">
            <label>Question {index + 1}</label>
            <div>
              <DeleteIcon
                onClick={() => handleToggleDeleteQuestion(question.id)}
                style={{
                  cursor: 'pointer',
                  color: question.deleted ? 'red' : 'inherit',
                }}
                titleAccess={
                  question.deleted ? 'Undo delete' : 'Delete question'
                }
              />
            </div>
          </div>
          <div>
            <label>Question Text</label>
            <input
              type="text"
              value={question.question_text}
              onChange={(e) =>
                handleQuestionChange(index, 'question_text', e.target.value)
              }
              required
              disabled={question.deleted}
            />
          </div>
          <div>
            <label>Question Type</label>
            <Select
              value={question.question_type}
              onChange={(e) =>
                handleQuestionChange(index, 'question_type', e.target.value)
              }
              required
              disabled={question.deleted}
            >
              <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
              <MenuItem value="true-false">True/False</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
          </div>
          {question.question_type === 'multiple-choice' && (
            <div>
              <label>Options</label>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-block">
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) =>
                      handleOptionChange(
                        index,
                        oIndex,
                        'option_text',
                        e.target.value
                      )
                    }
                    required
                    disabled={question.deleted}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={!!option.is_correct}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          oIndex,
                          'is_correct',
                          e.target.checked
                        )
                      }
                      disabled={question.deleted}
                    />
                    Correct
                  </label>
                  {question.options.length > 1 && !question.deleted && (
                    <button
                      type="button"
                      onClick={() => handleDeleteOption(index, oIndex)}
                    >
                      Delete Option
                    </button>
                  )}
                </div>
              ))}
              {!question.deleted && (
                <button type="button" onClick={() => handleAddOption(index)}>
                  Add Option
                </button>
              )}
            </div>
          )}
          {question.question_type === 'true-false' &&
            question.options.length === 2 && (
              <div>
                <label>Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-block">
                    <input
                      type="text"
                      value={option.option_text}
                      readOnly
                      disabled={question.deleted}
                    />
                    <label>
                      <input
                        type="checkbox"
                        checked={!!option.is_correct}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            oIndex,
                            'is_correct',
                            e.target.checked
                          )
                        }
                        disabled={question.deleted}
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            )}
          {question.question_type === 'text' && (
            <div>
              <label>Correct Answer</label>
              <input
                type="text"
                value={question.options[0]?.option_text || ''}
                onChange={(e) =>
                  handleOptionChange(index, 0, 'option_text', e.target.value)
                }
                required
                disabled={question.deleted}
              />
            </div>
          )}
        </div>
      ))}
      {message && (
        <p style={{ color: 'green', fontStyle: 'italic' }}>{message}</p>
      )}
      {error && <p style={{ color: 'red', fontStyle: 'italic' }}>{error}</p>}
      {validationErrors.length > 0 && (
        <div>
          <h4>Please fix the following errors:</h4>
          <ul style={{ color: 'red' }}>
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleUpdateQuiz}>Update Quiz</button>
    </div>
  );
};

export default QuizDetails;