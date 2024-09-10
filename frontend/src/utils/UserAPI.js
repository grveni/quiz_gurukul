import axios from 'axios';

const BASE_URL =
  process.env.REACT_APP_API_QUIZ_URL || 'http://localhost:5001/api/quizzes';

// Fetch the config that provides the form fields dynamically
export const fetchConfig = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/config`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching config');
  }
};

// Fetch the current user's profile
/*export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT authentication
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error fetching user profile'
    );
  }
};*/

// Update the user's profile with new data
export const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put(`${BASE_URL}/user/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT authentication
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error updating user profile'
    );
  }
};

// Change the user's password
export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/user/change-password`,
      { currentPassword, newPassword },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT authentication
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error changing password');
  }
};

// Register a new user (assuming this is already part of your AuthAPI)
export const registerUser = async (dataToSubmit) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, dataToSubmit);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error registering user');
  }
};

// Fetch available roles (assuming this is already part of your AuthAPI)
export const fetchRoles = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/roles`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching roles');
  }
};

export const getUserProfile = async () => {
  return {
    username: 'johndoe',
    email: 'john.doe@example.com',
    phone: '+123456789',
    flat_no: 'A101',
    building_name: 'Maple',
    parent_name: 'John Doe Sr.',
    standard: '10th',
    role: 'student',
  };
};

// Mock API call to change password
export const changeUserPassword = async (passwordData) => {
  // Simulate password change success
  if (passwordData.currentPassword === 'wrongpassword') {
    // Simulate error if the current password is incorrect
    throw new Error('Current password is incorrect');
  }
  return { success: true, message: 'Password changed successfully' };
};
