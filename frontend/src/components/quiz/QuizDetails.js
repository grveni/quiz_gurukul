import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getQuiz,
  updateQuiz,
  listAllQuestions,
  //updateQuestion,
  deleteQuestion,
} from '../../utils/QuizAPI';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { logout } from '../../utils/Auth';

const QuizDetails = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuizDetails() {
      try {
        const quizData = await getQuiz(quizId);
        setQuiz(quizData);
        const questionData = await listAllQuestions(quizId);
        setQuestions(questionData);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="quiz-details">
      <AppBar position="static" className="header">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quiz System
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
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
              value={question.questionText}
              onChange={(e) =>
                handleQuestionChange(index, 'questionText', e.target.value)
              }
              required
            />
          </div>
          <div>
            <label>Question Type</label>
            <input
              type="text"
              value={question.questionType}
              onChange={(e) =>
                handleQuestionChange(index, 'questionType', e.target.value)
              }
              required
            />
          </div>
          {question.options && question.options.length > 0 && (
            <div>
              <label>Options</label>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-block">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(index, oIndex, 'text', e.target.value)
                    }
                    required
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={option.is_correct}
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
          {question.questionType === 'text' && (
            <div>
              <label>Correct Answer</label>
              <input
                type="text"
                value={question.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(index, 'correctAnswer', e.target.value)
                }
                required
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuizDetails;
