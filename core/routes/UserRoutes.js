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

/// Define the route to return the logged-in user's ID
router.get(
  '/me/id',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next), // Authenticate using JWT
  (req, res) => {
    // Since the token is verified, req.user contains the decoded token with the user's information
    const userId = req.user.id;

    if (!userId) {
      return res.status(404).json({ message: 'User ID not found' });
    }

    // Send the user's ID as a response
    return res.status(200).json({ id: userId });
  }
);

module.exports = router;
