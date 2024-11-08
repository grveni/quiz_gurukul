const Quiz = require('../models/Quiz');
const User = require('../models/User');
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
        case 'questions':
          await body(field)
            .isArray()
            .optional()
            .custom((questions) => {
              if (questions && questions.length > 0) {
                for (const question of questions) {
                  if (!this.validateQuestion(question)) {
                    throw new Error(`Invalid question data`);
                  }
                }
              }
              return true;
            })
            .run(req);
          break;
        default:
          break;
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Extract the first error message for simplicity
      const firstError = errors.array()[0].msg;
      console.log('first error', firstError);
      res.status(400).json({ errors: errors.array() });
      return false;
    }
    return true;
  }

  /**
   * Validate individual question structure
   * @param {Object} question - The question to validate
   * @returns {Boolean} - Returns true if the question is valid, otherwise false
   */
  validateQuestion(question) {
    if (
      !question.question_text ||
      typeof question.question_text !== 'string' ||
      !question.question_text.trim()
    ) {
      return false;
    }

    switch (question.question_type) {
      case 'multiple-choice':
        return this.validateMultipleChoiceQuestion(question);
      case 'true-false':
        return this.validateTrueFalseQuestion(question);
      case 'text':
        return this.validateTextQuestion(question);
      case 'correct-order':
        return this.validateCorrectOrderQuestion(question);
      case 'match-pairs':
        return this.validateMatchPairsQuestion(question);
      default:
        return false;
    }
  }

  /**
   * Validate multiple-choice question
   * @param {Object} question - The question object
   * @returns {Boolean} - Returns true if valid, otherwise false
   */
  validateMultipleChoiceQuestion(question) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return false;
    }

    let hasCorrectOption = false;
    for (const option of question.options) {
      if (
        !option.option_text ||
        typeof option.option_text !== 'string' ||
        !option.option_text.trim()
      ) {
        return false;
      }
      if (option.is_correct) {
        hasCorrectOption = true;
      }
    }
    return hasCorrectOption;
  }

  /**
   * Validate true-false question
   * @param {Object} question - The question object
   * @returns {Boolean} - Returns true if valid, otherwise false
   */
  validateTrueFalseQuestion(question) {
    if (!Array.isArray(question.options) || question.options.length !== 2) {
      return false;
    }

    const trueFalseOptions = question.options.map((opt) =>
      opt.option_text.toLowerCase()
    );
    return (
      trueFalseOptions.includes('true') && trueFalseOptions.includes('false')
    );
  }

  /**
   * Validate text question
   * @param {Object} question - The question object
   * @returns {Boolean} - Returns true if valid, otherwise false
   */
  validateTextQuestion(question) {
    return (
      question.options &&
      question.options[0].option_text &&
      typeof question.options[0].option_text === 'string'
    );
  }

  /**
   * Validate correct-order question
   * @param {Object} question - The question object
   * @returns {Boolean} - Returns true if valid, otherwise false
   */
  validateCorrectOrderQuestion(question) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      return false;
    }
    console.log(question);
    for (const step of question.options) {
      console.log(step);

      if (
        !step.option_text ||
        typeof step.option_text !== 'string' ||
        !step.option_text.trim()
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate match-pairs question
   * @param {Object} question - The question object
   * @returns {Boolean} - Returns true if valid, otherwise false
   */
  validateMatchPairsQuestion(question) {
    if (!Array.isArray(question.options) || question.options.length < 1) {
      return false;
    }

    for (const pair of question.options) {
      if (
        !pair.left_option_text ||
        typeof pair.left_option_text !== 'string' ||
        !pair.left_option_text.trim() ||
        !pair.right_option_text ||
        typeof pair.right_option_text !== 'string' ||
        !pair.right_option_text.trim()
      ) {
        return false;
      }
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
   * Controller to add multiple questions to a quiz
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   *
   * This method validates the input for required fields ('quizId', 'questions') and
   * calls the model method to add questions to the specified quiz.
   */
  async addQuestions(req, res) {
    try {
      // Step 1: Input validation
      const isValid = await this.inputValidation(
        ['quizId', 'questions'],
        req,
        res
      );
      if (!isValid) {
        return; // Input validation failed, so return early
      }

      // Step 2: Extract data from the request body
      const { quizId, questions } = req.body;
      console.log(`Adding questions to quiz with ID: ${quizId}`); // Debugging log

      // Step 3: Add questions using the model method
      const addedQuestions = await Quiz.addQuestions(quizId, questions);
      console.log(
        `Successfully added questions: ${JSON.stringify(addedQuestions)}`
      ); // Debugging log

      // Step 4: Return success response
      res.status(201).json({ addedQuestions });
    } catch (error) {
      // Step 5: Error handling
      console.error('Error occurred while adding questions:', error); // Log error for debugging
      this.handleError(res, error); // Propagate error response
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
      console.log('getQuiz : ', quiz);
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
      console.log(questions);
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
      const isValid = await this.inputValidation(
        ['quizId', 'questionId'],
        req,
        res
      );
      if (!isValid) return;
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
   * Update a quiz and its questions.
   * Validates the title, description, and questions array.
   * For each question in the questions array, validates the question text, type, options, and correct answer.
   * Only updates the quiz title and description if they have been edited.
   * Iterates over the questions to update, add, or mark them as deleted based on the input.
   * Returns the updated quiz if successful, or an appropriate error message if validation fails.
   *
   * @param {Object} req - The request object containing the quiz ID and updated data.
   * @param {Object} res - The response object to send back the result.
   */
  async updateQuiz(req, res) {
    try {
      // Log the incoming request parameters
      console.log('Received updateQuiz request:', req.params);
      console.log('Received body:', req.body);

      const isValid = await this.inputValidation(
        ['title', 'description', 'questions'],
        req,
        res
      );
      if (!isValid) return;

      const { quizId } = req.params;
      const { title, description, questions, metaEdited } = req.body;

      // Log the flags and parameters
      console.log('Quiz ID:', quizId);
      console.log('Title:', title);
      console.log('Description:', description);
      console.log('Meta Edited:', metaEdited);
      console.log('Questions:', questions);

      // Update the quiz only if the title or description has been edited
      let updatedQuiz = null;
      if (metaEdited) {
        console.log('Updating quiz metadata...');
        updatedQuiz = await Quiz.updateQuiz(quizId, title, description);
        console.log('Updated Quiz:', updatedQuiz);
      }

      // Process edited and deleted questions
      if (questions && questions.length > 0) {
        console.log('Processing questions...');
        await Quiz.updateQuizQuestions(quizId, questions);
        console.log('Questions processed successfully');
      }

      res.status(200).json({
        message: 'Quiz updated successfully',
        updatedQuiz,
      });

      // Log the success response
      console.log('Quiz update completed successfully');
    } catch (error) {
      console.error('Error updating quiz:', error);
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
      const totalQuestions = quizResults.questions.length;

      res.status(200).json({
        score: quizResults.score,
        percentScore: quizResults.percentage,
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

  async updateQuizStatus(req, res) {
    const { quizId } = req.params;
    const { is_active } = req.body;

    try {
      const isActive = is_active === true || is_active === 'true';
      console.log(isActive);
      const quiz = await Quiz.updateQuizStatus(quizId, isActive);
      console.log('returned obj from model:', quiz);
      if (!quiz) {
        return res.status(404).json({
          error: 'Quiz not found or no questions added to be published!',
        });
      }
      res.status(200).json(quiz);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentQuizzes(req, res) {
    const userId = req.user.id;
    console.log('get student active quizzes', userId);
    try {
      const quizzes = await Quiz.getUserActiveQuizzes(userId);

      console.log('quizzes', quizzes);
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getQuizForTaking(req, res) {
    const { quizId } = req.params;
    const userId = req.user.id; // Assuming the user is authenticated and req.user.id provides the user ID

    try {
      console.log(`Fetching quiz for userId: ${userId} and quizId: ${quizId}`);

      // Fetch quiz and questions
      const quiz = await Quiz.getQuizById(quizId);
      console.log('Fetched Quiz:', quiz);

      const questions = await Quiz.listAllQuestions(quizId);
      console.log('Fetched Questions with Options:', questions);

      // Fetch user's previous attempt responses if they exist
      const lastAttempt = await Quiz.getLastAttemptByUser(quizId, userId);
      console.log('Fetched Last Attempt by User:', lastAttempt);

      // Attach the questions and previous answers (if any) to the quiz
      quiz.questions = questions;

      if (lastAttempt && lastAttempt.length > 0) {
        // Attach user's previous answers to the quiz questions
        quiz.questions.forEach((question) => {
          const previousAnswer = lastAttempt.find(
            (answer) => answer.question_id === question.id
          );

          if (previousAnswer) {
            if (
              question.question_type === 'multiple-choice' ||
              question.question_type === 'true-false'
            ) {
              // Compare response_text with each option_text to find the selected option
              const selectedOption = question.options.find(
                (option) => option.option_text === previousAnswer.response_text
              );

              console.log(
                `For Question ID ${question.id}, matching response_text with option_text`
              );

              question.previous_answer = {
                selected_option_id: selectedOption?.id || null, // Log if option found
                response_text: previousAnswer.response_text,
              };
              console.log(
                `Matched option for question ID ${question.id}:`,
                selectedOption
              );
            } else if (question.question_type === 'text') {
              // For text-based questions, just use the response_text directly
              question.previous_answer = {
                selected_option_id: null,
                response_text: previousAnswer.response_text,
              };
              console.log(
                `Text response for question ID ${question.id}:`,
                previousAnswer.response_text
              );
            }
          } else {
            question.previous_answer = null; // No previous answer for this question
            console.log(
              `No previous answer found for question ID ${question.id}`
            );
          }
        });
      }

      res.status(200).json({ quiz });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Fetch quiz responses (score and percentage) for each user who attempted the quiz
   * @param {Object} req - The request object containing quizId
   * @param {Object} res - The response object to send data
   */
  async getQuizResponses(req, res) {
    try {
      const { quizId } = req.params;
      console.log(quizId);
      // Fetch all users (students)
      const users = await User.getAllUsernames();

      const responses = [];

      for (const user of users) {
        // Fetch the latest attempt for each user for this quiz
        const latestAttempt = await Quiz.getLatestQuizAttempt(user.id, quizId);

        if (latestAttempt) {
          // If there is an attempt, push the score and percentage
          responses.push({
            userId: user.id,
            username: user.username,
            score: latestAttempt.score,
            percentage: latestAttempt.percentage,
          });
        }
      }
      console.log(responses);
      res.status(200).json({
        quizId,
        responses,
      });
    } catch (error) {
      console.error('Error fetching quiz responses:', error);
      res.status(500).json({ message: 'Failed to fetch quiz responses' });
    }
  }
  formatUserResponses(responses) {
    const formatted = responses.reduce((acc, curr) => {
      const existingQuiz = acc.find(
        (item) => item.quizTitle === curr.quiz_title
      );

      const responseData = {
        questionId: curr.question_id, // if you have it, otherwise remove it
        questionText: curr.question_text,
        correctAnswer: curr.correct_answer,
        userResponse: curr.user_response,
        isCorrect: curr.is_correct,
      };

      if (existingQuiz) {
        existingQuiz.quizResponses.push(responseData);
      } else {
        acc.push({
          quizTitle: curr.quiz_title,
          quizResponses: [responseData],
        });
      }

      return acc;
    }, []);

    return formatted;
  }
  formatQuizResponses(responses) {
    console.log('Received responses for formatting:', responses);

    const formatted = responses.reduce((acc, curr) => {
      const existingUser = acc.find((item) => item.username === curr.username);

      // Log each response data before formatting
      console.log('Current response data:', curr);

      const responseData = {
        questionText: curr.question_text,
        correctAnswer: curr.correct_answer,
        userResponse: curr.user_response,
        isCorrect: curr.is_correct,
      };

      if (existingUser) {
        existingUser.quizResponses.push(responseData);
      } else {
        acc.push({
          username: curr.username,
          quizResponses: [responseData],
        });
      }

      return acc;
    }, []);

    // Log the final formatted structure
    console.log('Formatted quiz responses:', formatted);

    return formatted;
  }

  // Method to get detailed quiz responses based on type (quiz or user)
  async getDetailedQuizResponses(req, res) {
    try {
      const { quizId, userId, type } = req.query;

      console.log(
        `Received request for detailed responses with quizId: ${quizId}, userId: ${userId}, type: ${type}`
      ); // Debug log

      // Fetch detailed quiz responses
      const responses = await Quiz.getDetailedResponses({
        quizId,
        userId,
        type,
      });

      console.log('Detailed quiz responses fetched:', responses); // Debug log

      let formattedResponses;
      if (type === 'quiz' && quizId) {
        formattedResponses = this.formatQuizResponses(responses);
      } else if (type === 'user' && userId) {
        formattedResponses = this.formatUserResponses(responses);
      } else {
        return res
          .status(400)
          .json({ error: 'Invalid type or missing quizId/userId' });
      }
      console.log('Detailed quiz responses formatted:', formattedResponses); // Debug log
      return res.status(200).json(formattedResponses);
    } catch (error) {
      console.error('Error fetching detailed responses:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  async getStudentNewQuizzes(req, res) {
    try {
      const userId = req.user.id; // Extract the user ID from the token
      const newQuizzes = await Quiz.getUnattemptedQuizzes(userId);
      console.log('New Quizzes: ', newQuizzes);
      return res.status(200).json({ quizzes: newQuizzes });
    } catch (error) {
      console.error('Error fetching new quizzes:', error);
      return res.status(500).json({ error: 'Failed to fetch new quizzes' });
    }
  }
}

module.exports = new QuizController();
