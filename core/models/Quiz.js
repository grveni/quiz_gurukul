const Model = require('./Model');
const QuizQueries = require('../db/pgQueries/QuizQueries');

class Quiz extends Model {
  constructor() {
    super(QuizQueries());
  }

  async createQuiz(title, description) {
    return this.queryClass.createQuiz(title, description);
  }

  async addQuestion(quizId, questionText, questionType, options) {
    return this.queryClass.addQuestion(
      quizId,
      questionText,
      questionType,
      options
    );
  }
}

module.exports = Quiz;
