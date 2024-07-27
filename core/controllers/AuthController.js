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

  getFieldValidation(req, fieldConfig, fieldName) {
    const errors = [];
    const validations = fieldConfig.form.validations;
    const value = req.body[fieldName];
    if (validations.required && !value) {
      errors.push(`${fieldConfig.name} is required`);
    }
    if (validations.minLength && value.length < validations.minLength) {
      errors.push(
        `${fieldConfig.name} must be at least ${validations.minLength} characters long`
      );
    }
    if (validations.maxLength && value.length > validations.maxLength) {
      errors.push(
        `${fieldConfig.name} must be no more than ${validations.maxLength} characters long`
      );
    }
    if (validations.pattern && !new RegExp(validations.pattern).test(value)) {
      errors.push(`${fieldConfig.name} is invalid`);
    }

    return errors;
  }

  async register(req, res) {
    try {
      // Validate input fields using the JSON config
      const fieldNames = Object.keys(this.config.fields);
      const validationErrors = [];
      for (const fieldName of fieldNames) {
        const fieldConfig = this.config.fields[fieldName];
        const errors = this.getFieldValidation(req, fieldConfig, fieldName);
        validationErrors.push(...errors);
      }

      if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        return res.status(400).json({ errors: validationErrors });
      }

      const { username, email, password, phone, role_id } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user and assign role
      const result = await User.create({
        username,
        email,
        password,
        phone,
        role_id,
      });

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
        .normalizeEmail()
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

      console.log(user.id, roleName);
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
