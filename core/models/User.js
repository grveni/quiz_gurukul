// backend/models/User.js

const Model = require('./Model');
const userQueries = require('../db/pgQueries/UserQueries');

class User extends Model {
  constructor() {
    super(userQueries);
  }

  async create(data) {
    const { username, email, password } = data;
    // Add validation and sanitization logic here
    if (!username || !email || !password) {
      throw new Error('All fields are required');
    }
    return this.queryClass.create(username, email, password);
  }

  async findByEmail(email) {
    // Add validation and sanitization logic here
    if (!email) {
      throw new Error('Email is required');
    }
    return this.queryClass.findByEmail(email);
  }

  async addRole(userId, roleId) {
    // Add validation and sanitization logic here
    if (!userId || !roleId) {
      throw new Error('User ID and Role ID are required');
    }
    return this.queryClass.addRole(userId, roleId);
  }

  async comparePassword(candidatePassword, storedPassword) {
    return this.queryClass.comparePassword(candidatePassword, storedPassword);
  }
}

module.exports = new User();
