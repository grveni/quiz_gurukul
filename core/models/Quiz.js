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
   * Update quiz metadata (title and description)
   * @param {Number} quizId - The ID of the quiz
   * @param {String} title - The new title of the quiz
   * @param {String} description - The new description of the quiz
   * @returns {Object} - The updated quiz object
   */
  async updateQuiz(quizId, title, description) {
    console.log('Quiz.updateQuiz called with:', { quizId, title, description });
    try {
      const updatedQuiz = await this.queryClass.updateQuiz(
        quizId,
        title,
        description
      );
      console.log('Quiz updated:', updatedQuiz);
      return updatedQuiz;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  /**
   * Update quiz questions based on the provided list of questions
   * @param {Number} quizId - The ID of the quiz
   * @param {Array} questions - The list of questions to update
   * @returns {void}
   */
  async updateQuizQuestions(quizId, questions) {
    console.log('Quiz.updateQuizQuestions called with:', { quizId, questions });
    try {
      for (const question of questions) {
        if (question.deleted) {
          console.log('Marking question as deleted:', question.id);
          await this.queryClass.markQuestionAsDeleted(question.id);
        } else if (question.isEdited) {
          console.log('Updating question:', question);
          await this.queryClass.updateQuestion(
            question.id,
            question.question_text,
            question.question_type,
            question.options
          );
        }
      }
      console.log('Quiz questions updated successfully.');
    } catch (error) {
      console.error('Error updating quiz questions:', error);
      throw error;
    }
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
   * Get user's last attempt answers for a quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {Number} userId - The ID of the user
   * @returns {Array} - List of user's previous answers (if any)
   */
  async getLastAttemptByUser(quizId, userId) {
    return this.queryClass.getLastAttemptByUser(quizId, userId);
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

  /**
   * Fetch the latest quiz attempt for a user for a specific quiz
   * @param {Number} userId - The ID of the user
   * @param {Number} quizId - The ID of the quiz
   * @returns {Object} - The latest quiz attempt with score and percentage
   */
  async getLatestQuizAttempt(userId, quizId) {
    return this.queryClass.getLatestQuizAttempt(userId, quizId);
  }

  // Method to get detailed responses based on type (quiz or user)
  async getDetailedResponses({ quizId, userId, type }) {
    if (type === 'quiz') {
      console.log(`Fetching detailed responses for quiz ID: ${quizId}`);
      // Fetch detailed responses for a quiz
      return await quizQueries.getDetailedQuizResponses(quizId);
    } else if (type === 'user') {
      console.log(`Fetching detailed responses for user ID: ${userId}`);
      // Fetch detailed responses for a user
      return await quizQueries.getDetailedUserResponses(userId);
    } else {
      console.error('Invalid type parameter');
      throw new Error('Invalid type parameter');
    }
  }
  async getUnattemptedQuizzes(userId) {
    return this.queryClass.getUnattemptedQuizzes(userId);
  }
}

module.exports = new Quiz();
