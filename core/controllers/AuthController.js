const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Controller = require('./Controller');
const { body, validationResult } = require('express-validator');

class AuthController extends Controller {
  async register(req, res) {
    try {
      // Validate input fields
      await body('username')
        .notEmpty()
        .withMessage('Username is required')
        .trim()
        .escape()
        .run(req);
      await body('email')
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail()
        .run(req);
      await body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .trim()
        .escape()
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role_id } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = await User.create({ username, email, password });
      console.log(role_id);

      // Check if role exists
      const roleInstance = await Role.findById(role_id);
      if (!roleInstance) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      // Assign role to user
      await User.addRole(user.id, roleInstance.id);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error registering user:', error);
      this.handleError(res, error);
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
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify password
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.json({ token });
    } catch (error) {
      console.error('Error logging in user:', error);
      this.handleError(res, error);
    }
  }
}

module.exports = new AuthController();
