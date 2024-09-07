import React, { useState, useEffect } from 'react';
import { fetchConfig, fetchRoles, registerUser } from '../../utils/AuthAPI';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
  const [passwordMismatchError, setPasswordMismatchError] = useState(''); // Password mismatch error
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const config = await fetchConfig();
        const formFieldsConfig = config.fields || config.data?.fields || {};
        setFormFields(
          Object.keys(formFieldsConfig).map((key) => ({
            name: key,
            ...formFieldsConfig[key],
          }))
        );
        setFormData(
          Object.keys(formFieldsConfig).reduce((acc, field) => {
            acc[field] = '';
            return acc;
          }, {})
        );
      } catch (err) {
        setGlobalErrors((prevErrors) => [
          ...prevErrors,
          { msg: `Error fetching config: ${err.message}` },
        ]);
      }

      try {
        const rolesData = await fetchRoles();
        setRoles(rolesData);
      } catch (err) {
        setGlobalErrors((prevErrors) => [...prevErrors, { msg: err.message }]);
      }
    }

    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalErrors([]);
    setSuccess('');
    setPasswordMismatchError('');

    // Check if password and confirm password match
    if (formData.password !== confirmPassword) {
      setPasswordMismatchError('Passwords do not match');
      return;
    }

    const dataToSubmit = {
      ...formData,
      role_id: selectedRole,
    };

    try {
      const result = await registerUser(dataToSubmit);
      setSuccess('User registered successfully');
      setUserDetails(result.user);
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
    } catch (err) {
      setGlobalErrors([{ msg: err.message }]);
    }
  };

  const renderInputField = (field) => {
    const { name, form } = field;
    const { type, placeholder, validations, options } = form;

    if (options && Array.isArray(options)) {
      // Render dropdown for fields with options
      return (
        <div key={name} className="form-field">
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            required={validations?.required}
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors[name] && (
            <p className="error-message">{fieldErrors[name]}</p>
          )}
        </div>
      );
    }

    return (
      <div key={name} className="form-field">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          required={validations?.required}
          minLength={validations?.minLength}
          maxLength={validations?.maxLength}
          pattern={validations?.pattern}
        />
        {fieldErrors[name] && (
          <p className="error-message">{fieldErrors[name]}</p>
        )}

        {/* Dynamically add confirm password field if the current field is password */}
        {name === 'password' && (
          <>
            <div className="form-field">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {/* Display mismatch error directly below the confirm password field */}
            {passwordMismatchError && (
              <p className="error-message">{passwordMismatchError}</p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="form-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {formFields.map(renderInputField)}

        <div className="form-field">
          <select value={selectedRole} onChange={handleRoleChange} required>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </select>
          {fieldErrors['role_id'] && (
            <p className="error-message">{fieldErrors['role_id']}</p>
          )}
        </div>
        <button type="submit">Register</button>
      </form>
      {globalErrors.length > 0 && (
        <div className="error-message">
          {globalErrors.map((error, index) => (
            <p key={index}>{error.msg}</p>
          ))}
        </div>
      )}
      {success && (
        <div className="success-message">
          <p>{success}</p>
          {userDetails && (
            <div className="user-details">
              <h3>User Details:</h3>
              <p>Username: {userDetails.username}</p>
              <p>Email: {userDetails.email}</p>
              <p>Role: {userDetails.role_name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
