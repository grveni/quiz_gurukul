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
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      await client.query('BEGIN');

      // Filter out role_id from data since it's not a part of the users table
      // Dynamically create the user insert query based on the config
      const userFields = Object.keys(data).filter(
        (field) => field !== 'role_id' && field !== 'password'
      );
      const userValues = userFields.map((field) => data[field] || null);

      // Add password to the fields and values arrays
      userFields.push('password');
      userValues.push(hashedPassword);

      const placeholders = userFields
        .map((_, index) => `$${index + 1}`)
        .join(', ');

      const userQuery = `
            INSERT INTO users (${userFields.join(', ')})
            VALUES (${placeholders})
            RETURNING id;
        `;

      const userResult = await client.query(userQuery, userValues);
      const userId = userResult.rows[0].id;

      // Validate and insert the user role
      const roleQuery = 'SELECT * FROM roles WHERE id = $1';
      const roleResult = await client.query(roleQuery, [data.role_id]);

      if (roleResult.rows.length === 0) {
        throw new Error('Invalid role');
      }

      const addRoleQuery =
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)';
      await client.query(addRoleQuery, [userId, data.role_id]);

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
    const result = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
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

  async getAllUsernames() {
    try {
      const result = await db.query(
        'SELECT id, username FROM users INNER JOIN user_roles AS rl ON users.id = rl.user_id WHERE rl.role_id = 4'
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching usernames:', error.message);
      throw new Error('Failed to fetch usernames');
    }
  }

  async fetchUserProfile(userId) {
    const query = `
      SELECT id, username, email, phone, flat_no, building_name, parent_name, standard, mother_name
      FROM users
      WHERE id = $1;
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  async updateUserProfile(userId, userDetails) {
    const query = `
      UPDATE users
      SET username = $2,
          email = $3,
          phone = $4,
          flat_no = $5,
          building_name = $6,
          parent_name = $7,
          standard = $8,
          mother_name = $9,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;
    const values = [
      userId,
      userDetails.username,
      userDetails.email,
      userDetails.phone,
      userDetails.flat_no,
      userDetails.building_name,
      userDetails.parent_name,
      userDetails.standard,
      userDetails.mother_name,
    ];
    const result = await db.query(query, values);
    return result.rowCount > 0;
  }

  async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE users
      SET password = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;
    const result = await db.query(query, [userId, hashedPassword]);
    return result.rowCount > 0;
  }

  async hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async getAllUsersWithDetails() {
    const query = `
      SELECT id, username, flat_no, building_name, parent_name, mother_name, status
      FROM users;
    `;
    return await this.query(query);
  }

  // Fetch field preferences for a user
  async fetchFieldPreferences() {
    const query = `
    SELECT field_name
    FROM field_preferences;
  `;
    const result = await db.query(query);
    return result.rows.map((row) => row.field_name);
  }

  // Save or update field preferences for a user
  async saveFieldPreferences(fieldNames) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing preferences
      const deleteQuery = `
      DELETE FROM field_preferences;
    `;
      await client.query(deleteQuery);

      // Insert new preferences
      const insertQuery = `
      INSERT INTO field_preferences ( field_name)
      VALUES ( $1);
    `;

      for (const fieldName of fieldNames) {
        await client.query(insertQuery, [fieldName]);
      }

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error saving field preferences:', err.message);
      throw new Error('Failed to save preferences');
    } finally {
      client.release();
    }
  }

  async getAllUsersWithPreferredFields(preferredFields) {
    try {
      // Validate the fields
      const validFields = await this.getValidUserFields();

      const selectedFields = preferredFields.filter((field) =>
        validFields.includes(field)
      );

      if (selectedFields.length === 0) {
        throw new Error('No valid fields found in preferences');
      }

      selectedFields.push('status'); // Always include the status field
      selectedFields.push('id');
      // Construct dynamic query
      const query = `
      SELECT ${selectedFields.join(', ')}
      FROM users;
    `;
      const { rows } = await db.query(query);

      return await rows;
    } catch {
      console.error('Error fetching users prefered fields data:', err.message);
      throw new Error('Failed to fetch users data');
    }
  }

  async getValidUserFields() {
    const query = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users';
    `;
    const result = await db.query(query);
    return result.rows.map((row) => row.column_name); // Return an array of valid column names
  }
}

module.exports = new UserQueries();
