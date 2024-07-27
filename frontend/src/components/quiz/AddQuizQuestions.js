import React, { useState, useEffect } from 'react';
import { getQuizzes, addQuestions } from '../../utils/QuizAPI';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/AuthAPI';

const AddQuestions = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      questionType: 'multiple-choice',
      options: [{ text: '', is_correct: false }],
      correctAnswer: '', // Adding correctAnswer field for text type questions
    },
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const quizzes = await getQuizzes();
        setQuizzes(quizzes);
      } catch (err) {
        setError('Failed to load quizzes');
      }
    }
    fetchQuizzes();
  }, []);

  const handleAddOption = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].options.push({ text: '', is_correct: false });
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex][field] = value;
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    if (field === 'questionType' && value === 'true-false') {
      newQuestions[index].options = [
        { text: 'True', is_correct: false },
        { text: 'False', is_correct: false },
      ];
    } else if (field === 'questionType' && value !== 'multiple-choice') {
      newQuestions[index].options = [
        { text: value === 'true-false' ? 'True' : '', is_correct: false },
        { text: value === 'true-false' ? 'False' : '', is_correct: false },
      ];
    }
    setQuestions(newQuestions);
  };

  const handleDeleteOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        questionType: 'multiple-choice',
        options: [{ text: '', is_correct: false }],
        correctAnswer: '', // Adding correctAnswer field for text type questions
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    // Validate no empty fields
    for (const question of questions) {
      if (!question.questionText.trim()) {
        setError('Please fill out all fields.');
        return;
      }
      if (question.questionType === 'text' && !question.correctAnswer.trim()) {
        setError('Please fill out all fields.');
        return;
      }
      if (question.questionType !== 'text') {
        let correctOptionSelected = false;
        for (const option of question.options) {
          if (!option.text.trim()) {
            setError('Please fill out all fields.');
            return;
          }
          if (option.is_correct) {
            correctOptionSelected = true;
          }
        }
        if (!correctOptionSelected) {
          setError(
            'Please select at least one correct option for each question.'
          );
          return;
        }
      }
    }
    try {
      await addQuestions(selectedQuiz, questions);
      setMessage('Questions added successfully!');
      setQuestions([
        {
          questionText: '',
          questionType: 'multiple-choice',
          options: [{ text: '', is_correct: false }],
          correctAnswer: '', // Adding correctAnswer field for text type questions
        },
      ]);
    } catch (error) {
      setError('Failed to add questions');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="add-questions">
      <h2>Add Questions</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Quiz</label>
          <select
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
            required
          >
            <option value="">Select a quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="question-block">
            <div className="question-header">
              <label>Question {qIndex + 1}</label>
              <DeleteIcon
                onClick={() => handleDeleteQuestion(qIndex)}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div>
              <label>Question Text</label>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) =>
                  handleQuestionChange(qIndex, 'questionText', e.target.value)
                }
                required
              />
            </div>
            <div>
              <label>Question Type</label>
              <select
                value={question.questionType}
                onChange={(e) =>
                  handleQuestionChange(qIndex, 'questionType', e.target.value)
                }
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="text">Text</option>
              </select>
            </div>
            {(question.questionType === 'multiple-choice' ||
              question.questionType === 'true-false') &&
              question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-block">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(qIndex, oIndex, 'text', e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    required
                    disabled={question.questionType === 'true-false'}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={option.is_correct}
                      onChange={(e) =>
                        handleOptionChange(
                          qIndex,
                          oIndex,
                          'is_correct',
                          e.target.checked
                        )
                      }
                    />
                    Correct
                  </label>
                  {question.questionType === 'multiple-choice' && (
                    <DeleteIcon
                      onClick={() => handleDeleteOption(qIndex, oIndex)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              ))}
            {question.questionType === 'text' && (
              <div>
                <label>Correct Answer</label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(
                      qIndex,
                      'correctAnswer',
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            )}
            {question.questionType === 'multiple-choice' && (
              <button type="button" onClick={() => handleAddOption(qIndex)}>
                Add Option
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddQuestion}>
          Add Question
        </button>
        <button type="submit">Submit Questions</button>
      </form>
    </div>
  );
};

export default AddQuestions;
