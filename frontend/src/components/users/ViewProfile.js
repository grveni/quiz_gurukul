import React, { useState, useEffect } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '../../utils/UserAPI';
import { fetchConfig } from '../../utils/AuthAPI';
import { useNavigate } from 'react-router-dom';

const ViewProfile = () => {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false); // State to toggle password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(''); // Error state for password change
  const [globalErrors, setGlobalErrors] = useState([]);
  const [editMode, setEditMode] = useState(true); // Set true for enabling edits
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch config for fields
        const config = await fetchConfig(token);
        const formFieldsConfig = config.fields || config.data?.fields || {};

        // Fetch user profile
        const userProfile = await getUserProfile();

        // Filter out password field from formFields
        const filteredFields = Object.keys(formFieldsConfig)
          .filter((key) => key !== 'password') // Remove password from the fields
          .map((key) => ({
            name: key,
            ...formFieldsConfig[key],
          }));

        setFormFields(filteredFields);
        setFormData(userProfile); // Populate form with user data
      } catch (err) {
        setGlobalErrors((prevErrors) => [
          ...prevErrors,
          { msg: `Error fetching data: ${err.message}` },
        ]);
      }
    }

    fetchInitialData();
  }, [navigate]);

  // Handle change in the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle change in password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Submit the updated user information
  const handleUpdateInfo = async () => {
    try {
      await updateUserProfile(formData); // Update user profile API call
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  // Submit the password change
  const handlePasswordSubmit = async () => {
    setPasswordError(''); // Reset error before submitting
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      const result = await changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }); // Change password API call
      alert(result.message); // Display success message from backend
      setShowPasswordForm(false); // Hide the password form after successful change
    } catch (error) {
      setPasswordError(
        error.response?.data?.error || 'Error changing password'
      ); // Show backend error message
    }
  };

  const renderInputField = (field) => {
    const { name, form } = field;
    const { type, placeholder, options } = form;

    if (options && Array.isArray(options)) {
      return (
        <div key={name} className="form-field">
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            disabled={!editMode}
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={name} className="form-field">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={formData[name] || ''}
          onChange={handleInputChange}
          readOnly={!editMode} // Make fields editable when not in view-only mode
        />
      </div>
    );
  };

  return (
    <div className="form-container">
      <h1>View Profile</h1>

      {/* Change Password Link */}
      <a
        href="#"
        onClick={() => setShowPasswordForm(!showPasswordForm)}
        style={{ textDecoration: 'underline', cursor: 'pointer' }}
      >
        Change Password
      </a>

      {/* Render Password Form */}
      {showPasswordForm && (
        <div
          className="password-form"
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            margin: '10px 0',
          }}
        >
          <h3>Change Password</h3>
          <div className="form-field">
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-field">
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-field">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
          <button onClick={handlePasswordSubmit}>Submit</button>
        </div>
      )}

      {/* User Profile Form */}
      <form>
        {formFields.map(renderInputField)}
        <button type="button" onClick={handleUpdateInfo}>
          Update Info
        </button>
      </form>

      {globalErrors.length > 0 && (
        <div className="error-message">
          {globalErrors.map((error, index) => (
            <p key={index}>{error.msg}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
