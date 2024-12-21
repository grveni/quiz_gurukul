// core/controllers/UserController.js

const User = require('../models/User');
const Controller = require('./Controller');

class UserController extends Controller {
  async getAllUsersNames(req, res) {
    try {
      const users = await User.getAllUsernames();
      console.log('Fetched Users:', users); // Debugging log
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
      const userId = req.user.id; // Get user ID from authenticated token
      const profile = await User.getUserProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id; // Extract user ID from JWT
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ error: 'Both current and new passwords are required' });
      }

      const result = await User.changePassword(
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
      console.log('prefered fields: ', preferredFields);
      if (!preferredFields || preferredFields.length === 0) {
        console.log('setting default fields');
        preferredFields = ['username', 'email'];
      }

      // Fetch user data with preferred fields
      const users = await User.getAllUsersWithPreferredFields(preferredFields);
      console.log(users);
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
      console.log('Received Preferences:', req.body);
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
}

module.exports = new UserController();
