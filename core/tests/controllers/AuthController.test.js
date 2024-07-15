const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../../routes/AuthRoutes');
const db = require('../../db/db');
const jestConfig = require('../../jest.config');

class AuthControllerTest {
  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use('/api/auth', authRoutes);
  }

  async setup() {
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM roles');
    await db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE roles_id_seq RESTART WITH 1');
    await db.query("INSERT INTO roles (role_name) VALUES ('Admin')");
  }

  async teardown() {
    // Clean up the database state here if needed
  }

  async registerUser() {
    const res = await request(this.app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'Admin',
    });

    return res;
  }

  runTests() {
    describe('Auth Controller - Register', () => {
      beforeAll(async () => {
        await this.setup();
      });

      afterAll(async () => {
        await this.teardown();
      });

      test('should register a new user', async () => {
        const res = await this.registerUser();

        console.log('Response:', res.body);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty(
          'message',
          'User registered successfully'
        );
        //expect(res.body.user).toHaveProperty('username', 'testuser');
        //expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
      });
    });
  }
}

const authControllerTest = new AuthControllerTest();
authControllerTest.runTests();
