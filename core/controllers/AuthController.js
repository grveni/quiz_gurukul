const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Controller = require('./Controller');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
class AuthController extends Controller {
  constructor() {
    super();
    this.configPath = path.join(
      __dirname,
      '../public/config/userDetailsConfig.json'
    );
    this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
  }

  getFieldValidation(reqBody, fieldConfig, fieldName) {
    const errors = [];
    const validations = fieldConfig.validations;

    const value = reqBody[fieldName];
    if (validations.required && !value) {
      errors.push(`${fieldConfig.placeholder} is required`);
    } else if (!value || !value.length) {
      return errors;
    }
    if (validations.minLength && value.length < validations.minLength) {
      errors.push(
        `${fieldConfig.placeholder} must be at least ${validations.minLength} characters long`
      );
    }
    if (validations.maxLength && value.length > validations.maxLength) {
      errors.push(
        `${fieldConfig.placeholder} must be no more than ${validations.maxLength} characters long`
      );
    }
    if (validations.pattern && !new RegExp(validations.pattern).test(value)) {
      errors.push(`${fieldConfig.name} is invalid`);
    }

    return errors;
  }

  async register(req, res) {
    try {
      // Ensure 'username' and 'password' fields are present
      if (!req.body.username || !req.body.password) {
        return res
          .status(400)
          .json({ message: "'username' and 'password' are required fields." });
      }

      // Validate input fields using the JSON config
      const fieldNames = Object.keys(this.config.fields);
      const validationErrors = [];
      for (const fieldName of fieldNames) {
        const fieldConfig = this.config.fields[fieldName];
        const errors = this.getFieldValidation(
          req.body,
          fieldConfig.form,
          fieldName
        );
        validationErrors.push(...errors);
      }

      if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        return res.status(400).json({ errors: validationErrors });
      }

      // Dynamically extract fields from req.body based on the config
      const userData = {};
      for (const fieldName of fieldNames) {
        userData[fieldName] = req.body[fieldName];
      }

      // Manually add the role_id to userData if it exists in the request body
      if (req.body.role_id) {
        userData.role_id = req.body.role_id;
      }

      // Check if user already exists based on unique fields (e.g., email)
      if (userData.email) {
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
          console.log('User already exists:', userData.email);
          return res.status(400).json({ message: 'User already exists' });
        }
      }

      // Create new user and assign role
      const result = await User.create(userData);

      if (!result.success) {
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async login(req, res) {
    try {
      // Validate input fields
      await body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .trim()
        .run(req);
      await body('password')
        .notEmpty()
        .withMessage('Password is required')
        .trim()
        .escape()
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array()[0].msg);
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        console.log('user not found');
        return res.status(404).json({ message: 'User not found' });
      }

      //Add logic to check status if disabled, send proper message
      if (!user.status) {
        return res.status(403).json({
          error: 'User account disabled. Please contact Admin +91-9811406988',
        });
      }

      // Verify password
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        console.log('invalid password');
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Fetch user role from the database
      const roleName = await User.findUserRoleName(user.id);
      if (!roleName) {
        return res.status(500).json({ message: 'Role not found' });
      }
      // Generate JWT
      const token = jwt.sign(
        { id: user.id, role: roleName.toLowerCase() },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log(token);
      res.json({ token });
    } catch (error) {
      console.error('Error logging in user:', error);
      this.handleError(res, error);
    }
  }
}

module.exports = new AuthController();
