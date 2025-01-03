import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_QUIZ_URL || 'http://localhost:5001/api/quizzes';

/**
 * Create a new quiz
 * @param {Object} quizData - The data for the new quiz (title, description, etc.)
 * @returns {Object} - The created quiz data
 * @throws {Error} - Throws an error if the request fails
 */
export const createQuiz = async (quizData) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.post(`${API_URL}/addQuiz`, quizData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to create quiz'
    );
  }
};

/**
 * Add questions to a quiz
 * @param {number} quizId - The ID of the quiz
 * @param {Array} questions - The list of questions to be added
 * @returns {Object} - The response data from the server
 * @throws {Error} - Throws an error if the request fails
 */
export const addQuestions = async (quizId, questions) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.post(
      `${API_URL}/add-questions`,
      { quizId, questions },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding questions:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to add questions'
    );
  }
};

/**
 * List all questions in a specific quiz
 * @param {number} quizId - The ID of the quiz
 * @returns {Array} - The list of questions
 * @throws {Error} - Throws an error if the request fails
 */
export const listAllQuestions = async (quizId) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.get(`${API_URL}/${quizId}/questions`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to fetch questions'
    );
  }
};

/**
 * Update a question in a specific quiz
 * @param {number} quizId - The ID of the quiz
 * @param {number} questionId - The ID of the question
 * @param {Object} questionData - The updated data for the question
 * @returns {Object} - The updated question data
 * @throws {Error} - Throws an error if the request fails
 */
export const updateQuestion = async (quizId, questionId, questionData) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.put(
      `${API_URL}/${quizId}/questions/${questionId}`,
      questionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to update question'
    );
  }
};

/**
 * Delete a question in a specific quiz
 * @param {number} quizId - The ID of the quiz
 * @param {number} questionId - The ID of the question
 * @returns {Object} - The response data from the server
 * @throws {Error} - Throws an error if the request fails
 */
export const deleteQuestion = async (quizId, questionId) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.delete(
      `${API_URL}/${quizId}/questions/${questionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to delete question'
    );
  }
};

/**
 * Delete multiple questions in a specific quiz
 * @param {number} quizId - The ID of the quiz
 * @param {Array<number>} questionIds - The IDs of the questions to be deleted
 * @returns {Object} - The response data from the server
 * @throws {Error} - Throws an error if the request fails
 */
export const deleteMultipleQuestions = async (quizId, questionIds) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.delete(`${API_URL}/${quizId}/questions`, {
      data: { questionIds },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting multiple questions:', error);
    throw new Error(
      error.response
        ? error.response.data.message
        : 'Failed to delete multiple questions'
    );
  }
};

/**
 * Get a list of all quizzes no pagination
 * @returns {Array} - The list of quizzes
 * @throws {Error} - Throws an error if the request fails
 */
export const getQuizzes = async () => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.get(`${API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to fetch quizzes'
    );
  }
};

/**
 * Get a list of all quizzes with pagination
 * @param {Number} page - The page number to fetch
 * @returns {Object} - The list of quizzes and total pages
 */
export const getQuizzesWithPagination = async (page = 1) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.get(
      `${API_URL}/listAllPagination?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to fetch quizzes'
    );
  }
};

/**
 * Get a particular quiz by ID
 * @param {number} quizId - The ID of the quiz
 * @returns {Object} - The quiz data
 * @throws {Error} - Throws an error if the request fails
 */
export const getQuiz = async (quizId) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.get(`${API_URL}/${quizId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to fetch quiz'
    );
  }
};

/**
 * Update a quiz by ID
 * @param {number} quizId - The ID of the quiz
 * @param {Object} quizData - The updated data for the quiz
 * @returns {Object} - The updated quiz data
 * @throws {Error} - Throws an error if the request fails
 */
export const updateQuiz = async (quizId, quizData) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.put(`${API_URL}/${quizId}`, quizData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw new Error(
      error.response ? error.response.data.message : 'Failed to update quiz'
    );
  }
};

export const getNextUntakenQuiz = async () => {
  const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
  const response = await axios.get(`${API_URL}/student/next`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const submitQuizAnswers = async (quizId, answers) => {
  const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
  const response = await axios.post(
    `${API_URL}/${quizId}/submit`,
    answers, // Directly include the answers array
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * update the status of Quiz
 * @param {Number} quizId - Quiz's id
 * @returns {Object} - response status with message
 */
export const getQuizResults = async (quizId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/student/${quizId}/results`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/**
 * Fetch correct answers for a student's latest attempt
 * @param {string} quizId - The ID of the quiz
 * @returns {Object} - Correct answers for the attempt
 */
export const getCorrectAnswers = async (quizId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/student/${quizId}/correctAnswers`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching correct answers:', error);
    throw new Error(
      error.response?.data?.error || 'Failed to fetch correct answers.'
    );
  }
};

export const updateQuizStatus = async (quizId, isActive) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.patch(
      `${API_URL}/${quizId}/status`,
      { is_active: isActive },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    // Capture and throw the exact error message from the backend response
    const errorMessage =
      error.response?.data?.error || 'Failed to update quiz status';
    throw new Error(errorMessage);
  }
};

/**
 * Get active quizzes taken by a user in the past
 * @returns {Array} - The list of quizzes
 * @throws {Error} - Throws an error if the request fails
 */
export const getUserActiveQuizzes = async (includeArchived = false) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `${API_URL}/student/active-quizzes?includeArchived=${includeArchived}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data; // Ensure proper data structure
  } catch (error) {
    console.error('Error fetching active quizzes:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch active quizzes.'
    );
  }
};

/**
 * Get the details of a specific quiz by ID for retaking
 * @param {number} quizId - The ID of the quiz
 * @returns {Object} - The quiz details
 * @throws {Error} - Throws an error if the request fails
 */
export const getQuizById = async (quizId) => {
  try {
    const token = localStorage.getItem('token'); // Assuming JWT token is stored in localStorage
    const response = await axios.get(`${API_URL}/student/${quizId}/take`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz details:', error);
  }
};

// Simulate fetching quiz responses
export const getQuizResponses = async (quizId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${quizId}/responses`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.responses;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch quiz responses'
    );
  }
};

// Simulate fetching user responses
export const fetchUserResponses = async (userId) => {
  return [
    { quizId: '1', quizTitle: 'Math Quiz', score: 80, percentage: 80 },
    { quizId: '2', quizTitle: 'Science Quiz', score: 75, percentage: 75 },
  ];
};

/**
 * Fetch detailed quiz or user responses from the backend
 * @param {Object} params - Contains quizId, userId, and type (quiz/user)
 * @returns {Array} - Detailed responses
 */
export const getDetailedQuizResponses = async ({ quizId, userId, type }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/detailed-responses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        quizId,
        userId,
        type,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed quiz responses:', error);
    throw new Error('Failed to fetch detailed responses');
  }
};

// Fetch new quizzes (unattempted quizzes)
export const getNewQuizzes = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/student/new-quizzes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.quizzes;
  } catch (error) {
    console.error('Error fetching new quizzes:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch new quizzes.'
    );
  }
};

export const archiveQuiz = async (quizId, archive) => {
  const token = localStorage.getItem('token');
  await axios.post(
    `${API_URL}/student/archive-quiz`,
    { quizId, archive },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};
