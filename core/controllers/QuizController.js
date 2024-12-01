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
        case 'answers':
          await body(field)
            .isArray()
            .withMessage('Answers must be an array')
            .custom((answers) => {
              for (const answer of answers) {
                if (
                  !answer.questionId ||
                  !answer.questionType ||
                  (answer.questionType === 'multiple-choice' &&
                    !Array.isArray(answer.selectedOptions)) ||
                  (answer.questionType === 'true-false' &&
                    answer.selectedOption !== null &&
                    answer.selectedOption !== '' &&
                    typeof answer.selectedOption !== 'string') || // Ensure valid string
                  (answer.questionType === 'text' &&
                    typeof answer.answerText !== 'string') ||
                  (answer.questionType === 'correct-order' &&
                    !Array.isArray(answer.optionPairs)) ||
                  (answer.questionType === 'match-pairs' &&
                    !Array.isArray(answer.optionPairs))
                ) {
                  throw new Error(
                    `Invalid answer data for question ID: ${answer.questionId}`
                  );
                }
              }
              return true;
            })
            .run(req);
          break;
        case 'quizId':
          await body(field)
            .isInt()
            .withMessage('Quiz ID must be a valid integer')
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
        console.log('pair', pair);
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
   * Called by student (to take quiz) and admin (to update or add questions)
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {void}
   */
  async listAllQuestions(req, res) {
    try {
      const { quizId } = req.params;

      // Fetch all questions for the quiz
      const questions = await Quiz.listAllQuestions(quizId);

      if (!questions || questions.length === 0) {
        return res
          .status(404)
          .json({ message: 'No questions found for this quiz.' });
      }

      console.log('Questions:', questions);

      // Fetch correct answers for the quiz
      const correctAnswers = await Quiz.getCorrectAnswers(quizId);

      if (!correctAnswers || correctAnswers.length === 0) {
        return res
          .status(404)
          .json({ message: 'No correct answers found for this quiz.' });
      }

      console.log('Correct answers fetched successfully:', correctAnswers);

      // Attach correct answers to questions
      const questionsWithAnswers = this.attachCorrectAnswers(
        questions,
        correctAnswers
      );

      res.status(200).json({ questions: questionsWithAnswers });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Failed to fetch questions' });
    }
  }

  /**
   * Attach correct answers to their respective questions
   * @param {Array} questions - The list of questions
   * @param {Array} correctAnswers - The list of correct answers
   * @returns {Array} Questions with correct answers attached
   */
  attachCorrectAnswers(questions, correctAnswers) {
    return questions.map((question) => {
      const correctAnswer = correctAnswers.find(
        (answer) => answer.questionId === question.id
      );

      if (!correctAnswer) {
        return question; // No correct answer, return the question as is
      }

      const {
        questionType,
        correctAnswers: answers,
        correctText,
      } = correctAnswer;

      // Attach the correct answers based on the question type
      switch (questionType) {
        case 'multiple-choice':
        case 'true-false':
          return {
            ...question,
            options: question.options.map((option) => ({
              ...option,
              is_correct: answers.includes(option.option_uuid),
            })),
          };

        case 'text':
          return {
            ...question,
            correct_text: correctText,
            is_correct: true,
          };

        case 'correct-order':
          return {
            ...question,
            options: question.options.map((option, index) => ({
              ...option,
              option_text: option.left_option_text, // Use left_option_text as option_text
              is_correct: true, // Correct order always marked as correct
            })),
          };
        case 'match-pairs':
          return {
            ...question,
            options: question.options.map((option, index) => ({
              ...option,
              is_correct: true,
            })),
          };

        default:
          console.warn(`Unknown question type: ${questionType}`);
          return question;
      }
    });
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

      console.log('Quiz ID:', quizId);
      console.log('Title:', title);
      console.log('Description:', description);
      console.log('Meta Edited:', metaEdited);
      console.log('Questions:', questions);

      let updatedQuiz = null;
      if (metaEdited) {
        console.log('Updating quiz metadata...');
        updatedQuiz = await Quiz.updateQuiz(quizId, title, description);
        console.log('Updated Quiz:', updatedQuiz);
      }

      if (questions && questions.length > 0) {
        console.log('Processing questions...');
        await Quiz.updateQuizQuestions(quizId, questions);
        console.log('Questions processed successfully');
      }

      res.status(200).json({
        message: 'Quiz updated successfully',
        updatedQuiz,
      });
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
   */
  async getQuizResults(req, res) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id;

      const quizResults = await Quiz.getQuizResultsForUser(userId, quizId);

      if (!quizResults) {
        console.error(
          `No quiz results found for user ID: ${userId}, quiz ID: ${quizId}`
        );
        return res.status(404).json({ message: 'Quiz results not found' });
      }

      res.status(200).json({
        results: quizResults.results,
        score: quizResults.score,
        percentage: quizResults.percentage,
        showCorrectAnswersEnabled: quizResults.percentage >= 60,
        showCorrectAnswersTooltip:
          'This button will be enabled only when your percentage is greater than or equal to 60%.',
      });
    } catch (error) {
      console.error('Error fetching quiz results:', error.message);
      res.status(500).json({ message: 'Failed to fetch quiz results' });
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
      console.log(req.body);
      const { quizId } = req.params;
      const userId = req.user.id;
      const isValid = await this.inputValidation(['answers'], req, res);
      if (!isValid) return;

      const { answers } = req.body;
      const result = await Quiz.submitQuiz(userId, quizId, answers);

      res.status(200).json({ message: 'Successfully submitted!', result });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Fetch correct answers for a specific attempt
   * @param {Object} req - The request object containing attempt ID
   * @param {Object} res - The response object to send data
   */
  async getCorrectAnswers(req, res) {
    try {
      const { quizId } = req.params;
      const userId = req.user.id; // Extract user ID from the token

      console.log(
        `Fetching correct answers for quizId: ${quizId}, userId: ${userId}`
      ); // Debug log

      // Step 1: Fetch the latest attempt for the quiz and user
      const attemptDetails = await Quiz.getLatestQuizAttempt(userId, quizId);

      if (!attemptDetails) {
        return res
          .status(403)
          .json({ message: 'No valid attempt found for this quiz.' });
      }

      // Step 2: Check if the score is sufficient to fetch correct answers
      if (attemptDetails.percentage < 60) {
        return res.status(403).json({
          message:
            'Correct answers are only available for scores equal to or above 60%.',
        });
      }

      // Step 3: Fetch correct answers
      const correctAnswers = await Quiz.getCorrectAnswers(quizId);

      if (!correctAnswers || correctAnswers.length === 0) {
        return res
          .status(404)
          .json({ message: 'No correct answers found for this quiz.' });
      }

      console.log(`Correct answers fetched successfully:`, correctAnswers);
      res.status(200).json(correctAnswers);
    } catch (error) {
      console.error('Error fetching correct answers:', error.message);
      res.status(500).json({ message: 'Failed to fetch correct answers.' });
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

  async getStudentAttemptedQuizzes(req, res) {
    const userId = req.user.id;
    const { includeArchived = false } = req.query; // Accept query parameter for archived quizzes
    try {
      const quizzes = await Quiz.getUserActiveQuizzes(userId, includeArchived);
      console.log(quizzes);
      res.json(quizzes);
    } catch (error) {
      console.error('Error fetching student quizzes:', error);
      res.status(500).json({ error: 'Failed to fetch student quizzes' });
    }
  }

  async getQuizForTaking(req, res) {
    const { quizId } = req.params;
    const userId = req.user.id;

    try {
      console.log(`Fetching quiz for userId: ${userId} and quizId: ${quizId}`);

      // Fetch quiz metadata and questions
      const quiz = await Quiz.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      const questions = await Quiz.listAllQuestions(quizId);
      const lastAttempt = await Quiz.getLastAttemptByUser(quizId, userId);

      // Process each question
      quiz.questions = questions.map((question) =>
        this.processQuestion(question, lastAttempt)
      );

      res.status(200).json({ quiz });
    } catch (error) {
      console.error('Error fetching quiz:', error);
      res.status(500).json({ error: error.message });
    }
  }

  processQuestion(question, lastAttempt) {
    const previousAnswer = lastAttempt?.find(
      (answer) => answer.question_id === question.id
    );

    // Randomize options for specific question types
    if (
      question.question_type === 'match-pairs' ||
      question.question_type === 'correct-order'
    ) {
      question.options = this.randomizeOptions(question.options);
    }

    // Attach user response
    question.previous_answer = this.attachUserResponse(
      question,
      previousAnswer
    );

    return question;
  }

  randomizeOptions(options) {
    const leftOptions = options.map((option) => ({
      left_option_uuid: option.left_option_uuid,
      left_option_text: option.left_option_text,
    }));

    const rightOptions = options.map((option) => ({
      right_option_uuid: option.right_option_uuid,
      right_option_text: option.right_option_text,
    }));

    return {
      left_options: this.shuffleArray(leftOptions),
      right_options: this.shuffleArray(rightOptions),
    };
  }

  attachUserResponse(question, previousAnswer) {
    if (!previousAnswer) {
      return null;
    }

    switch (question.question_type) {
      case 'multiple-choice':
      case 'true-false':
        return {
          selected_option_ids: previousAnswer.selected_option_ids || [],
        };

      case 'text':
        return {
          answer_text: previousAnswer.answer_text || '',
        };

      case 'correct-order':
      case 'match-pairs':
        console.log(previousAnswer);
        return {
          option_pairs: previousAnswer.user_option_pairs || [],
        };

      default:
        return null;
    }
  }

  shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
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
    const userId = req.user.id;
    const { includeArchived = false } = req.query; // Accept query parameter for archived quizzes
    try {
      const newQuizzes = await Quiz.getUnattemptedQuizzes(
        userId,
        includeArchived
      );
      res.status(200).json({ quizzes: newQuizzes });
    } catch (error) {
      console.error('Error fetching new quizzes:', error);
      res.status(500).json({ error: 'Failed to fetch new quizzes' });
    }
  }

  async toggleQuizArchiveStatus(req, res) {
    const userId = req.user.id;
    const { quizId } = req.body;
    const { archive } = req.body; // Expect a boolean value for `archive`

    try {
      const result = await Quiz.toggleArchiveStatus(userId, quizId, archive);
      res.status(200).json({ message: result });
    } catch (error) {
      console.error('Error toggling quiz archive status:', error);
      res.status(500).json({ error: 'Failed to update archive status' });
    }
  }
}

module.exports = new QuizController();
