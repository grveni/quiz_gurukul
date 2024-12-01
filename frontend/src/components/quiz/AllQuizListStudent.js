import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Tab, Table, Button, Checkbox } from '@mui/material';
import {
  getUserActiveQuizzes,
  getNewQuizzes,
  archiveQuiz,
} from '../../utils/QuizAPI'; // Dummy APIs to be defined later
import './css/QuizListStudent.css'; // Import new CSS file

const AllQuizListStudent = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [newQuizzes, setNewQuizzes] = useState([]); // List of new published quizzes
  const [takenQuizzes, setTakenQuizzes] = useState([]); // List of already taken quizzes
  const [archivedQuizIds, setArchivedQuizIds] = useState([]); // To track archived quizzes
  const [showAll, setShowAll] = useState(false); // Toggle to show archived quizzes
  const [loading, setLoading] = useState(false); // For loading state
  const [errorMessage, setErrorMessage] = useState(''); // For error handling

  useEffect(() => {
    // Function to fetch both new and taken quizzes
    async function fetchQuizzes() {
      setLoading(true);
      setErrorMessage(''); // Reset error message before new fetch attempt

      try {
        // Fetch taken quizzes
        const takenQuizData = await getUserActiveQuizzes(showAll); // Pass current `showAll` state
        setTakenQuizzes(takenQuizData || []); // Fallback to an empty array if no data

        // Update `archivedQuizIds` directly from the response
        const archivedIds = takenQuizData
          .filter((quiz) => quiz.is_archived) // Use `is_archived` from the response
          .map((quiz) => quiz.id);
        setArchivedQuizIds(archivedIds);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to fetch taken quizzes.');
      }

      try {
        // Fetch new quizzes
        const newQuizData = await getNewQuizzes();
        setNewQuizzes(newQuizData || []); // Fallback to an empty array if no data
      } catch (error) {
        setErrorMessage(error.message || 'Failed to fetch new quizzes.');
      }

      setLoading(false);
    }

    fetchQuizzes();
  }, [showAll]); // Re-fetch quizzes when `showAll` state changes

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle archiving and unarchiving quizzes
  const handleArchiveQuiz = async (quizId) => {
    try {
      const archive = !archivedQuizIds.includes(quizId);
      await archiveQuiz(quizId, archive);

      setArchivedQuizIds((prevIds) =>
        archive ? [...prevIds, quizId] : prevIds.filter((id) => id !== quizId)
      );

      // Update `is_archived` in `takenQuizzes` for consistency
      setTakenQuizzes((prevQuizzes) =>
        prevQuizzes.map((quiz) =>
          quiz.id === quizId ? { ...quiz, is_archived: archive } : quiz
        )
      );
    } catch (error) {
      console.error('Error archiving/unarchiving quiz:', error);
    }
  };

  const handleShowAllToggle = async () => {
    const updatedShowAll = !showAll; // Calculate the updated value
    setShowAll(updatedShowAll);

    try {
      const quizzes = await getUserActiveQuizzes(updatedShowAll); // Use the updated value
      setTakenQuizzes(quizzes || []); // Fallback to empty array
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setErrorMessage(error.message || 'Failed to fetch quizzes.');
    }
  };

  const filteredTakenQuizzes = showAll
    ? takenQuizzes // Show all quizzes
    : takenQuizzes.filter((quiz) => !archivedQuizIds.includes(quiz.id)); // Exclude archived

  return (
    <div className="quizzes-page">
      {loading && <p>Loading quizzes...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="New Published Quizzes" className="tabs-label" />
        <Tab label="Completed Quizzes" className="tabs-label" />{' '}
        {/* Changed label */}
      </Tabs>

      {/* New Published Quizzes */}
      {selectedTab === 0 && (
        <div className="new-quizzes">
          <Table>
            <thead>
              <tr>
                <th>Quiz Title</th>
              </tr>
            </thead>
            <tbody>
              {newQuizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>
                    <div
                      className="table-cell-wrap"
                      data-full-title={quiz.title}
                    >
                      <Link to={`/student/take-quiz/${quiz.id}`}>
                        {quiz.title}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Completed Quizzes */}
      {selectedTab === 1 && (
        <div className="taken-quizzes">
          <Table>
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Results</th>
                <th>Archive</th>
              </tr>
            </thead>
            <tbody>
              {filteredTakenQuizzes.length > 0 ? (
                filteredTakenQuizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td>
                      <div
                        className="table-cell-wrap"
                        data-full-title={quiz.title}
                      >
                        <Link to={`/student/take-quiz/${quiz.id}`}>
                          {quiz.title}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="contained"
                        color="primary"
                        className="view-results-button MuiButton-root"
                        component={Link}
                        to={`/student/results/${quiz.id}`}
                      >
                        Results
                      </Button>
                    </td>
                    <td>
                      <Checkbox
                        checked={quiz.is_archived} // Directly use `is_archived` from the quiz object
                        onChange={() => handleArchiveQuiz(quiz.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No quizzes available</td>
                </tr>
              )}
            </tbody>
          </Table>

          <div className="show-all-button">
            <Button
              variant="contained"
              className="MuiButton-root"
              onClick={handleShowAllToggle}
            >
              {showAll ? 'Show Only Active Quizzes' : 'Show All Quizzes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllQuizListStudent;
