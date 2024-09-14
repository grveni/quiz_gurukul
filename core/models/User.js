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
}

module.exports = new User();
