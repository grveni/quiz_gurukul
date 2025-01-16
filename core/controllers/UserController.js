// core/controllers/UserController.js

const User = require('../models/User');
const Controller = require('./Controller');

class UserController extends Controller {
  async getAllUsersNames(req, res) {
    try {
      const users = await User.getAllUsernames();
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error.message); // Error log
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async updateUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const updatedUser = await user.update(req.body);
      res.json(updatedUser);
    } catch (error) {
      this.handleError(res, error);
    }
  }
  async getUserProfile(req, res) {
    try {
      // Fetch the logged-in user's ID
      const loggedInUserId = req.user.id;

      // Check the role of the logged-in user
      const role = await User.findUserRoleName(loggedInUserId);

      let userId;
      if (role === 'Admin' && req.params.id) {
        // If admin and params.id is provided, fetch the specified user's profile
        userId = req.params.id;
      } else {
        // For non-admins or if no params.id is provided, use the logged-in user's ID
        userId = loggedInUserId;
      }

      const profile = await User.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async updateUserProfile(req, res) {
    try {
      // Fetch the logged-in user's ID
      const loggedInUserId = req.user.id;

      // Check the role of the logged-in user
      const role = await User.findUserRoleName(loggedInUserId);

      let userId;
      if (role === 'Admin' && req.params.id) {
        // If admin and params.id is provided, fetch the specified user's profile
        userId = req.params.id;
      } else {
        // For non-admins or if no params.id is provided, use the logged-in user's ID
        userId = loggedInUserId;
      }
      const userDetails = req.body;
      const message = await User.updateUserProfile(userId, userDetails);
      res.status(200).json({ message });
    } catch (error) {
      console.error('Error updating user profile:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      // Fetch the logged-in user's ID
      const loggedInUserId = req.user.id;

      // Check the role of the logged-in user
      const role = await User.findUserRoleName(loggedInUserId);
      let currentPassword;
      let newPassword;
      let userId;
      console.log(role);
      console.log(req.params);
      if (role === 'Admin' && req.params.id) {
        // If admin and params.id is provided, fetch the specified user's profile
        userId = req.params.id;
        currentPassword = '';
        newPassword = req.body.newPassword;
      } else {
        // For non-admins or if no params.id is provided, use the logged-in user's ID
        userId = loggedInUserId;
        currentPassword = req.body.currentPassword;
        newPassword = req.body.newPassword;

        if (!currentPassword || !newPassword) {
          return res
            .status(400)
            .json({ error: 'Both current and new passwords are required' });
        }
      }

      const result = await User.changePassword(
        role,
        userId,
        currentPassword,
        newPassword
      );
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error.message);
      res.status(500).json({ error: 'Failed to update password' });
    }
  }

  // Fetch all users with details
  // Fetch all users with preferred details
  async getAllUsersWithDetails(req, res) {
    try {
      // Fetch the logged-in user's ID
      const userId = req.user.id;

      // Get the admin's preferred fields
      let preferredFields = await User.fetchFieldPreferences(userId);
      if (!preferredFields || preferredFields.length === 0) {
        console.log('setting default fields');
        preferredFields = ['username', 'email'];
      }

      // Fetch user data with preferred fields
      const users = await User.getAllUsersWithPreferredFields(preferredFields);
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Deactivate a user
  async deactivateUser(req, res) {
    try {
      const userId = req.params.id;
      const success = await User.deactivateUser(userId);

      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating user:', error.message);
      res.status(500).json({ error: 'Failed to deactivate user' });
    }
  }
  // Fetch field preferences for the logged-in user
  async fetchFieldPreferences(req, res) {
    try {
      const preferences = await User.fetchFieldPreferences();
      res.status(200).json(preferences);
    } catch (error) {
      console.error('Error fetching field preferences:', error.message);
      res.status(500).json({ error: 'Failed to fetch field preferences' });
    }
  }

  // Save field preferences for the logged-in user
  async saveFieldPreferences(req, res) {
    try {
      const { preferences } = req.body; // Expect an array of field names in request body

      if (!Array.isArray(preferences) || preferences.length === 0) {
        return res.status(400).json({ error: 'Invalid fields format' });
      }

      await User.saveFieldPreferences(preferences);
      res.status(200).json({ message: 'Preferences saved successfully' });
    } catch (error) {
      console.error('Error saving field preferences:', error.message);
      res.status(500).json({ error: 'Failed to save field preferences' });
    }
  }

  async changeUserStatus(req, res) {
    try {
      const userId = req.params.id;
      const { status } = req.body; // New status (true/false)

      if (typeof status !== 'boolean') {
        return res.status(400).json({ error: 'Invalid status value' });
      }

      const success = await User.changeStatus(userId, status);
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User status updated successfully' });
    } catch (error) {
      console.error('Error changing user status:', error.message);
      res.status(500).json({ error: 'Failed to change user status' });
    }
  }
}

module.exports = new UserController();
