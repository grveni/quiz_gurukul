const { body, validationResult } = require('express-validator');

class Controller {
  constructor() {}

  /**
   * Input validation function
   * @param {Array} fields - The fields to validate
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Boolean} - Returns true if validation passes, false otherwise
   */
  async inputValidation(fields, req, res) {
    const validations = [];
    fields.forEach((field) => {
      switch (field) {
        case 'title':
          validations.push(
            body('title')
              .notEmpty()
              .withMessage('Title is required')
              .trim()
              .escape()
          );
          break;
        case 'description':
          validations.push(
            body('description')
              .notEmpty()
              .withMessage('Description is required')
              .trim()
              .escape()
          );
          break;
        case 'quizId':
          validations.push(
            body('quizId').isInt().withMessage('Quiz ID must be an integer')
          );
          break;
        case 'questions':
          validations.push(
            body('questions')
              .isArray()
              .withMessage('Questions must be an array')
          );
          break;
        case 'questionText':
          validations.push(
            body('questionText')
              .notEmpty()
              .withMessage('Question text is required')
              .trim()
              .escape()
          );
          break;
        case 'questionType':
          validations.push(
            body('questionType')
              .isString()
              .isIn(['multiple-choice', 'true-false', 'text'])
              .withMessage('Invalid question type')
          );
          break;
        case 'options':
          validations.push(
            body('options')
              .isArray()
              .optional()
              .withMessage('Options must be an array')
          );
          break;
        case 'correctAnswer':
          validations.push(
            body('correctAnswer')
              .isString()
              .optional()
              .withMessage('Correct answer must be a string')
          );
          break;
        default:
          break;
      }
    });
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return false;
    }
    return true;
  }

  /**
   * Handle error responses
   * @param {Object} res - The response object
   * @param {Error} error - The error object
   */
  handleError(res, error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = Controller;
