// backend/models/User.js

const Model = require('./Model');
const userQueries = require('../db/pgQueries/UserQueries');
const path = require('path');
const fs = require('fs');

class User extends Model {
  constructor() {
    super(userQueries);
    this.configPath = path.join(
      __dirname,
      '../../public/config/userDetailsConfig.json'
    );
  }

  getConfig() {
    const data = fs.readFileSync(this.configPath);
    return JSON.parse(data);
  }

  async create(data) {
    try {
      await this.queryClass.createUserAndRole(data);
      return { success: true };
    } catch (err) {
      console.error('Error in User.create:', err);
      return { success: false, error: err };
    }
  }

  async findByEmail(email) {
    return this.queryClass.findByEmail(email);
  }

  async comparePassword(candidatePassword, storedPassword) {
    return this.queryClass.comparePassword(candidatePassword, storedPassword);
  }

  async findUserRoleName(userId) {
    return this.queryClass.findUserRoleName(userId);
  }

  async getAllUsernames() {
    try {
      return await this.queryClass.getAllUsernames();
    } catch (err) {
      console.error('Error in User.getAllUsernames:', err.message);
      throw new Error('Error fetching usernames');
    }
  }
  async getUserProfile(userId) {
    try {
      const profile = await this.queryClass.fetchUserProfile(userId);
      if (!profile) {
        throw new Error('User not found');
      }
      return profile;
    } catch (err) {
      console.error('Error in User.getUserProfile:', err.message);
      throw err;
    }
  }

  async updateUserProfile(userId, userDetails) {
    try {
      const success = await this.queryClass.updateUserProfile(
        userId,
        userDetails
      );
      if (!success) {
        throw new Error('Failed to update user profile');
      }
      return 'Profile updated successfully';
    } catch (err) {
      console.error('Error in User.updateUserProfile:', err.message);
      throw err;
    }
  }
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.queryClass.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await this.queryClass.comparePassword(
        currentPassword,
        user.password
      );
      if (!isMatch) {
        return { error: 'Current password is incorrect' };
      }

      const hashedPassword = await this.queryClass.hashPassword(newPassword);
      const updated = await this.queryClass.updatePassword(
        userId,
        hashedPassword
      );

      if (!updated) {
        throw new Error('Failed to update password');
      }

      return { success: true };
    } catch (error) {
      console.error('Error in User.changePassword:', error.message);
      throw error;
    }
  }

  async fetchFieldPreferences() {
    return await this.queryClass.fetchFieldPreferences();
  }

  async saveFieldPreferences(fieldNames) {
    return await this.queryClass.saveFieldPreferences(fieldNames);
  }

  async getAllUsersWithPreferredFields(preferredFields) {
    return await this.queryClass.getAllUsersWithPreferredFields(
      preferredFields
    );
  }
}

module.exports = new User();
