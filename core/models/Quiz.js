const Model = require('./Model');
const quizQueries = require('../db/pgQueries/QuizQueries');

/**
 * Quiz Model
 * Extends the base Model class and interacts with Quiz-related queries
 */
class Quiz extends Model {
  constructor() {
    super(quizQueries);
  }

  /**
   * Create a new quiz
   * @param {String} title - The title of the quiz
   * @param {String} description - The description of the quiz
   * @returns {Object} - The created quiz
   */
  async createQuiz(title, description) {
    return this.queryClass.createQuiz(title, description);
  }

  /**
   * Add a question to a quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {String} questionText - The text of the question
   * @param {String} questionType - The type of the question
   * @param {Array} options - The options for the question (for multiple-choice and true-false)
   * @param {String} correctAnswer - The correct answer for the question (for text)
   * @returns {Object} - The added question
   */
  async addQuestion(
    quizId,
    questionText,
    questionType,
    options,
    correctAnswer
  ) {
    return this.queryClass.addQuestion(
      quizId,
      questionText,
      questionType,
      options,
      correctAnswer
    );
  }

  /**
   * Add multiple questions to a quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {Array} questions - The questions to add
   * @returns {Array} - The added questions
   */
  async addQuestions(quizId, questions) {
    return this.queryClass.addQuestions(quizId, questions);
  }

  /**
   * Update a quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {String} title - The new title of the quiz
   * @param {String} description - The new description of the quiz
   * @param {String} isActive - The quiz status bool active to be published or not.
   * @returns {Object} - The updated quiz
   */
  async updateQuiz(quizId, title, description, isActive) {
    return this.queryClass.updateQuiz(quizId, title, description, isActive);
  }

  /**
   * Get a quiz by ID
   * @param {Number} quizId - The ID of the quiz
   * @returns {Object} - The quiz
   */
  async getQuizById(quizId) {
    return this.queryClass.findById(quizId);
  }

  /**
   * Get all quizzes
   * @returns {Array} - The list of quizzes
   */
  async getAllQuizzes() {
    return this.queryClass.findAll();
  }

  /**
   * Get all questions of a quiz
   * @param {Number} quizId - The ID of the quiz
   * @returns {Array} - The list of questions
   */
  async listAllQuestions(quizId) {
    try {
      const questions = await this.queryClass.findQuestionsByQuizId(quizId);
      return questions;
    } catch (error) {
      console.error('Error in listAllQuestions:', error);
      throw error;
    }
  }

  /**
   * Update a question
   * @param {Number} questionId - The ID of the question
   * @param {String} questionText - The new text of the question
   * @param {String} questionType - The new type of the question
   * @param {Array} options - The new options for the question
   * @param {String} correctAnswer - The new correct answer for the question
   * @returns {Object} - The updated question
   */
  async updateQuestion(
    questionId,
    questionText,
    questionType,
    options,
    correctAnswer
  ) {
    return this.queryClass.updateQuestion(
      questionId,
      questionText,
      questionType,
      options,
      correctAnswer
    );
  }

  /**
   * Delete a question by ID
   * @param {Number} questionId - The ID of the question
   * @returns {Object} - The deleted question
   */
  async deleteQuestion(quizId, questionId) {
    return this.queryClass.deleteQuestionById(quizId, questionId);
  }

  /**
   * Delete multiple questions
   * @param {Array} questionIds - The IDs of the questions to delete
   * @returns {Object} - The result of the deletion
   */
  async deleteMultipleQuestions(questionIds) {
    return this.queryClass.deleteMultipleQuestions(questionIds);
  }

  async findAllWithPagination(page, limit) {
    return this.queryClass.findAllWithPagination(page, limit);
  }

  /**
   * Get an active quiz for a student to take
   * @param {Number} userId - The ID of the user
   * @returns {Object} - The active quiz
   */
  async getActiveQuiz(userId) {
    return this.queryClass.getActiveQuiz(userId);
  }

  /**
   * Get the active quiz and its questions for the student
   * @param {Number} studentId - The ID of the student
   * @returns {Object} - The quiz details along with its questions
   */
  async getActiveQuizWithQuestions(studentId) {
    const quiz = await this.getActiveQuiz(studentId);
    if (quiz) {
      const questions = await this.listAllQuestions(quiz.id);
      quiz.questions = questions;
    }
    return quiz;
  }

  /**
   * Submit quiz answers and calculate the score
   * @param {Number} userId - The ID of the user
   * @param {Number} quizId - The ID of the quiz
   * @param {Array} answers - The list of answers
   * @returns {Object} - The result of the quiz
   */
  async submitQuiz(userId, quizId, answers) {
    const { quizAttemptId, score } = await this.queryClass.submitQuiz(
      userId,
      quizId,
      answers
    );
    return { quizAttemptId, score };
  }

  async getQuizResultsForUser(userId, quizId) {
    //get last attempt results for this user and quiz
    const quizResults = await this.queryClass.getQuizResultsForUser(
      userId,
      quizId
    );
    return quizResults;
  }

  /**
   * Update the status of a quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {Boolean} isActive - The new status of the quiz
   * @returns {Object} - The updated quiz
   */
  async updateQuizStatus(quizId, isActive) {
    return this.queryClass.updateQuizStatusById(quizId, isActive);
  }

  /**
   * Get active quizzes taken by a user in the past
   * @param {Number} userId - The ID of the user
   * @returns {Array} - List of active quizzes
   */
  async getUserActiveQuizzes(userId) {
    return this.queryClass.getUserActiveQuizzes(userId);
  }
}

module.exports = new Quiz();
