import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, fetchConfig, registerUser } from '../../utils/AuthAPI';

const LoginForm = () => {
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'
  const navigate = useNavigate();

  // Fetch required fields for signup
  useEffect(() => {
    async function fetchRequiredFields() {
      try {
        const config = await fetchConfig();
        const requiredFields = Object.keys(config.fields || {})
          .filter((key) => config.fields[key]?.form.validations?.required)
          .map((key) => ({
            name: key,
            ...config.fields[key],
          }));

        setFormFields(requiredFields);

        // Initialize form data for required fields
        setFormData(
          requiredFields.reduce((acc, field) => {
            acc[field.name] = '';
            return acc;
          }, {})
        );
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    }

    fetchRequiredFields();
  }, []);

  const handleLogin = async () => {
    setMessage('');
    try {
      const userRole = await login(email, password);
      navigate(userRole === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setMessage(err.message || 'Login failed');
      setMessageType('error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate all fields based on JSON configuration
    for (const field of formFields) {
      const { name, form } = field;
      const { validations } = form;

      const value = formData[name];

      // Required field validation
      if (validations?.required && !value) {
        setMessage(`${form.placeholder || name} is required.`);
        setMessageType('error');
        return;
      }

      // Minimum Length Validation
      if (validations?.minLength && value.length < validations.minLength) {
        setMessage(
          `${form.placeholder || name} must be at least ${
            validations.minLength
          } characters long.`
        );
        setMessageType('error');
        return;
      }

      // Maximum Length Validation
      if (validations?.maxLength && value.length > validations.maxLength) {
        setMessage(
          `${form.placeholder || name} must not exceed ${
            validations.maxLength
          } characters.`
        );
        setMessageType('error');
        return;
      }

      // Pattern Validation
      if (
        validations?.pattern &&
        !new RegExp(validations.pattern).test(value)
      ) {
        setMessage(`Invalid ${form.placeholder || name} format.`);
        setMessageType('error');
        return;
      }
    }

    // Password confirmation validation
    if (formData.password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setMessageType('error');
      return;
    }

    try {
      const studentData = { ...formData, role_id: 4 }; // Hardcode role to "student"
      await registerUser(studentData);
      setMessage('Registration successful! Logging in...');
      setMessageType('success');

      // Automatically log in after signup
      const userRole = await login(formData.email, formData.password);
      navigate(userRole === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setMessage(err.message || 'Registration failed');
      setMessageType('error');
    }
  };

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderInputField = (field) => {
    const { name, form } = field;
    const { type, placeholder, options, validations } = form;

    if (options && Array.isArray(options)) {
      return (
        <div key={name} className="form-field">
          <label htmlFor={name}>{placeholder}</label>
          <select
            name={name}
            id={name}
            value={formData[name]}
            onChange={handleFieldChange}
            required={validations?.required}
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
        <label htmlFor={name}>{placeholder}</label>
        <input
          type={type || 'text'}
          id={name}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleFieldChange}
          required={validations?.required}
        />
      </div>
    );
  };

  return (
    <div className="form-container">
      {isLoginFormVisible ? (
        <>
          <h1>Login</h1>
          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleLogin}>Login</button>
          <p className="link" onClick={() => setIsLoginFormVisible(false)}>
            New user? Sign up here
          </p>
        </>
      ) : (
        <>
          <h1>Sign Up</h1>
          <form onSubmit={handleRegister}>
            {formFields.map(renderInputField)}
            {formFields.some((field) => field.name === 'password') && (
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <button className="signup-submit" type="submit">
              Sign Up
            </button>
          </form>
          <p className="link" onClick={() => setIsLoginFormVisible(true)}>
            Already have an account? Login here
          </p>
        </>
      )}
      {message && (
        <p
          className={
            messageType === 'error' ? 'error-message' : 'success-message'
          }
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoginForm;
