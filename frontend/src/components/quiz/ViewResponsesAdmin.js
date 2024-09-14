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
        console.log('Fetched quizzes:', quizData); // Log fetched quizzes
        console.log('Fetched users:', userData); // Log fetched users
        setQuizzes(quizData);
        setUsers(userData);
      } catch (err) {
        setError('Error loading data');
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Get the selected quiz title
  // Get the selected quiz title
  const getSelectedQuizTitle = () => {
    console.log('Selected quiz ID (type):', selectedQuiz, typeof selectedQuiz); // Log selected quiz ID and type

    const selectedQuizObj = quizzes.find((quiz) => {
      console.log(
        `Comparing quiz ID: ${
          quiz.id
        } with selectedQuiz: ${selectedQuiz} (types: ${typeof quiz.id} and ${typeof selectedQuiz})`
      );
      return Number(quiz.id) === Number(selectedQuiz); // Use == to handle string/number mismatch
    });

    console.log('Selected quiz object:', selectedQuizObj); // Log the selected quiz object

    const quizTitle = selectedQuizObj ? selectedQuizObj.title : '';
    console.log(`Selected quiz title: ${quizTitle}`); // Log the selected quiz title
    return quizTitle;
  };

  // Get the selected user name
  const getSelectedUserName = () => {
    console.log('Selected user ID:', selectedUser); // Log the selected user ID
    const selectedUserObj = users.find((user) => {
      console.log(
        `Comparing user ID: ${user.id} with selectedUser: ${selectedUser}`
      );
      return user.id === selectedUser; // Ensure IDs are correctly compared
    });
    const userName = selectedUserObj ? selectedUserObj.username : '';
    console.log(`Selected user name: ${userName}`); // Log the selected user name
    return userName;
  };

  // Handle quiz selection
  const handleQuizSelect = async (quizId) => {
    setSelectedQuiz(quizId);
    setSelectedUser('');
    setViewType('quiz');
    setResponses([]); // Clear previous responses when switching

    console.log(`Selected Quiz ID: ${quizId}`);
    console.log(`Response Type: ${selectedResponseType}`);

    if (selectedResponseType === 'summary') {
      const quizResponses = await getQuizResponses(quizId);
      console.log('Summary responses for quiz:', quizResponses);
      setResponses(quizResponses || []);
    } else if (selectedResponseType === 'detail') {
      const quizResponses = await getDetailedQuizResponses({
        quizId,
        type: 'quiz',
      });
      console.log('Detailed responses for quiz:', quizResponses);
      setResponses(quizResponses || []);
    }
  };

  // Handle user selection
  const handleUserSelect = async (userId) => {
    setSelectedUser(userId);
    setSelectedQuiz('');
    setViewType('user');
    setResponses([]); // Clear previous responses when switching

    console.log(`Selected User ID: ${userId}`);
    console.log(`Response Type: ${selectedResponseType}`);

    if (selectedResponseType === 'summary') {
      const userResponses = await fetchUserResponses(userId);
      console.log('Summary responses for user:', userResponses);
      setResponses(userResponses || []);
    } else if (selectedResponseType === 'detail') {
      const userResponses = await getDetailedQuizResponses({
        userId,
        type: 'user',
      });
      console.log('Detailed responses for user:', userResponses);
      setResponses(userResponses || []);
    }
  };

  // Handle response type change
  const handleResponseTypeSelect = async (e) => {
    const newResponseType = e.target.value;
    setSelectedResponseType(newResponseType);
    setResponses([]); // Clear previous responses when switching

    console.log('Changed response type to:', newResponseType);

    // Re-fetch responses based on the current selection
    if (selectedQuiz) {
      console.log(
        `Re-fetching for quiz ID: ${selectedQuiz} with type: ${newResponseType}`
      );
      if (newResponseType === 'summary') {
        const quizResponses = await getQuizResponses(selectedQuiz);
        console.log('Summary responses for quiz:', quizResponses);
        setResponses(quizResponses || []);
      } else {
        const quizResponses = await getDetailedQuizResponses({
          quizId: selectedQuiz,
          type: 'quiz',
        });
        console.log('Detailed responses for quiz:', quizResponses);
        setResponses(quizResponses || []);
      }
    } else if (selectedUser) {
      console.log(
        `Re-fetching for user ID: ${selectedUser} with type: ${newResponseType}`
      );
      if (newResponseType === 'summary') {
        const userResponses = await fetchUserResponses(selectedUser);
        console.log('Summary responses for user:', userResponses);
        setResponses(userResponses || []);
      } else {
        const userResponses = await getDetailedQuizResponses({
          userId: selectedUser,
          type: 'user',
        });
        console.log('Detailed responses for user:', userResponses);
        setResponses(userResponses || []);
      }
    }
  };

  // Log the current responses before rendering
  console.log('Current Responses:', responses);

  return (
    <div className="view-responses-page">
      <h2>View Responses</h2>

      {error && <p className="error-message">{error}</p>}

      {/* Render Dropdown Component */}
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
      {responses.length > 0 &&
        (selectedResponseType === 'summary' ? (
          <SummaryTable
            responses={responses}
            viewType={viewType}
            selectedQuiz={getSelectedQuizTitle()} // Pass quiz title
            selectedUser={getSelectedUserName()} // Pass user name
          />
        ) : (
          <DetailTable
            responses={responses}
            viewType={viewType}
            selectedQuizTitle={getSelectedQuizTitle()} // Pass quiz title
            selectedUserName={getSelectedUserName()} // Pass user name
          />
        ))}
    </div>
  );
};

export default ViewResponses;
