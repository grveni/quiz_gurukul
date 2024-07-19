const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const prompt = require('prompt');

require('dotenv').config();

class SchemaGenerator {
  constructor() {
    this.userFieldsPath = path.join(__dirname, 'userFields.json');
    this.schemaFilePath = path.join(__dirname, 'schema.sql');
  }

  readUserFields() {
    const data = fs.readFileSync(this.userFieldsPath);
    return JSON.parse(data);
  }

  generateUsersTable() {
    const { users } = this.readUserFields();
    let fields = users
      .map((field) => `${field.name} ${field.type} ${field.constraints}`)
      .join(',\n    ');

    return `
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          ${fields},
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }

  generateRolesTable() {
    return `
      DROP TABLE IF EXISTS roles CASCADE;
      CREATE TABLE roles (
          id SERIAL PRIMARY KEY,
          role_name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }

  generateUserRolesTable() {
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
  }

  generateQuizzesTable() {
    return `
      DROP TABLE IF EXISTS quizzes CASCADE;
      CREATE TABLE quizzes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          is_active BOOLEAN DEFAULT FALSE
      );
    `;
  }

  generateQuestionsTable() {
    return `
      DROP TABLE IF EXISTS questions CASCADE;
      CREATE TABLE questions (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }

  generateOptionsTable() {
    return `
      DROP TABLE IF EXISTS options CASCADE;
      CREATE TABLE options (
          id SERIAL PRIMARY KEY,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          is_correct BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }

  generateQuizAttemptsTable() {
    return `
      DROP TABLE IF EXISTS quiz_attempts CASCADE;
      CREATE TABLE quiz_attempts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          score INTEGER NOT NULL,
          attempt_date TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }

  generateResponsesTable() {
    return `
      DROP TABLE IF EXISTS responses CASCADE;
      CREATE TABLE responses (
          id SERIAL PRIMARY KEY,
          attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          response_text TEXT NOT NULL,
          is_correct BOOLEAN NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }

  async createDatabase(superUser, superPass) {
    const dbUser = process.env.DB_USER;
    const dbPass = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME;

    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: superUser,
      password: superPass,
      database: 'postgres',
    });

    try {
      await client.connect();
      console.log('Connected to the database.');

      const createDbUserQuery = `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${dbUser}') THEN
            CREATE ROLE ${dbUser} WITH LOGIN PASSWORD '${dbPass}';
          END IF;
        END $$;
      `;

      const createDatabaseQuery = `
        CREATE DATABASE ${dbName} OWNER ${dbUser};
      `;

      await client.query(createDbUserQuery);
      console.log(`User ${dbUser} created or already exists.`);

      await client.query(createDatabaseQuery);
      console.log(`Database ${dbName} created.`);
    } catch (err) {
      console.error('Error creating database:', err);
    } finally {
      await client.end();
      console.log('Disconnected from the database.');
    }
  }

  async grantPermissions(superUser, superPass) {
    const dbUser = process.env.DB_USER;

    const client = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: superUser,
      password: superPass,
      database: process.env.DB_NAME,
    });

    try {
      await client.connect();
      console.log('Connected to the database.');

      const grantPermissionsQuery = `
        GRANT USAGE ON SCHEMA public TO ${dbUser};
        GRANT CREATE ON SCHEMA public TO ${dbUser};
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${dbUser};
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${dbUser};
        GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${dbUser};
      `;

      await client.query(grantPermissionsQuery);
      console.log(`Permissions granted to user ${dbUser}.`);
    } catch (err) {
      console.error('Error granting permissions:', err);
    } finally {
      await client.end();
      console.log('Disconnected from the database.');
    }
  }

  async createAllTables() {
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

      const usersTable = this.generateUsersTable();
      const rolesTable = this.generateRolesTable();
      const userRolesTable = this.generateUserRolesTable();
      const quizzesTable = this.generateQuizzesTable();
      const questionsTable = this.generateQuestionsTable();
      const optionsTable = this.generateOptionsTable();
      const quizAttemptsTable = this.generateQuizAttemptsTable();
      const responsesTable = this.generateResponsesTable();

      const schema = `
        ${usersTable}
        ${rolesTable}
        ${userRolesTable}
        ${quizzesTable}
        ${questionsTable}
        ${optionsTable}
        ${quizAttemptsTable}
        ${responsesTable}
      `;

      fs.writeFileSync(this.schemaFilePath, schema);
      console.log('Schema generated successfully at:', this.schemaFilePath);

      await client.query(schema);
      console.log('Tables created successfully.');
    } catch (err) {
      console.error('Error creating tables:', err);
    } finally {
      await client.end();
      console.log('Disconnected from the database.');
    }
  }
}

async function main() {
  const dbSuperUser = process.env.DB_SUPER_USER || 'postgres';

  if (!process.env.DB_SUPER_USER || !process.env.DB_SUPER_PASS) {
    console.log('Superuser credentials not found in environment variables.');
    prompt.start();
    prompt.get(
      [
        {
          name: 'DB_SUPER_PASS',
          description: 'Enter the PostgreSQL superuser password',
          hidden: true,
          replace: '*',
          required: true,
        },
      ],
      async (err, result) => {
        if (err) {
          console.error('Error getting superuser password:', err);
          return;
        }

        const superPass = result.DB_SUPER_PASS;
        const schemaGenerator = new SchemaGenerator();

        await schemaGenerator.createDatabase(dbSuperUser, superPass);
        await schemaGenerator.createAllTables();
        await schemaGenerator.grantPermissions(dbSuperUser, superPass);
      }
    );
  } else {
    const superPass = process.env.DB_SUPER_PASS;
    const schemaGenerator = new SchemaGenerator();

    await schemaGenerator.createDatabase(dbSuperUser, superPass);
    await schemaGenerator.createAllTables();
    await schemaGenerator.grantPermissions(dbSuperUser, superPass);
  }
}

main();
