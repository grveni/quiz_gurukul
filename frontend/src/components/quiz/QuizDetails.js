import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  getQuiz,
  updateQuiz,
  listAllQuestions,
  updateQuestion,
  deleteQuestion,
} from '../../utils/QuizAPI';

const QuizDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState({ title: '', description: '' });
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuizDetails() {
      try {
        const quizData = await getQuiz(quizId);
        console.log('Fetched Quiz Data:', quizData);
        if (quizData) {
          setQuiz(quizData);
        } else {
          setError('Title and Description not set');
        }

        const questionData = await listAllQuestions(quizId);
        console.log('Fetched Question Data:', questionData);
        if (questionData && Array.isArray(questionData.questions)) {
          setQuestions(questionData.questions);
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
    setQuiz({ ...quiz, [field]: value });
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex][field] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    if (field === 'question_type' && value === 'true-false') {
      newQuestions[index].options = [
        { option_text: 'True', is_correct: false },
        { option_text: 'False', is_correct: false },
      ];
    }
    setQuestions(newQuestions);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      await updateQuiz(quizId, {
        title: quiz.title,
        description: quiz.description,
      });
      setMessage('Quiz updated successfully!');
    } catch (error) {
      setError('Failed to update quiz');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(quizId, questionId);
      setQuestions(questions.filter((question) => question.id !== questionId));
      setMessage('Question deleted successfully!');
    } catch (error) {
      setError('Failed to delete question');
    }
  };

  return (
    <div className="dashboard-content">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
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
          <button type="submit">Update Quiz</button>
        </form>
      )}
      <h2>Questions</h2>
      {questions.map((question, index) => (
        <div key={question.id} className="question-block">
          <div className="question-header">
            <label>Question {index + 1}</label>
            <div>
              <EditIcon
                onClick={() => console.log('Edit question')}
                style={{ cursor: 'pointer', marginRight: '10px' }}
                titleAccess="Edit question"
              />
              <DeleteIcon
                onClick={() => handleDeleteQuestion(question.id)}
                style={{ cursor: 'pointer' }}
                titleAccess="Delete question"
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
            >
              <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
              <MenuItem value="true-false">True/False</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
          </div>
          {question.question_type === 'multiple-choice' &&
            question.options &&
            question.options.length > 0 && (
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
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            )}
          {question.question_type === 'true-false' &&
            question.options &&
            question.options.length > 0 && (
              <div>
                <label>Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-block">
                    <input type="text" value={option.option_text} readOnly />
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
              />
            </div>
          )}
        </div>
      ))}
      <button onClick={handleUpdateQuiz}>Update Quiz</button>
    </div>
  );
};

export default QuizDetails;
