const fs = require('fs');
const path = require('path');

//const buildDirectory = path.join(__dirname, 'build');
const userFieldsPath = path.join(__dirname, 'userFields.json');
const schemaFilePath = path.join(__dirname, 'schema.sql');

const generateUsersTable = () => {
  const data = fs.readFileSync(userFieldsPath);
  const { users } = JSON.parse(data);

  let fields = users
    .map((field) => `${field.name} ${field.type} ${field.constraints}`)
    .join(',\n    ');
  let sql = `
    DROP TABLE IF EXISTS users CASCADE;
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        ${fields},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  return sql;
};

const generateRolesTable = () => {
  return `
    DROP TABLE IF EXISTS roles CASCADE;
    CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
};

const generateUserRolesTable = () => {
  return `
    DROP TABLE IF EXISTS user_roles CASCADE;
    CREATE TABLE user_roles (
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
  `;
};

const generateSchema = () => {
  const usersTable = generateUsersTable();
  const rolesTable = generateRolesTable();
  const userRolesTable = generateUserRolesTable();

  const schema = `${usersTable}\n${rolesTable}\n${userRolesTable}`;
  fs.writeFileSync(schemaFilePath, schema);
  console.log('Schema generated successfully at:', schemaFilePath);
};

generateSchema();
