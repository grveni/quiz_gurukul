// src/components/RegisterForm.js

import React, { useState } from 'react';
import formConfig from '../formConfig.json';

const RegisterForm = () => {
  const [formData, setFormData] = useState(
    formConfig.fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {})
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    console.log('Register Submit clicked');
  };

  return (
    <div className="nested-container">
      <h1>Register</h1>
      <div className="form-container">
        {formConfig.fields.map((field) => (
          <input
            key={field.name}
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={handleChange}
          />
        ))}
        <button onClick={handleSubmit}>Register</button>
      </div>
    </div>
  );
};

export default RegisterForm;
