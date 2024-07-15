// core/db/pgQueries/UserQueries.js

const Query = require('./Query');
const bcrypt = require('bcryptjs');
const db = require('../db');

class UserQueries extends Query {
  constructor() {
    super('users');
  }

  async create(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    return result.rows[0];
  }

  async addRole(userId, roleId) {
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
      [userId, roleId]
    );
  }

  async comparePassword(candidatePassword, storedPassword) {
    return bcrypt.compare(candidatePassword, storedPassword);
  }
}

module.exports = new UserQueries();
