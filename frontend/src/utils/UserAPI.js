import axios from 'axios';

const BASE_URL =
  process.env.REACT_APP_API_USERS_URL || 'http://localhost:5001/api/users';

// Change the user's password
export const changeUserPassword = async (passwordData) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${BASE_URL}/me/change-password`,
    {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL}/me/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserProfile = async (userDetails) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${BASE_URL}/me/profile`, userDetails, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Simulate fetching users
export const getUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/list-users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT authentication
      },
    });
    return response.data.users;
  } catch (error) {
    console.error(
      'Error fetching users from API:',
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};

// Fetch only the current user's ID
export const getUserId = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found, please log in');
    }

    // Make a GET request to the new endpoint to fetch the user ID
    const response = await axios.get(`${BASE_URL}/me/id`, {
      headers: {
        Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
      },
    });
    return response.data.id; // Return only the user ID
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Error fetching user ID');
    }
  }
};
