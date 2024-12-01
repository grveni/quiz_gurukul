const express = require('express');
const { body } = require('express-validator');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const QuizController = require('../controllers/QuizController');
const Route = require('./Route');

class QuizRoutes extends Route {
  constructor() {
    super(QuizController);

    // Admin-specific routes

    // Route to list all quizzes
    this.router.get(
      '/listAllPagination',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.listAllQuizzes(req, res)
    );

    // Route to create a new quiz
    this.router.post(
      '/addQuiz',
      [
        body('title')
          .isString()
          .notEmpty()
          .withMessage('Title is required and must be a string'),
        body('description')
          .isString()
          .optional()
          .withMessage('Description must be a string'),
      ],
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.createQuiz(req, res)
    );

    // Route to add multiple new questions to a specific quiz
    this.router.post(
      '/add-questions',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      body('quizId').isInt(),
      body('questions').isArray(),
      (req, res) => this.controller.addQuestions(req, res)
    );

    // Route to toggle archive status for a specific quiz
    this.router.post(
      '/student/archive-quiz',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next), // Ensure authentication
      (req, res) => this.controller.toggleQuizArchiveStatus(req, res) // Call the controller method
    );

    // Route to add a new question to a specific quiz
    this.router.post(
      '/:quizId/questions',
      [
        body('questionText')
          .isString()
          .notEmpty()
          .withMessage('Question text is required and must be a string'),
        body('questionType')
          .isString()
          .isIn(['multiple-choice', 'true-false', 'text'])
          .withMessage('Invalid question type'),
        body('options')
          .isArray()
          .optional()
          .withMessage('Options must be an array'),
        body('correctAnswer')
          .isString()
          .optional()
          .withMessage('Correct answer must be a string'),
      ],
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.addQuestion(req, res)
    );

    // Route to update an existing question in a specific quiz
    this.router.put(
      '/:quizId/questions/:questionId',
      [
        body('questionText')
          .isString()
          .notEmpty()
          .withMessage('Question text is required and must be a string'),
        body('questionType')
          .isString()
          .isIn(['multiple-choice', 'true-false', 'text'])
          .withMessage('Invalid question type'),
        body('options')
          .isArray()
          .optional()
          .withMessage('Options must be an array'),
        body('correctAnswer')
          .isString()
          .optional()
          .withMessage('Correct answer must be a string'),
      ],
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.updateQuestion(req, res)
    );

    // Route to delete a specific question in a specific quiz
    this.router.delete(
      '/:quizId/questions/:questionId',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.deleteQuestion(req, res)
    );

    // Route to delete multiple questions in a specific quiz
    this.router.delete(
      '/:quizId/questions',
      [
        body('questionIds')
          .isArray()
          .withMessage('Question IDs must be an array')
          .custom((value) => {
            return value.every(Number.isInteger);
          })
          .withMessage('All question IDs must be integers'),
      ],
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.deleteMultipleQuestions(req, res)
    );

    // Route to list all quizzes with pagination
    this.router.get(
      '/',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.listAllQuizzesWithPagination(req, res)
    );

    // Route to update an existing quiz by ID
    this.router.put(
      '/:quizId',
      [
        body('title')
          .isString()
          .notEmpty()
          .withMessage('Title is required and must be a string'),
        body('description')
          .isString()
          .optional()
          .withMessage('Description must be a string'),
        body('questions').isArray().withMessage('Questions must be an array'),
      ],
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.updateQuiz(req, res)
    );

    // Route to list all questions in a specific quiz
    this.router.get(
      '/:quizId/questions',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.listAllQuestions(req, res)
    );

    this.router.patch(
      '/:quizId/status',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.updateQuizStatus(req, res)
    );

    // Route to get quiz responses for a specific quiz
    this.router.get(
      '/:quizId/responses',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.getQuizResponses(req, res)
    );

    // Route to get quiz detailed responses for a specific quiz or specific user.
    this.router.get(
      '/detailed-responses',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('admin')(req, res, next),
      (req, res) => this.controller.getDetailedQuizResponses(req, res)
    );

    // Routes accessible to both admin and student

    // Route to get a particular quiz by ID
    this.router.get(
      '/:quizId',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => this.controller.getQuiz(req, res)
    );

    // Route to list all active quizzes available for students
    this.router.get(
      '/available',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => this.controller.listAvailableQuizzes(req, res)
    );

    // Route to get quiz details for taking the quiz
    this.router.get(
      '/student/:quizId/take',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => this.controller.getQuizForTaking(req, res)
    );

    // Route to submit quiz answers and calculate the score
    this.router.post(
      '/:quizId/submit',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => this.controller.submitQuizAnswers(req, res)
    );

    // Student-specific routes

    // Route to get the next untaken active quiz for a student
    this.router.get(
      '/student/next',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => this.controller.getNextUntakenQuiz(req, res)
    );

    // Route to get results of the quiz taken by the student
    this.router.get(
      '/student/:quizId/results',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => this.controller.getQuizResults(req, res)
    );

    this.router.get(
      '/student/active-quizzes',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => this.controller.getStudentAttemptedQuizzes(req, res)
    );

    this.router.get(
      '/student/new-quizzes',
      (req, res, next) => AuthMiddleware.verifyToken(req, res, next),
      (req, res) => QuizController.getStudentNewQuizzes(req, res)
    );
    // Route to fetch correct answers for a student's attempt
    this.router.get(
      '/student/:quizId/correctAnswers',
      AuthMiddleware.verifyToken, // Authenticate the user
      (req, res, next) =>
        AuthMiddleware.authorizeRoles('student')(req, res, next), // Ensure the role is 'student'
      (req, res) => QuizController.getCorrectAnswers(req, res)
    );
  }
}

module.exports = new QuizRoutes().getRouter();
