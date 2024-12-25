import React, { useState, useEffect } from 'react';
import {
  getQuizzes,
  fetchUserResponses,
  getQuizResponses,
  getDetailedQuizResponses,
} from '../../utils/QuizAPI';
import { getUsers } from '../../utils/UserAPI';
import DropdownComponent from './ResponseDropdownComponent';
import SummaryTable from './ResponseSummaryTable';
import DetailTable from './ResponseDetailTable';
import './css/ViewResponsesAdmin.css';

const ViewResponses = () => {
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedResponseType, setSelectedResponseType] = useState('summary');
  const [quizzes, setQuizzes] = useState([]);
  const [users, setUsers] = useState([]);
  const [responses, setResponses] = useState([]);
  const [viewType, setViewType] = useState('');
  const [error, setError] = useState('');

  // Fetch quizzes and users data when component loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizData = await getQuizzes();
        const userData = await getUsers();

        setQuizzes(quizData);
        setUsers(userData);
      } catch (err) {
        setError('Error loading data');
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Log changes to responses and state
  useEffect(() => {}, [responses, selectedResponseType]);

  const getSelectedQuizTitle = () => {
    const selectedQuizObj = quizzes.find(
      (quiz) => Number(quiz.id) === Number(selectedQuiz)
    );
    return selectedQuizObj ? selectedQuizObj.title : '';
  };

  const getSelectedUserName = () => {
    const selectedUserObj = users.find((user) => user.id === selectedUser);
    return selectedUserObj ? selectedUserObj.username : '';
  };

  const handleQuizSelect = async (quizId) => {
    setSelectedQuiz(quizId);
    setSelectedUser('');
    setViewType('quiz');
    setResponses([]);

    if (selectedResponseType === 'summary') {
      const quizResponses = await getQuizResponses(quizId);
      setResponses(quizResponses || []);
    } else if (selectedResponseType === 'detail') {
      const quizResponses = await getDetailedQuizResponses({
        quizId,
        type: 'quiz',
      });
      setResponses(quizResponses || []);
    }
  };

  const handleUserSelect = async (userId) => {
    setSelectedUser(userId);
    setSelectedQuiz('');
    setViewType('user');
    setResponses([]);

    if (selectedResponseType === 'summary') {
      const userResponses = await fetchUserResponses(userId);
      setResponses(userResponses || []);
    } else if (selectedResponseType === 'detail') {
      const userResponses = await getDetailedQuizResponses({
        userId,
        type: 'user',
      });
      setResponses(userResponses || []);
    }
  };

  const handleResponseTypeSelect = async (e) => {
    const newResponseType = e.target.value;
    setSelectedResponseType(newResponseType);
    setResponses([]);

    if (selectedQuiz) {
      if (newResponseType === 'summary') {
        const quizResponses = await getQuizResponses(selectedQuiz);
        setResponses(quizResponses || []);
      } else {
        const quizResponses = await getDetailedQuizResponses({
          quizId: selectedQuiz,
          type: 'quiz',
        });
        setResponses(quizResponses || []);
      }
    } else if (selectedUser) {
      if (newResponseType === 'summary') {
        const userResponses = await fetchUserResponses(selectedUser);
        setResponses(userResponses || []);
      } else {
        const userResponses = await getDetailedQuizResponses({
          userId: selectedUser,
          type: 'user',
        });
        setResponses(userResponses || []);
      }
    }
  };

  return (
    <div className="view-responses-page">
      <h2>View Responses</h2>

      {error && <p className="error-message">{error}</p>}

      <DropdownComponent
        selectedQuiz={selectedQuiz}
        selectedUser={selectedUser}
        selectedResponseType={selectedResponseType}
        quizzes={quizzes}
        users={users}
        handleQuizSelect={handleQuizSelect}
        handleUserSelect={handleUserSelect}
        handleResponseTypeSelect={handleResponseTypeSelect}
      />

      {/* Conditionally render summary or detailed table */}
      {responses ? (
        selectedResponseType === 'summary' ? (
          <SummaryTable
            responses={responses}
            viewType={viewType}
            selectedQuiz={getSelectedQuizTitle()}
            selectedUser={getSelectedUserName()}
          />
        ) : responses.responses && responses.questions ? (
          <DetailTable
            responses={responses.responses}
            questions={responses.questions}
            viewType={viewType}
            selectedQuizTitle={getSelectedQuizTitle()}
            selectedUserName={getSelectedUserName()}
          />
        ) : (
          <p>No valid data available to display</p>
        )
      ) : (
        <p>No responses available to display</p>
      )}
    </div>
  );
};

export default ViewResponses;
