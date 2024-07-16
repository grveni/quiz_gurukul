import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:5001/api/auth'; // Change this to your actual backend URL

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
