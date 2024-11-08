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
      question_text: '',
      question_type: 'multiple-choice',
      options: [{ option_text: '', is_correct: false }],
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
    newQuestions[index].options.push({ option_text: '', is_correct: false });
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

    if (field === 'question_type') {
      if (value === 'true-false') {
        newQuestions[index].options = [
          { option_text: 'True', is_correct: false },
          { option_text: 'False', is_correct: false },
        ];
      } else if (value === 'text') {
        newQuestions[index].options = [{ option_text: '', is_correct: true }];
      } else if (value === 'multiple-choice') {
        newQuestions[index].options = [{ option_text: '', is_correct: false }];
      } else if (value === 'correct-order') {
        newQuestions[index].options = [{ option_text: '' }];
      } else if (value === 'match-pairs') {
        newQuestions[index].options = [
          { left_option_text: '', right_option_text: '' },
        ];
      }
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
        question_text: '',
        question_type: 'multiple-choice',
        options: [{ option_text: '', is_correct: false }],
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    for (const question of questions) {
      if (!question.question_text.trim()) {
        setError('Please fill out all fields.');
        return;
      }

      if (question.question_type === 'text') {
        if (!question.options[0].option_text.trim()) {
          setError('Please fill out all fields.');
          return;
        }
      } else if (
        question.question_type === 'multiple-choice' ||
        question.question_type === 'true-false'
      ) {
        let correctOptionSelected = false;
        for (const option of question.options) {
          if (!option.option_text.trim()) {
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
      } else if (question.question_type === 'correct-order') {
        for (const option of question.options) {
          if (!option.option_text.trim()) {
            setError('Please fill out all fields.');
            return;
          }
        }
      } else if (question.question_type === 'match-pairs') {
        for (const pair of question.options) {
          if (!pair.left_option_text.trim() || !pair.right_option_text.trim()) {
            setError(
              'Please fill out both left and right options for each pair.'
            );
            return;
          }
        }
      }
    }

    try {
      await addQuestions(selectedQuiz, questions);
      setMessage('Questions added successfully!');
      setQuestions([
        {
          question_text: '',
          question_type: 'multiple-choice',
          options: [{ option_text: '', is_correct: false }],
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
                value={question.question_text}
                onChange={(e) =>
                  handleQuestionChange(qIndex, 'question_text', e.target.value)
                }
                required
              />
            </div>
            <div>
              <label>Question Type</label>
              <select
                value={question.question_type}
                onChange={(e) =>
                  handleQuestionChange(qIndex, 'question_type', e.target.value)
                }
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="text">Text</option>
                <option value="correct-order">Correct Order</option>
                <option value="match-pairs">Match Pairs</option>
              </select>
            </div>
            {(question.question_type === 'multiple-choice' ||
              question.question_type === 'true-false') &&
              question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-block">
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) =>
                      handleOptionChange(
                        qIndex,
                        oIndex,
                        'option_text',
                        e.target.value
                      )
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    required
                    disabled={question.question_type === 'true-false'}
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
                  {question.question_type === 'multiple-choice' && (
                    <DeleteIcon
                      onClick={() => handleDeleteOption(qIndex, oIndex)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </div>
              ))}
            {question.question_type === 'text' && (
              <div>
                <label>Correct Answer</label>
                <input
                  type="text"
                  value={question.options[0]?.option_text || ''}
                  onChange={(e) =>
                    handleOptionChange(qIndex, 0, 'option_text', e.target.value)
                  }
                  required
                />
              </div>
            )}
            {question.question_type === 'correct-order' &&
              question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-block">
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) =>
                      handleOptionChange(
                        qIndex,
                        oIndex,
                        'option_text',
                        e.target.value
                      )
                    }
                    placeholder={`Step ${oIndex + 1}`}
                    required
                  />
                  <DeleteIcon
                    onClick={() => handleDeleteOption(qIndex, oIndex)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              ))}
            {question.question_type === 'match-pairs' &&
              question.options.map((pair, pIndex) => (
                <div key={pIndex} className="pair-block">
                  <input
                    type="text"
                    placeholder="Left option"
                    value={pair.left_option_text}
                    onChange={(e) =>
                      handleOptionChange(
                        qIndex,
                        pIndex,
                        'left_option_text',
                        e.target.value
                      )
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Right option"
                    value={pair.right_option_text}
                    onChange={(e) =>
                      handleOptionChange(
                        qIndex,
                        pIndex,
                        'right_option_text',
                        e.target.value
                      )
                    }
                    required
                  />
                  <DeleteIcon
                    onClick={() => handleDeleteOption(qIndex, pIndex)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              ))}
            {question.question_type === 'multiple-choice' && (
              <button type="button" onClick={() => handleAddOption(qIndex)}>
                Add Option
              </button>
            )}
            {question.question_type === 'correct-order' && (
              <button type="button" onClick={() => handleAddOption(qIndex)}>
                Add Step
              </button>
            )}
            {question.question_type === 'match-pairs' && (
              <button type="button" onClick={() => handleAddOption(qIndex)}>
                Add Pair
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
