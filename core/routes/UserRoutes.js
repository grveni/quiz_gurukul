const express = require('express');
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middleware/AuthMiddleware');

const router = express.Router();

// Route to list all users with pagination and authorization
router.get(
  '/list-users',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next),
  (req, res) => UserController.getAllUsersNames(req, res)
);
//Route to list all user's admin prefered fields
router.get(
  '/list-users-details',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next),
  (req, res) => UserController.getAllUsersWithDetails(req, res)
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

router.get(
  '/me/profile',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
  (req, res) => UserController.getUserProfile(req, res)
);

// Route to fetch a user's profile (admin or self)
router.get(
  '/admin/:id/profile',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next), // Authenticate using JWT
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next), // Allow admin or user roles
  (req, res) => UserController.getUserProfile(req, res)
);

router.put(
  '/admin/:id/profile',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next), // Authenticate using JWT
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next), // Ensure admin role
  (req, res) => UserController.updateUserProfile(req, res)
);

// Route to update user profile
router.put(
  '/me/profile',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
  (req, res) => UserController.updateUserProfile(req, res)
);

router.put(
  '/me/change-password',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next), // Authenticate using JWT
  (req, res) => UserController.changePassword(req, res) // Call controller method
);

router.put(
  '/admin/:id/change-password',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next), // Authenticate using JWT
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next),
  (req, res) => UserController.changePassword(req, res) // Call controller method
);

// Fetch field preferences
router.get(
  '/admin/preferences',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next),
  (req, res) => UserController.fetchFieldPreferences(req, res)
);

// Save field preferences
router.post(
  '/admin/preferences/save',
  (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
  (req, res, next) => AuthMiddleware.authorizeRoles('admin')(req, res, next),
  (req, res) => UserController.saveFieldPreferences(req, res)
);

module.exports = router;
