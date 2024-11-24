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
    try {
      // Call the query class method to add questions
      const addedQuestions = await this.queryClass.addQuestions(
        quizId,
        questions
      );
      return addedQuestions;
    } catch (error) {
      console.error('Error in QuizModel.addQuestions:', error);
      throw new Error('Failed to add questions to the quiz');
    }
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
    try {
      return await this.queryClass.findById(quizId);
    } catch (error) {
      console.error(`Error fetching quiz with ID ${quizId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's last attempt answers for a quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {Number} userId - The ID of the user
   * @returns {Array} - List of user's previous answers (if any)
   */

  async getLastAttemptByUser(quizId, userId) {
    try {
      return await this.queryClass.getLastAttemptByUser(quizId, userId);
    } catch (error) {
      console.error(`Error fetching last attempt for quiz ${quizId}:`, error);
      throw error;
    }
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
      return await this.queryClass.findQuestionsByQuizId(quizId);
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
   * Get the active/published untaken quiz and its questions for the student
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

  /**
   * Fetch quiz results for a user based on the quiz ID and user ID
   * @param {Number} userId - The ID of the user
   * @param {Number} quizId - The ID of the quiz
   * @returns {Object|null} - Processed quiz results or null
   */
  async getQuizResultsForUser(userId, quizId) {
    try {
      const latestAttempt = await this.queryClass.getLatestQuizAttempt(
        userId,
        quizId
      );

      if (!latestAttempt) {
        console.warn(
          `No latest attempt found for userId: ${userId}, quizId: ${quizId}`
        );
        return null;
      }

      const { attempt_id, score, percentage } = latestAttempt;

      const responses = await this.queryClass.getResponsesForAttempt(
        attempt_id
      );
      if (!responses) {
        console.warn(`No responses found for attemptId: ${attempt_id}`);
        return null;
      }

      const results = this.processQuizResponses(responses);

      return {
        results,
        score,
        percentage,
      };
    } catch (error) {
      console.error('Error in getQuizResultsForUser:', error.message);
      throw new Error('Failed to fetch quiz results');
    }
  }

  /**
   * Process responses into the approved structure
   * @param {Array} responses - The responses fetched from the database
   * @returns {Array} - Processed results
   */

  processQuizResponses(responses) {
    const questionsMap = new Map();

    responses.forEach((row) => {
      const questionId = row.question_id;

      if (!questionsMap.has(questionId)) {
        questionsMap.set(questionId, {
          questionId,
          questionText: row.question_text,
          questionType: row.question_type,
          options: [],
          userResponse: [],
          responseCorrect: true, // Assume correct initially
        });
      }

      const question = questionsMap.get(questionId);

      if (row.question_type === 'multiple-choice') {
        question.options.push({
          optionUUID: row.option_id,
          optionText: row.option_text,
          userSelected: row.selected_option_uuid === row.option_id,
        });
        if (row.selected_option_uuid) {
          question.userResponse.push(row.selected_option_uuid);
        }
        if (
          (row.correct_option === true && !row.selected_option_uuid) ||
          (row.correct_option === false && row.selected_option_uuid)
        ) {
          // A correct option was not selected, so the response is incorrect
          question.responseCorrect = false;
        } else if (row.is_correct === false) {
          // An explicitly incorrect option was selected
          question.responseCorrect = false;
        }
      } else if (row.question_type === 'true-false') {
        question.options.push({
          optionUUID: row.option_id,
          optionText: row.option_text,
          userSelected: row.selected_option_uuid === row.option_id,
        });
        question.userResponse = row.selected_option_uuid
          ? [row.selected_option_uuid]
          : [];

        if (row.correct_option === true && !row.selected_option_uuid) {
          // A correct option was not selected, so the response is incorrect
          question.responseCorrect = false;
        } else if (row.is_correct === false) {
          question.responseCorrect = false;
        }
      } else if (row.question_type === 'text') {
        question.userResponse = row.response_text ? [row.response_text] : [];
        question.responseCorrect = row.response_correct || false;
      } else if (
        row.question_type === 'match-pairs' ||
        row.question_type === 'correct-order'
      ) {
        const existingOption = question.options.find(
          (opt) => opt.leftUUID === row.left_option_uuid
        );

        if (!existingOption) {
          question.options.push({
            leftUUID: row.left_option_uuid,
            leftText: row.left_option_text,
            userSelected: null,
          });
        }

        const option = question.options.find(
          (opt) => opt.leftUUID === row.left_option_uuid
        );

        if (row.selected_right_option_uuid) {
          option.userSelected = {
            rightUUID: row.selected_right_option_uuid,
            rightText: row.selected_right_option_text,
          };
          question.userResponse.push(row.selected_right_option_uuid);
        } else {
          question.responseCorrect = false; // At least one missing pair is incorrect
        }

        if (row.pair_response_correct === false) {
          question.responseCorrect = false; // Mark incorrect if any pair is mismatched
        }
      }
    });

    return Array.from(questionsMap.values());
  }

  /**
   * Validate if the attempt belongs to the logged-in user
   * @param {Number} userId - The ID of the user
   * @param {Number} attemptId - The ID of the attempt
   * @returns {Object|null} - Quiz and attempt details or null if unauthorized
   */
  async validateAttemptOwnership(userId, attemptId) {
    try {
      return await this.queryClass.validateAttemptOwnership(userId, attemptId);
    } catch (error) {
      console.error(
        `Error validating attempt ownership for userId: ${userId}, attemptId: ${attemptId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Fetch correct answers for a quiz attempt
   * @param {Number} quizId - The ID of the quiz
   * @returns {Array} - List of correct answers structured by question type
   */
  async getCorrectAnswers(quizId) {
    try {
      return await this.queryClass.getCorrectAnswers(quizId);
    } catch (error) {
      console.error(
        `Error fetching correct answers for quizId: ${quizId}`,
        error
      );
      throw error;
    }
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
