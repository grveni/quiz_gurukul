import React, { useState, useEffect } from 'react';
import { getNextUntakenQuiz, submitQuizAnswers } from '../../utils/QuizAPI';
import { useNavigate } from 'react-router-dom';

const TakeQuiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quizData = await getNextUntakenQuiz();
        console.log('Quiz Data:', quizData); // Log the quizData
        setQuiz(quizData.quiz);

        // Ensure options are loaded into questions
        const questionsWithOptions = quizData.quiz.questions.map(
          (question) => ({
            ...question,
            options: question.options || [], // Ensure options is always an array
          })
        );

        setQuiz((prevQuiz) => ({
          ...prevQuiz,
          questions: questionsWithOptions,
        }));

        if (questionsWithOptions && Array.isArray(questionsWithOptions)) {
          setAnswers(
            questionsWithOptions.map((question) => ({
              questionId: question.id,
              selectedOption: '',
              answerText: '',
            }))
          );
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz');
      }
    }
    fetchQuiz();
  }, []);

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
      console.log('Quiz submitted', quiz.id, answers);
      const result = await submitQuizAnswers(quiz.id, answers);
      console.log('Quiz Result:', result); // Log the result
      //const path = '/dummy';
      const path = `/student/results/${quiz.id}`;
      console.log('Navigating to:', path);
      navigate(path);
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="take-quiz">
      <h2>{quiz.title}</h2>
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
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default TakeQuiz;
