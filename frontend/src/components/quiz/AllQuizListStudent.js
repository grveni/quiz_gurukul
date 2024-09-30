import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Tab, Table, Button, Checkbox } from '@mui/material';
import { getUserActiveQuizzes, getNewQuizzes } from '../../utils/QuizAPI'; // Dummy APIs to be defined later
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
    // Function to fetch quizzes
    async function fetchQuizzes() {
      setLoading(true);
      setErrorMessage(''); // Reset error message before new fetch attempt

      try {
        const takenQuizData = await getUserActiveQuizzes();
        setTakenQuizzes(takenQuizData);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to fetch taken quizzes.');
      }

      try {
        // Fetch new quizzes from the backend API
        const newQuizData = await getNewQuizzes();
        console.log(newQuizData);
        setNewQuizzes(newQuizData);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to fetch new quizzes.');
      }

      setLoading(false);
    }

    fetchQuizzes();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle archiving and unarchiving quizzes
  const handleArchiveQuiz = (quizId) => {
    setArchivedQuizIds(
      (prevIds) =>
        prevIds.includes(quizId)
          ? prevIds.filter((id) => id !== quizId) // Unarchive if already archived
          : [...prevIds, quizId] // Archive if not archived
    );
  };

  const handleShowAllToggle = () => {
    setShowAll((prevState) => !prevState); // Toggle between show all and show only active
  };

  const filteredTakenQuizzes = showAll
    ? takenQuizzes
    : takenQuizzes.filter((quiz) => !archivedQuizIds.includes(quiz.id));

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
              {filteredTakenQuizzes.map((quiz) => (
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
                      checked={archivedQuizIds.includes(quiz.id)}
                      onChange={() => handleArchiveQuiz(quiz.id)}
                    />
                  </td>
                </tr>
              ))}
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
