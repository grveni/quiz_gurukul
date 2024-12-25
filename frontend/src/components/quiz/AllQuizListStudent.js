import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Checkbox, Collapse, Typography } from '@mui/material';
import {
  getUserActiveQuizzes,
  getNewQuizzes,
  archiveQuiz,
} from '../../utils/QuizAPI'; // Dummy APIs to be defined later
import './css/QuizListStudent.css'; // Import new CSS file

const AllQuizListStudent = () => {
  const [newQuizzes, setNewQuizzes] = useState([]);
  const [takenQuizzes, setTakenQuizzes] = useState([]);
  const [archivedQuizIds, setArchivedQuizIds] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openNewQuizzes, setOpenNewQuizzes] = useState(true);
  const [openTakenQuizzes, setOpenTakenQuizzes] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true);
      setErrorMessage('');
      try {
        const takenQuizData = await getUserActiveQuizzes(showAll);
        setTakenQuizzes(takenQuizData || []);
        const archivedIds = takenQuizData
          .filter((quiz) => quiz.is_archived)
          .map((quiz) => quiz.id);
        setArchivedQuizIds(archivedIds);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to fetch taken quizzes.');
      }
      try {
        const newQuizData = await getNewQuizzes();
        setNewQuizzes(newQuizData || []);
      } catch (error) {
        setErrorMessage(error.message || 'Failed to fetch new quizzes.');
      }
      setLoading(false);
    }
    fetchQuizzes();
  }, [showAll]);

  const handleArchiveQuiz = async (quizId) => {
    try {
      const archive = !archivedQuizIds.includes(quizId);
      await archiveQuiz(quizId, archive);
      setArchivedQuizIds((prevIds) =>
        archive ? [...prevIds, quizId] : prevIds.filter((id) => id !== quizId)
      );
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
    setShowAll(!showAll);
  };

  const filteredTakenQuizzes = showAll
    ? takenQuizzes
    : takenQuizzes.filter((quiz) => !archivedQuizIds.includes(quiz.id));

  return (
    <div className="quizzes-page">
      {loading && <p>Loading quizzes...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* New Quizzes Section */}
      <div className="new-quizzes-section">
        <Typography
          variant="h6"
          onClick={() => setOpenNewQuizzes((prev) => !prev)}
          style={{ cursor: 'pointer' }}
        >
          New Published Quizzes {openNewQuizzes ? '▼' : '▲'}
        </Typography>
        <Collapse in={openNewQuizzes}>
          {newQuizzes.length > 0 ? (
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
          ) : (
            <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
              No new quizzes are published yet.
            </p>
          )}
        </Collapse>
      </div>

      {/* Taken Quizzes Section */}
      <div className="taken-quizzes-section">
        <Typography
          variant="h6"
          onClick={() => setOpenTakenQuizzes((prev) => !prev)}
          style={{ cursor: 'pointer' }}
        >
          Attempted Quizzes {openTakenQuizzes ? '▼' : '▲'}
        </Typography>
        <Collapse in={openTakenQuizzes}>
          {filteredTakenQuizzes.length > 0 ? (
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
                        className="view-results-button"
                        component={Link}
                        to={`/student/results/${quiz.id}`}
                      >
                        Results
                      </Button>
                    </td>
                    <td>
                      <Checkbox
                        checked={quiz.is_archived}
                        onChange={() => handleArchiveQuiz(quiz.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
              No completed quizzes are available.
            </p>
          )}
          <div className="show-all-button">
            <Button
              variant="contained"
              className="MuiButton-root"
              onClick={handleShowAllToggle}
            >
              {showAll ? 'Show Only Active Quizzes' : 'Show All Quizzes'}
            </Button>
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default AllQuizListStudent;
