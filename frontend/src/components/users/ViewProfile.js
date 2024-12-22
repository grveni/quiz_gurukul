import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '../../utils/UserAPI';
import { fetchConfig } from '../../utils/AuthAPI';
import { useNavigate } from 'react-router-dom';

const ViewProfile = () => {
  const { userId } = useParams(); // Extract userId from route params
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false); // Toggle for password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(''); // Password error state
  const [globalErrors, setGlobalErrors] = useState([]);
  const [editMode, setEditMode] = useState(true); // Profile edit mode

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch config for user fields
        const config = await fetchConfig(token);
        const formFieldsConfig = config.fields || config.data?.fields || {};

        // Fetch user profile
        const userProfile = await getUserProfile(userId);

        // Filter out password field from formFields
        const filteredFields = Object.keys(formFieldsConfig)
          .filter((key) => key !== 'password') // Exclude password field
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
  }, [navigate, userId]);

  // Handle change in the profile fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle change in the password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(
      {
        ...passwordData,
        [name]: value,
      },
      userId
    );
  };

  // Update profile information
  const handleUpdateInfo = async () => {
    try {
      await updateUserProfile(formData, userId); // API call to update profile
      alert('Profile updated successfully');
    } catch (error) {
      alert('Error updating profile');
    }
  };

  // Validate and send password change request
  const handlePasswordSubmit = async () => {
    setPasswordError(''); // Clear existing errors

    // Validate password inputs
    if (!passwordData.currentPassword) {
      console.log('Validation failed: Current password is required');
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword) {
      console.log('Validation failed: New password is required');
      setPasswordError('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      console.log(
        'Validation failed: New password must be at least 8 characters long'
      );
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      console.log('Validation failed: New passwords do not match');
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      console.log('Sending request to change password');
      // API call to change password
      const result = await changeUserPassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        userId
      );
      alert(result.message || 'Password changed successfully');
      setShowPasswordForm(false); // Hide the password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }); // Reset password fields
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(
        error.response?.data?.error || 'Error changing password'
      ); // Show server error
    }
  };

  // Render input fields dynamically based on configuration
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
          readOnly={!editMode} // Disable input if not in edit mode
        />
      </div>
    );
  };

  return (
    <div className="form-container">
      <h1>View Profile</h1>

      {/* Toggle Password Change Form */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          console.log('Toggle Password Form Clicked');
          setShowPasswordForm(!showPasswordForm);
        }}
        style={{ textDecoration: 'underline', cursor: 'pointer' }}
      >
        Change Password
      </a>

      {/* Password Form */}
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

      {/* Display Global Errors */}
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
