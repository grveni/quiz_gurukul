import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_CONFIG_URL =
  process.env.REACT_APP_API_CONFIG_URL || 'http://localhost:5001/api/config';
const API_URL =
  process.env.REACT_APP_API_AUTH_URL || 'http://localhost:5001/api/auth';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token } = response.data;

    // Save the token in localStorage
    localStorage.setItem('token', token);

    // Decode the token to get the user's role
    const decodedToken = jwtDecode(token);
    return decodedToken.role;
  } catch (error) {
    // Send proper error message from server response if available
    console.log(error.response.data.message);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Aut: Login failed');
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token'); // Remove the token from localStorage
};

export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const decodedToken = jwtDecode(token);
  return decodedToken.role;
};

// Function to fetch roles
export const fetchRoles = async () => {
  try {
    console.log('API URL:', process.env.REACT_AUTH_APP_API_URL);
    const response = await axios.get(`${API_URL}/roles`, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return response.data.roles;
  } catch (err) {
    console.error('Failed to load roles:', err);
    throw new Error('Failed to load roles');
  }
};

// Function to register a user
export const registerUser = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/register`,
      {
        ...formData,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error('Error during registration:', err);
    throw new Error('Failed to register user');
  }
};

export async function fetchConfig(token = null) {
  // Prepare headers with or without token
  const headers = {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
  };

  // If token is provided, add Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios.get(
      `${API_CONFIG_URL}/userDetailsConfig.json`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching config: ${error.message}`);
  }
}
