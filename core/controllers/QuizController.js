const Quiz = require('../models/Quiz');
const Controller = require('./Controller');
const { body, validationResult } = require('express-validator');

class QuizController extends Controller {
  constructor() {
    super();
  }

  /**
   * Validate input fields
   * @param {Array} fields - The fields to be validated
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Boolean} - Returns true if validation passes, otherwise false
   */
  async inputValidation(fields, req, res) {
    for (const field of fields) {
      switch (field) {
        case 'title':
          await body(field)
            .isString()
            .notEmpty()
            .withMessage('Title is required and must be a string')
            .trim()
            .escape()
            .run(req);
          break;
        case 'description':
          await body(field)
            .isString()
            .optional()
            .withMessage('Description must be a string')
            .trim()
            .escape()
            .run(req);
          break;
        case 'questionText':
          await body(field)
            .isString()
            .notEmpty()
            .withMessage('Question text is required and must be a string')
            .trim()
            .escape()
            .run(req);
          break;
        case 'questionType':
          await body(field)
            .isString()
            .isIn(['multiple-choice', 'true-false', 'text'])
            .withMessage('Invalid question type')
            .trim()
            .escape()
            .run(req);
          break;
        case 'options':
          await body(field)
            .isArray()
            .optional()
            .withMessage('Options must be an array')
            .run(req);
          break;
        case 'correctAnswer':
          await body(field)
            .isString()
            .optional()
            .withMessage('Correct answer must be a string')
            .trim()
            .escape()
            .run(req);
          break;
        case 'quizId':
          await body(field)
            .isInt()
            .withMessage('Quiz ID must be an integer')
            .run(req);
          break;
        case 'questions':
          await body(field)
            .isArray()
            .withMessage('Questions must be an array')
            .run(req);
          break;
        default:
          break;
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return false;
    }
    return true;
  }

  /**
   * Create a new quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async createQuiz(req, res) {
    try {
      const isValid = await this.inputValidation(
        ['title', 'description'],
        req,
        res
      );
      if (!isValid) return;
      const { title, description } = req.body;
      const quiz = await Quiz.createQuiz(title, description);
      res.status(201).json({ quiz });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Add a single question to a quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async addQuestion(req, res) {
    try {
      const isValid = await this.inputValidation(
        ['questionText', 'questionType', 'options', 'correctAnswer'],
        req,
        res
      );
      if (!isValid) return;

      const { quizId } = req.params;
      const { questionText, questionType, options, correctAnswer } = req.body;
      const question = await Quiz.addQuestion(
        quizId,
        questionText,
        questionType,
        options,
        correctAnswer
      );
      res.status(201).json({ question });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Add multiple questions to a quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async addQuestions(req, res) {
    try {
      const isValid = await this.inputValidation(
        ['quizId', 'questions'],
        req,
        res
      );
      if (!isValid) return;

      const { quizId, questions } = req.body;
      const addedQuestions = await Quiz.addQuestions(quizId, questions);
      res.status(201).json({ addedQuestions });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Get a list of all quizzes
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async listAllQuizzes(req, res) {
    try {
      const quizzes = await Quiz.findAll();
      res.status(200).json({ quizzes });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
  }

  /**
   * Get a specific quiz by ID
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async getQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      res.status(200).json({ quiz });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ message: 'Failed to fetch quiz' });
    }
  }

  /**
   * List all questions in a specific quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async listAllQuestions(req, res) {
    try {
      const { quizId } = req.params;
      const questions = await Quiz.listAllQuestions(quizId);
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  }

  /**
   * Update an existing question in a specific quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async updateQuestion(req, res) {
    try {
      const isValid = await this.inputValidation(
        ['questionText', 'questionType', 'options', 'correctAnswer'],
        req,
        res
      );
      if (!isValid) return;

      const { quizId, questionId } = req.params;
      const { questionText, questionType, options, correctAnswer } = req.body;
      const updatedQuestion = await Quiz.updateQuestion(
        quizId,
        questionId,
        questionText,
        questionType,
        options,
        correctAnswer
      );
      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }
      res.status(200).json({ updatedQuestion });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Delete a specific question in a specific quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async deleteQuestion(req, res) {
    try {
      const { quizId, questionId } = req.params;
      const deletedQuestion = await Quiz.deleteQuestion(quizId, questionId);
      console.log(quizId, questionId);
      if (!deletedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }
      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Delete multiple questions in a specific quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async deleteMultipleQuestions(req, res) {
    try {
      const isValid = await this.inputValidation(['questionIds'], req, res);
      if (!isValid) return;

      const { quizId } = req.params;
      const { questionIds } = req.body;
      const deletedQuestions = await Quiz.deleteMultipleQuestions(
        quizId,
        questionIds
      );
      if (!deletedQuestions) {
        return res.status(404).json({ message: 'Questions not found' });
      }
      res.status(200).json({ message: 'Questions deleted successfully' });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * List all quizzes with pagination
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async listAllQuizzesWithPagination(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const quizzes = await Quiz.findAllWithPagination(page, limit);
      res.status(200).json({ quizzes });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      res.status(500).json({ message: 'Failed to fetch quizzes' });
    }
  }

  /**
   * Get all questions of a specific quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async listAllQuestions(req, res) {
    try {
      const { quizId } = req.params;
      const questions = await Quiz.getAllQuestions(quizId);
      res.status(200).json({ questions });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  }

  /**
   * Update a quiz by ID
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async updateQuiz(req, res) {
    try {
      const isValid = await this.inputValidation(
        ['title', 'description'],
        req,
        res
      );
      if (!isValid) return;

      const { quizId } = req.params;
      const { title, description, isActive } = req.body;
      const updatedQuiz = await Quiz.updateQuiz(
        quizId,
        title,
        description,
        isActive
      );
      if (!updatedQuiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      res.status(200).json({ updatedQuiz });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Get an untaken active quiz for a student to take
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async getNextUntakenQuiz(req, res) {
    try {
      const quiz = await Quiz.getActiveQuizWithQuestions(req.user.id);
      if (!quiz) {
        return res.status(404).json({ message: 'No active quiz found' });
      }
      console.log(quiz);
      res.status(200).json({ quiz });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Fetch quiz results for a user based on the quiz ID and user ID
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async getQuizResults(req, res) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;
      const quizResults = await Quiz.getQuizResultsForUser(userId, quizId);

      if (!quizResults) {
        return res.status(404).json({ message: 'Quiz results not found' });
      }
      console.log(quizResults.questions.length);
      const totalQuestions = quizResults.questions.length;
      const percentageScore = (
        (quizResults.score / totalQuestions) *
        100
      ).toFixed(1);

      res.status(200).json({
        score: quizResults.score,
        percentScore: percentageScore,
        questions: quizResults.questions,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Submit quiz answers, calculate score, and return results
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async submitQuizAnswers(req, res) {
    try {
      const isValid = await this.inputValidation(
        ['quizId', 'answers'],
        req,
        res
      );
      if (!isValid) return;

      const { quizId, answers } = req.body;
      const result = await Quiz.submitQuiz(req.user.id, quizId, answers);

      res.status(200).json({ message: 'successfully submitted!' });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new QuizController();
