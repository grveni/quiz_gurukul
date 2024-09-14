const express = require('express');
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Route to list all users with pagination and authorization
router.get(
  '/list-users',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next),
  (req, res) => UserController.getAllUsers(req, res)
);

module.exports = router;
