// core/db/pgQueries/UserQueries.js

const Query = require('./Query');
const bcrypt = require('bcryptjs');
const db = require('../db');

class UserQueries extends Query {
  constructor() {
    super('users');
  }

  async createUserAndRole(data) {
    const client = await db.pool.connect();
    const { username, email, password, phone, role_id } = data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await client.query('BEGIN');

      const userQuery = `
        INSERT INTO users (username, email, password, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      const userValues = [username, email, hashedPassword, phone];
      const userResult = await client.query(userQuery, userValues);

      const userId = userResult.rows[0].id;

      const roleQuery = 'SELECT * FROM roles WHERE id = $1';
      const roleResult = await client.query(roleQuery, [role_id]);

      if (roleResult.rows.length === 0) {
        throw new Error('Invalid role');
      }

      const addRoleQuery =
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)';
      await client.query(addRoleQuery, [userId, role_id]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error during transaction:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    return result.rows[0];
  }

  async comparePassword(candidatePassword, storedPassword) {
    return bcrypt.compare(candidatePassword, storedPassword);
  }

  async findUserRoleName(userId) {
    const result = await db.query(
      'SELECT roles.role_name FROM roles ' +
        'JOIN user_roles ON roles.id = user_roles.role_id ' +
        'WHERE user_roles.user_id = $1',
      [userId]
    );
    return result.rows[0]?.role_name;
  }
}

module.exports = new UserQueries();
