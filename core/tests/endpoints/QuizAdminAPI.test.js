const request = require('supertest');
const app = require('../../server');
const db = require('../../db/db');

class QuizApiTest {
  constructor() {
    this.adminToken = null;
  }

  async loginAsAdmin() {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password' });
    return response.body.token;
  }

  async setup() {
    await db.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM roles');
    await db.query('DELETE FROM quizzes');
    await db.query('DELETE FROM questions');
    await db.query('DELETE FROM options');

    await db.query(
      `INSERT INTO roles (role_name) VALUES ('admin'), ('student')`
    );

    await db.query(`
      INSERT INTO users (username, email, password) 
      VALUES ('admin', 'admin@example.com', crypt('password', gen_salt('bf'))) RETURNING id
    `);

    const adminUser = await db.query(
      `SELECT id FROM users WHERE email = 'admin@example.com'`
    );
    const adminRole = await db.query(
      `SELECT id FROM roles WHERE role_name = 'admin'`
    );
    await db.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
      [adminUser.rows[0].id, adminRole.rows[0].id]
    );

    this.adminToken = await this.loginAsAdmin();
  }

  async teardown() {
    //app.close(); // Close the server
  }

  async testCreateQuiz() {
    const response = await request(app)
      .post('/api/quizzes/addQuiz')
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Sample Quiz',
        description: 'This is a sample quiz',
      });
    expect(response.status).toBe(201);
    expect(response.body.quiz).toHaveProperty('id');
    expect(response.body.quiz.title).toBe('Sample Quiz');
  }

  async testGetAllQuizzes() {
    const response = await request(app)
      .get('/api/quizzes')
      .set('Authorization', `Bearer ${this.adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body.quizzes).toBeInstanceOf(Array);
  }

  async testGetQuizById() {
    const quizResponse = await request(app)
      .post('/api/quizzes/addQuiz')
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Quiz to Fetch',
        description: 'This quiz will be fetched by ID',
      });

    const quizId = quizResponse.body.quiz.id;

    const response = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${this.adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.quiz).toHaveProperty('id', quizId);
  }

  async testUpdateQuiz() {
    const quizResponse = await request(app)
      .post('/api/quizzes/addQuiz')
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Quiz to Update',
        description: 'This quiz will be updated',
      });

    const quizId = quizResponse.body.quiz.id;

    const response = await request(app)
      .put(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Updated Quiz Title',
        description: 'Updated quiz description',
      });

    expect(response.status).toBe(200);
    expect(response.body.updatedQuiz.title).toBe('Updated Quiz Title');
  }

  async testAddQuestion() {
    const quizResponse = await request(app)
      .post('/api/quizzes/addQuiz')
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Quiz for Adding Questions',
        description: 'This quiz will have questions added',
      });

    const quizId = quizResponse.body.quiz.id;

    const response = await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        questionText: 'What is 2+2?',
        questionType: 'multiple-choice',
        options: [
          { text: '3', is_correct: false },
          { text: '4', is_correct: true },
          { text: '5', is_correct: false },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.question).toHaveProperty('id');
    expect(response.body.question.question_text).toBe('What is 2+2?');
  }

  async testGetAllQuestions() {
    const quizResponse = await request(app)
      .post('/api/quizzes/addQuiz')
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Quiz with Questions',
        description: 'This quiz will have its questions fetched',
      });

    const quizId = quizResponse.body.quiz.id;

    await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        questionText: 'What is the capital of France?',
        questionType: 'text',
        correctAnswer: 'Paris',
      });

    const response = await request(app)
      .get(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${this.adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.questions).toBeInstanceOf(Array);
  }

  async testDeleteQuestion() {
    const quizResponse = await request(app)
      .post('/api/quizzes/addQuiz')
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Quiz for Deleting Questions',
        description: 'This quiz will have questions deleted',
      });

    const quizId = quizResponse.body.quiz.id;

    const questionResponse = await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        questionText: 'What is the capital of Germany?',
        questionType: 'text',
        correctAnswer: 'Berlin',
      });

    const questionId = questionResponse.body.question.id;
    console.log(questionId);
    console.log(quizId);
    const response = await request(app)
      .delete(`/api/quizzes/${quizId}/questions/${questionId}`)
      .set('Authorization', `Bearer ${this.adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Question deleted successfully');
  }

  async testDeleteMultipleQuestions() {
    const quizResponse = await request(app)
      .post('/api/quizzes/addQuiz')
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        title: 'Quiz for Deleting Multiple Questions',
        description: 'This quiz will have multiple questions deleted',
      });

    const quizId = quizResponse.body.quiz.id;

    const questionResponse1 = await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        questionText: 'What is the capital of Spain?',
        questionType: 'text',
        correctAnswer: 'Madrid',
      });

    const questionResponse2 = await request(app)
      .post(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({
        questionText: 'What is the capital of Italy?',
        questionType: 'text',
        correctAnswer: 'Rome',
      });

    const questionIds = [
      questionResponse1.body.question.id,
      questionResponse2.body.question.id,
    ];

    const response = await request(app)
      .delete(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${this.adminToken}`)
      .send({ questionIds });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Questions deleted successfully');
  }

  // Run all tests
  async runAll() {
    await this.setup();

    try {
      await this.testaddQuizQuiz();
      await this.testGetAllQuizzes();
      await this.testGetQuizById();
      await this.testUpdateQuiz();
      await this.testAddQuestion();
      await this.testGetAllQuestions();
      await this.testDeleteQuestion();
      await this.testDeleteMultipleQuestions();
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      await this.teardown();
    }
  }

  // Run a specific test
  async runTest(testName) {
    await this.setup();

    try {
      await this[testName]();
    } catch (error) {
      console.error(`Error running test ${testName}:`, error);
    } finally {
      await this.teardown();
    }
  }
}
// Jest test suite
describe('Quiz API Endpoints', () => {
  const quizApiTest = new QuizApiTest();

  beforeAll(async () => {
    await quizApiTest.setup();
  });

  afterAll(async () => {
    await quizApiTest.teardown();
  });

  it('should create a quiz', async () => {
    await quizApiTest.testCreateQuiz();
  });

  it('should get all quizzes', async () => {
    await quizApiTest.testGetAllQuizzes();
  });

  it('should get a quiz by ID', async () => {
    await quizApiTest.testGetQuizById();
  });

  it('should update a quiz', async () => {
    await quizApiTest.testUpdateQuiz();
  });

  it('should add a question to a quiz', async () => {
    await quizApiTest.testAddQuestion();
  });

  it('should get all questions for a quiz', async () => {
    await quizApiTest.testGetAllQuestions();
  });

  it('should delete a question from a quiz', async () => {
    await quizApiTest.testDeleteQuestion();
  });

  it('should delete multiple questions from a quiz', async () => {
    await quizApiTest.testDeleteMultipleQuestions();
  });

  // Uncomment to run individual tests
  // it('should create a quiz', async () => {
  //   await quizApiTest.runTest('testCreateQuiz');
  // });
  // it('should get all quizzes', async () => {
  //   await quizApiTest.runTest('testGetAllQuizzes');
  // });
  // Add more individual tests as needed
});
