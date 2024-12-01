// core/controllers/UserController.js

const User = require('../models/User');
const Controller = require('./Controller');

class UserController extends Controller {
  async getAllUsers(req, res) {
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
}

module.exports = new UserController();
