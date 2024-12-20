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

export const getUserProfile = async (userId = null) => {
  const token = localStorage.getItem('token');
  const url = userId
    ? `${BASE_URL}/users/${userId}/profile` // Backend endpoint for admin to fetch specific user
    : `${BASE_URL}/me/profile`; // Backend endpoint for logged-in user

  const response = await axios.get(url, {
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

// Simulate fetching users names
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

// Simulate fetching users details
export const getUsersDetails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/list-users-details`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT authentication
      },
    });
    return response.data;
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

//Fetch admin preferences (selected fields)
export const fetchPreferences = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/admin/preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('raw data: ', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching preferences:', error.message);
    throw new Error('Failed to fetch preferences');
  }
};

// Save admin preferences (selected fields)
export const savePreferences = async (preferences) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/admin/preferences/save`,
      { preferences },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data.message || 'Preferences saved successfully';
  } catch (error) {
    console.error('Error saving preferences:', error.message);
    throw new Error('Failed to save preferences');
  }
};
