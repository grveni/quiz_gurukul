import React, { useState, useEffect } from 'react';
import schemaConfig from '../../schemaConfig.json';

const RegisterForm = () => {
  const API_URL = 'http://localhost:5001';

  const formFields = schemaConfig.users
    .filter((field) => field.name !== 'role_id')
    .map((field) => ({
      name: field.name,
      type: field.type.toLowerCase().includes('varchar') ? 'text' : 'password',
      placeholder: field.name.charAt(0).toUpperCase() + field.name.slice(1),
    }));

  const [formData, setFormData] = useState(
    formFields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {})
  );
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    async function fetchRoles() {
      try {
        console.log('Fetching roles from frontend'); // Debugging statement
        const response = await fetch('http://localhost:5001/api/auth/roles', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache', // Disable caching
            Pragma: 'no-cache',
            Expires: '0',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log('Roles fetched from frontend:', result); // Debugging statement
        setRoles(result.roles);
      } catch (err) {
        console.error('Failed to load roles:', err); // Debugging statement
        setGlobalErrors([{ msg: 'Failed to load roles' }]);
      }
    }
    fetchRoles();
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

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role_id: selectedRole }),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess('User registered successfully');
        setUserDetails(result.user);
      } else {
        if (result.errors) {
          const fieldErrorMap = {};
          result.errors.forEach((error) => {
            fieldErrorMap[error.path] = error.msg;
          });
          setFieldErrors(fieldErrorMap);
        } else {
          setGlobalErrors([{ msg: result.message || 'An error occurred' }]);
        }
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setGlobalErrors([{ msg: 'An error occurred' }]);
    }
  };

  return (
    <div className="nested-home-container">
      <h1>Register</h1>
      <form className="form-container" onSubmit={handleSubmit}>
        {formFields.map((field) => (
          <div key={field.name} className="form-field">
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
            />
            {fieldErrors[field.name] && (
              <p style={{ color: 'red' }}>{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}
        <div className="form-field">
          <select value={selectedRole} onChange={handleRoleChange}>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </select>
          {fieldErrors['role_id'] && (
            <p style={{ color: 'red' }}>{fieldErrors['role_id']}</p>
          )}
        </div>
        <button type="submit">Register</button>
      </form>
      {globalErrors.length > 0 && (
        <div style={{ color: 'red' }}>
          {globalErrors.map((error, index) => (
            <p key={index}>{error.msg}</p>
          ))}
        </div>
      )}
      {success && (
        <div>
          <p style={{ color: 'green' }}>{success}</p>
          {userDetails && (
            <div>
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
