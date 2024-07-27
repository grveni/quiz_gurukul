const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createDummyUsers() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to the database.');

    // Hash password
    const password = 'P@ssw0rd';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create users
    const usersQuery = `
      INSERT INTO users (username, email, password)
      VALUES
        ('admin_user', 'admin@example.com', $1),
        ('student_user', 'student@example.com', $1)
      RETURNING id;
    `;

    const usersResult = await client.query(usersQuery, [hashedPassword]);
    const [adminUser, studentUser] = usersResult.rows;

    // Get role IDs
    const rolesQuery = `
      SELECT id, role_name FROM roles WHERE role_name IN ('admin', 'student');
    `;
    const rolesResult = await client.query(rolesQuery);
    const roles = rolesResult.rows;

    const adminRole = roles.find((role) => role.role_name === 'admin');
    const studentRole = roles.find((role) => role.role_name === 'student');

    if (!adminRole || !studentRole) {
      throw new Error('Roles not found');
    }

    // Assign roles to users
    const userRolesQuery = `
      INSERT INTO user_roles (user_id, role_id)
      VALUES
        ($1, $2),
        ($3, $4);
    `;

    await client.query(userRolesQuery, [
      adminUser.id,
      adminRole.id,
      studentUser.id,
      studentRole.id,
    ]);

    console.log('Dummy users created and roles assigned successfully.');
  } catch (err) {
    console.error('Error creating dummy users:', err);
  } finally {
    await client.end();
    console.log('Disconnected from the database.');
  }
}

createDummyUsers();
