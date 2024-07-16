const db = require('../db');
const Query = require('./Query');

class QuizQueries extends Query {
  constructor() {
    super('quizzes');
  }

  async createQuiz(title, description) {
    const result = await db.query(
      `INSERT INTO quizzes (title, description) VALUES ($1, $2) RETURNING *`,
      [title, description]
    );
    return result.rows[0];
  }

  async addQuestion(quizId, questionText, questionType, options) {
    const result = await db.query(
      `INSERT INTO questions (quiz_id, question_text, question_type) VALUES ($1, $2, $3) RETURNING *`,
      [quizId, questionText, questionType]
    );

    const question = result.rows[0];

    if (questionType === 'multiple-choice' && options.length > 0) {
      for (const option of options) {
        await db.query(
          `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
          [question.id, option.text, option.is_correct]
        );
      }
    }

    return question;
  }
}

module.exports = () => new QuizQueries();
