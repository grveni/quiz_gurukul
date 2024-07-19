const { Pool } = require('pg');
require('dotenv').config();

console.log(process.env.DB_USER);
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const setupDummyQuiz = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert a new active quiz
    const insertQuizText = `
      INSERT INTO quizzes (title, description, is_active) 
      VALUES ($1, $2, true)
      RETURNING id;
    `;
    const quizValues = [
      'Sample Quiz3',
      'This is a sample quiz for testing purposes.',
    ];
    const quizResult = await client.query(insertQuizText, quizValues);
    const quizId = quizResult.rows[0].id;

    // Insert multiple-choice question
    const insertMCQText = `
      INSERT INTO questions (quiz_id, question_text, question_type) 
      VALUES ($1, $2, 'multiple-choice')
      RETURNING id;
    `;
    const mcqValues = [quizId, 'What is the capital of France?'];
    const mcqResult = await client.query(insertMCQText, mcqValues);
    const mcqId = mcqResult.rows[0].id;

    // Insert options for the multiple-choice question
    const insertMCQOptionsText = `
      INSERT INTO options (question_id, option_text, is_correct) 
      VALUES 
      ($1, $2, true),
      ($1, $3, false),
      ($1, $4, false),
      ($1, $5, false);
    `;
    const mcqOptionsValues = [mcqId, 'Paris', 'Berlin', 'Madrid', 'Rome'];
    await client.query(insertMCQOptionsText, mcqOptionsValues);

    // Insert true/false question
    const insertTFQText = `
      INSERT INTO questions (quiz_id, question_text, question_type) 
      VALUES ($1, $2, 'true-false')
      RETURNING id;
    `;
    const tfqValues = [quizId, 'The sky is green.'];
    const tfqResult = await client.query(insertTFQText, tfqValues);
    const tfqId = tfqResult.rows[0].id;

    // Insert option for the true/false question
    const insertTFQOptionsText = `
      INSERT INTO options (question_id, option_text, is_correct) 
      VALUES 
      ($1, $2, false),
      ($1, $3, true);
    `;
    const tfqOptionsValues = [tfqId, 'True', 'False'];
    await client.query(insertTFQOptionsText, tfqOptionsValues);

    // Insert text question
    const insertTextQText = `
      INSERT INTO questions (quiz_id, question_text, question_type) 
      VALUES ($1, $2, 'text')
      RETURNING id;
    `;
    const textQValues = [
      quizId,
      'What is the boiling point of water in Celsius?',
    ];

    const tqResult = await client.query(insertTextQText, textQValues);
    const tqId = tqResult.rows[0].id;
    // Insert option for the text question
    const insertTQOptionsText = `
INSERT INTO options (question_id, option_text, is_correct) 
VALUES 
($1, $2, true);
`;
    const tqOptionsValues = [tqId, '100'];
    await client.query(insertTQOptionsText, tqOptionsValues);

    await client.query('COMMIT');
    console.log('Dummy quiz and questions setup completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error setting up dummy quiz and questions:', error);
  } finally {
    client.release();
  }
};

setupDummyQuiz();
