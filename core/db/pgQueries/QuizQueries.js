const db = require('../db');
const Query = require('./Query');

/**
 * Quiz Queries
 * Extends the base Query class and includes Quiz-specific queries
 */
class QuizQueries extends Query {
  constructor() {
    super('quizzes');
  }

  /**
   * Create a new quiz
   * @param {String} title - The title of the quiz
   * @param {String} description - The description of the quiz
   * @returns {Object} - The created quiz
   */
  async createQuiz(title, description) {
    const result = await db.query(
      `INSERT INTO quizzes (title, description) VALUES ($1, $2) RETURNING *`,
      [title, description]
    );
    return result.rows[0];
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
    } else if (questionType === 'true-false') {
      await db.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
        [question.id, 'True', correctAnswer === 'True']
      );
      await db.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
        [question.id, 'False', correctAnswer === 'False']
      );
    } else if (questionType === 'text') {
      await db.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
        [question.id, correctAnswer, true]
      );
    }

    return question;
  }

  /**
   * Add multiple questions to a quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {Array} questions - The questions to add
   * @returns {Array} - The added questions
   */
  // QuizQueries.js

  async addQuestions(quizId, questions) {
    const client = await db.pool.connect();
    const results = [];

    try {
      await client.query('BEGIN'); // Start transaction

      for (const question of questions) {
        const result = await client.query(
          'INSERT INTO questions (quiz_id, question_text, question_type, deleted) VALUES ($1, $2, $3, false) RETURNING *',
          [quizId, question.question_text, question.question_type]
        );
        const questionId = result.rows[0].id;

        // Handle options based on question type
        if (
          question.question_type === 'multiple-choice' ||
          question.question_type === 'true-false' ||
          question.question_type === 'text'
        ) {
          await this.insertOptions(questionId, question.options, client);
        } else if (
          question.question_type === 'correct-order' ||
          question.question_type === 'match-pairs'
        ) {
          await this.insertOptionsGrid(
            questionId,
            question.options,
            question.question_type === 'correct-order',
            client
          );
        }

        results.push(result.rows[0]);
      }

      await client.query('COMMIT'); // Commit transaction
      return results;
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaction on error
      console.error('Error in QuizQueries.addQuestions:', error);
      throw new Error('Failed to add questions to the quiz');
    } finally {
      client.release();
    }
  }

  // Helper method to insert multiple-choice or true-false options
  async insertOptions(questionId, options, client) {
    for (const option of options) {
      await client.query(
        'INSERT INTO options (question_id, option_text, is_correct, option_uuid) VALUES ($1, $2, $3, uuid_generate_v4())',
        [questionId, option.option_text, option.is_correct]
      );
    }
  }

  // Helper method to insert correct-order or match-pairs options
  async insertOptionsGrid(questionId, options, isCorrectOrder = false, client) {
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (isCorrectOrder) {
        // For correct-order: store order number as left_option_text and option text as right_option_text
        await client.query(
          `INSERT INTO options_grid (question_id, left_option_text, right_option_text, left_option_uuid, right_option_uuid) 
         VALUES ($1, $2, $3, uuid_generate_v4(), uuid_generate_v4())`,
          [questionId, `${i + 1}`, option.option_text] // Order number, then actual text
        );
      } else {
        // For match-pairs: store left text and right text as usual
        await client.query(
          `INSERT INTO options_grid (question_id, left_option_text, right_option_text, left_option_uuid, right_option_uuid) 
         VALUES ($1, $2, $3, uuid_generate_v4(), uuid_generate_v4())`,
          [questionId, option.left_option_text, option.right_option_text] // Standard match-pairs format
        );
      }
    }
  }

  /**
   * Find all questions by quiz ID
   * @param {Number} quizId - The ID of the quiz
   * @returns {Array} - The list of questions
   */
  async findQuestionsByQuizId(quizId) {
    try {
      console.log(quizId);
      const questionsResult = await db.query(
        `
          SELECT 
            q.id as question_id, 
            q.question_text, 
            q.question_type, 
            q.created_at, 
            q.updated_at, 
            o.id as option_id, 
            o.option_text,
            o.is_correct
          FROM 
            questions q 
          INNER JOIN 
            options o 
          ON 
            q.id = o.question_id 
          WHERE 
            q.quiz_id = $1 AND q.deleted = false
          `,
        [quizId]
      );

      if (questionsResult.rowCount === 0) {
        console.error(`No questions or options found for quiz ID: ${quizId}`);
        return null;
      }

      const questionsMap = new Map();

      questionsResult.rows.forEach((row) => {
        const questionId = row.question_id;
        if (!questionsMap.has(questionId)) {
          questionsMap.set(questionId, {
            id: questionId,
            question_text: row.question_text,
            question_type: row.question_type,
            created_at: row.created_at,
            updated_at: row.updated_at,
            options: [],
          });
        }

        if (row.option_id) {
          questionsMap.get(questionId).options.push({
            id: row.option_id,
            option_text: row.option_text,
            is_correct: row.is_correct,
          });
        }
      });

      const questions = Array.from(questionsMap.values());

      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  }

  /**
   * Fetch user's last attempt answers for a given quiz
   * @param {Number} quizId - The ID of the quiz
   * @param {Number} userId - The ID of the user
   * @returns {Array} - List of user's previous answers
   */
  async getLastAttemptByUser(quizId, userId) {
    try {
      console.log(
        `Fetching last attempt for quizId: ${quizId}, userId: ${userId}`
      );

      const result = await db.query(
        `
        WITH latest_attempt AS (
          SELECT 
            id 
          FROM 
            quiz_attempts 
          WHERE 
            quiz_id = $1 AND user_id = $2 
          ORDER BY 
            attempt_date DESC 
          LIMIT 1
        )
        SELECT 
          r.question_id, 
          r.response_text 
        FROM 
          responses r
        INNER JOIN 
          latest_attempt la
        ON 
          r.attempt_id = la.id
        `,
        [quizId, userId]
      );
      console.log('Fetched user responses:', result.rows);

      if (result.rowCount === 0) {
        console.log(
          `No attempt found for quizId: ${quizId}, userId: ${userId}`
        );
        return null;
      }

      return result.rows;
    } catch (error) {
      console.error('Error fetching user attempt:', error);
      throw new Error('Failed to fetch user attempt');
    }
  }

  /**
   * Delete a question by ID
   * @param {Number} questionId - The ID of the question
   * @returns {Object} - The deleted question
   */
  async deleteQuestionById(quizId, questionId) {
    await db.query(`DELETE FROM options WHERE question_id = $1`, [questionId]);
    console.log(questionId);
    const result = await db.query(
      `DELETE FROM questions WHERE id = $1 and quiz_id = $2 RETURNING *`,
      [questionId, quizId]
    );
    return result.rows[0];
  }

  /**
   * Delete multiple questions by their IDs
   * @param {Array} questionIds - The IDs of the questions to delete
   * @returns {Object} - The result of the deletion
   */
  async deleteMultipleQuestions(questionIds) {
    for (const questionId of questionIds) {
      await this.deleteQuestionById(questionId);
    }
    return { message: 'Questions deleted successfully' };
  }

  /**
   * Fetch all Quizzes with pagination
   * @param {page} - The total page numbers
   * @returns {limit} - The limit of results per page
   */
  async findAllWithPagination(page, limit) {
    const offset = (page - 1) * limit;
    const result = await db.query(
      `SELECT * FROM quizzes ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Retrieves all questions for a specific quiz from the database.
   * @param {quizId} - The id of the quiz
   */
  async getAllQuestions(quizId) {
    const result = await db.query(
      `SELECT * FROM questions WHERE quiz_id = $1 AND deleted = false ORDER BY created_at ASC`,
      [quizId]
    );
    return result.rows;
  }

  /**
   * Submit quiz answers and calculate score and percentage
   * @param {Number} studentId - The ID of the student
   * @param {Number} quizId - The ID of the quiz
   * @param {Array} answers - The list of answers
   * @returns {Object} - The quiz attempt result including score and percentage
   */

  async submitQuiz(studentId, quizId, answers) {
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      // Get total number of questions for the quiz
      const totalQuestionsResult = await client.query(
        `SELECT COUNT(*) as total_questions FROM questions WHERE quiz_id = $1`,
        [quizId]
      );
      const totalQuestions = parseInt(
        totalQuestionsResult.rows[0].total_questions
      );

      // Create quiz attempt with initial score set to 0
      const quizAttemptResult = await client.query(
        `INSERT INTO quiz_attempts (user_id, quiz_id, score, percentage) VALUES ($1, $2, $3, $4) RETURNING *`,
        [studentId, quizId, 0, 0]
      );
      const quizAttemptId = quizAttemptResult.rows[0].id;

      let score = 0;
      console.log(answers);

      // Insert responses and calculate score
      for (const answer of answers) {
        const { questionId, answerText } = answer;

        let isCorrect = false;

        const correctOptionResult = await client.query(
          `SELECT * FROM options WHERE question_id = $1 AND option_text = $2 AND is_correct = true`,
          [questionId, answerText]
        );
        isCorrect = correctOptionResult.rowCount > 0;

        if (isCorrect) {
          score++;
        }

        await client.query(
          `INSERT INTO responses (attempt_id, question_id, response_text, is_correct) VALUES ($1, $2, $3, $4)`,
          [quizAttemptId, questionId, answerText, isCorrect]
        );
      }

      // Calculate percentage based on score and total number of questions
      const percentage = (score / totalQuestions) * 100;

      // Update quiz attempt with score and percentage
      await client.query(
        `UPDATE quiz_attempts SET score = $1, percentage = $2 WHERE id = $3`,
        [score, percentage, quizAttemptId]
      );

      await client.query('COMMIT');
      console.log(
        'Returning score and percentage',
        score,
        percentage,
        quizAttemptId
      );
      return { quizAttemptId, score, percentage };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during quiz submission:', error);
      throw new Error('Failed to submit quiz');
    } finally {
      client.release();
    }
  }

  async checkDataConsistency(userId, quizId) {
    try {
      const queryAttempts = `SELECT * FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2`;
      const queryResponses = `SELECT * FROM responses WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2)`;
      const attemptsResult = await db.query(queryAttempts, [userId, quizId]);
      const responsesResult = await db.query(queryResponses, [userId, quizId]);

      console.log('Quiz Attempts:', attemptsResult.rows);
      console.log('Responses:', responsesResult.rows);
    } catch (error) {
      console.error('Error checking data consistency:', error);
    }
  }

  // Helper 1: Fetch the latest quiz attempt
  async getLatestQuizAttempt(userId, quizId) {
    const query = `
    SELECT 
        id as attempt_id, 
        score, 
        percentage
    FROM 
        quiz_attempts
    WHERE 
        user_id = $1
    AND 
        quiz_id = $2
    ORDER BY 
        attempt_date DESC
    LIMIT 1;
  `;
    const result = await db.query(query, [userId, quizId]);
    if (result.rowCount === 0) {
      console.error(
        `No attempt found for user ID: ${userId} and quiz ID: ${quizId}`
      );
      return null;
    }
    return result.rows[0]; // Return the latest attempt
  }

  // Helper 2: Fetch responses for the given quiz attempt
  async getResponsesForAttempt(attemptId) {
    const query = `
    SELECT 
        q.id as question_id,
        q.question_text,
        q.question_type,
        o.id as option_id,
        o.option_text,
        o.is_correct,
        r.response_text as user_response,
        r.is_correct as response_correct
    FROM 
        responses r
    INNER JOIN 
        questions q ON r.question_id = q.id
    LEFT JOIN 
        options o ON q.id = o.question_id
    WHERE 
        r.attempt_id = $1
    ORDER BY 
        q.id, o.id;
  `;
    const result = await db.query(query, [attemptId]);
    if (result.rowCount === 0) {
      console.error(`No responses found for attempt ID: ${attemptId}`);
      return null;
    }
    return result.rows; // Return all responses for the attempt
  }
  /**
   * Fetch quiz results for a user based on the quiz ID and user ID
   * @param {Number} userId - The ID of the user
   * @param {Number} quizId - The ID of the quiz
   * @returns {Object} - The quiz results including score, correct answers, and user responses
   */
  async getQuizResultsForUser(userId, quizId) {
    try {
      // Get the latest quiz attempt
      const latestAttempt = await this.getLatestQuizAttempt(userId, quizId);
      if (!latestAttempt) {
        return null; // No attempt found
      }

      const { attempt_id, score, percentage } = latestAttempt; // Destructure attempt_id and score

      // Get responses for the quiz attempt
      const responses = await this.getResponsesForAttempt(attempt_id);
      if (!responses) {
        return null; // No responses found
      }

      // Build the question map with options and responses
      const questionsMap = new Map();

      responses.forEach((row) => {
        const questionId = row.question_id;
        if (!questionsMap.has(questionId)) {
          questionsMap.set(questionId, {
            id: questionId,
            question_text: row.question_text,
            question_type: row.question_type,
            options: [],
            user_response: row.user_response,
            response_correct: row.response_correct,
          });
        }

        if (row.option_id) {
          questionsMap.get(questionId).options.push({
            id: row.option_id,
            option_text: row.option_text,
            is_correct: row.is_correct,
          });
        }
      });

      // Convert the map back to an array
      const questions = Array.from(questionsMap.values());

      // Return the final results structure with the same format as before
      return {
        questions,
        score,
        percentage,
      };
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw new Error('Failed to fetch quiz results');
    }
  }

  /**
   * Get quiz results including user responses and correct answers
   * @param {Number} quizId - The ID of the quiz
   * @param {Number} attemptId - The ID of the quiz attempt
   * @returns {Array} - The list of questions with options and user responses
   */
  async getQuizResults(quizId, attemptId) {
    try {
      const questionsResult = await db.query(
        `
        SELECT 
          q.id as question_id, 
          q.question_text, 
          q.question_type, 
          q.created_at, 
          q.updated_at, 
          o.id as option_id, 
          o.option_text, 
          o.is_correct,
          r.response_text,
          r.is_correct as response_correct
        FROM 
          questions q 
        INNER JOIN 
          options o 
        ON 
          q.id = o.question_id 
        LEFT JOIN
          responses r
        ON 
          q.id = r.question_id AND r.attempt_id = $2
        WHERE 
          q.quiz_id = $1 AND q.deleted = false
      `,
        [quizId, attemptId]
      );

      if (questionsResult.rowCount === 0) {
        console.error(`No questions or options found for quiz ID: ${quizId}`);
        return null;
      }

      const questionsMap = new Map();

      questionsResult.rows.forEach((row) => {
        const questionId = row.question_id;
        if (!questionsMap.has(questionId)) {
          questionsMap.set(questionId, {
            id: questionId,
            question_text: row.question_text,
            question_type: row.question_type,
            created_at: row.created_at,
            updated_at: row.updated_at,
            options: [],
            user_response: row.response_text,
            response_correct: row.response_correct,
          });
        }

        if (row.option_id) {
          questionsMap.get(questionId).options.push({
            id: row.option_id,
            option_text: row.option_text,
            is_correct: row.is_correct,
          });
        }
      });

      const questions = Array.from(questionsMap.values());

      console.log(
        'Final Questions with responses, correct answers:',
        questions
      );

      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  }

  /**
   * Find quiz by ID to take the quiz
   * @param {Number} quizId - The ID of the quiz
   * @returns {Object} - The quiz details including questions and options
   */
  async findQuizById(quizId) {
    const quizResult = await db.query(
      `SELECT * FROM quizzes WHERE id = $1 AND is_active = true`,
      [quizId]
    );
    const questionsResult = await db.query(
      `SELECT * FROM questions WHERE quiz_id = $1 AND deleted = false`,
      [quizId]
    );
    const optionsResult = await db.query(
      `SELECT * FROM options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = $1 AND deleted = false)`,
      [quizId]
    );

    const quiz = quizResult.rows[0];
    const questions = questionsResult.rows;
    const options = optionsResult.rows;

    questions.forEach((question) => {
      question.options = options.filter(
        (option) => option.question_id === question.id
      );
    });

    quiz.questions = questions;
    return quiz;
  }

  /**
   * Find all active quizzes available for students to attempt.
   * @returns {Array} - The list of active quizzes
   */
  async findActiveQuizzes() {
    const result = await db.query(
      `SELECT * FROM quizzes WHERE is_active = true`
    );
    return result.rows;
  }

  /**
   * Get the active quiz not attempted yet by the student
   * @param {Number} studentId - The ID of the student
   * @returns {Object} - The quiz details
   */
  async getActiveQuiz(studentId) {
    const result = await db.query(
      `
      SELECT q.*
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.user_id = $1
      WHERE q.is_active = true AND qa.id IS NULL
      ORDER BY q.id ASC
      LIMIT 1
      `,
      [studentId]
    );

    return result.rows[0];
  }

  /**
   * Update the status of a quiz by ID
   * @param {Number} quizId - The ID of the quiz
   * @param {Boolean} isActive - The new status of the quiz
   * @returns {Object} - The updated quiz
   */
  async updateQuizStatusById(quizId, isActive) {
    try {
      // Check if there is at least one question that is not marked as deleted
      const questionCheckResult = await db.query(
        `SELECT COUNT(*) AS active_questions FROM questions WHERE quiz_id = $1 AND deleted = false`,
        [quizId]
      );

      const activeQuestionsCount = parseInt(
        questionCheckResult.rows[0].active_questions,
        10
      );

      // If trying to activate the quiz and there are no active questions, return null
      if (isActive && activeQuestionsCount === 0) {
        console.log(
          `Quiz ${quizId} cannot be published because it has no active questions.`
        );
        return null;
      }

      // Update the quiz status
      const result = await db.query(
        `UPDATE quizzes SET is_active = $1 WHERE id = $2 RETURNING *`,
        [isActive, quizId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating quiz status:', error);
      throw error;
    }
  }

  /**
   * Get active quizzes taken by a user in the past
   * @param {Number} userId - The ID of the user
   * @returns {Array} - List of active quizzes
   */
  async getUserActiveQuizzes(userId) {
    const result = await db.query(
      `SELECT q.* 
       FROM quizzes q
       JOIN (
         SELECT quiz_id
         FROM quiz_attempts
         WHERE user_id = $1
         GROUP BY quiz_id
       ) qa ON q.id = qa.quiz_id
       WHERE q.is_active = true`,
      [userId]
    );
    console.log(result.rows);
    return result.rows;
  }

  /**
   * Update quiz metadata (title and description)
   * @param {Number} quizId - The ID of the quiz
   * @param {String} title - The new title of the quiz
   * @param {String} description - The new description of the quiz
   * @returns {Object} - The updated quiz object
   */
  async updateQuiz(quizId, title, description) {
    console.log('QuizQueries.updateQuiz called with:', {
      quizId,
      title,
      description,
    });
    try {
      const result = await db.query(
        `UPDATE quizzes SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
        [title, description, quizId]
      );
      console.log('Quiz updated in database:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating quiz in database:', error);
      throw error;
    }
  }

  /**
   * Mark a question as deleted
   * @param {Number} questionId - The ID of the question
   * @returns {void}
   */
  async markQuestionAsDeleted(questionId) {
    console.log('QuizQueries.markQuestionAsDeleted called with:', {
      questionId,
    });
    try {
      await db.query(`UPDATE questions SET deleted = true WHERE id = $1`, [
        questionId,
      ]);
      console.log('Question marked as deleted in database:', questionId);
    } catch (error) {
      console.error('Error marking question as deleted:', error);
      throw error;
    }
  }

  /**
   * Update a question by marking the old one as deleted and inserting a new one
   * @param {Number} questionId - The ID of the existing question
   * @param {String} questionText - The text of the new question
   * @param {String} questionType - The type of the question
   * @param {Array} options - The options for the question, with `is_correct` flag
   * @returns {Object} - The updated question
   */
  async updateQuestion(questionId, questionText, questionType, options) {
    console.log('QuizQueries.updateQuestion called with:', {
      questionId,
      questionText,
      questionType,
      options,
    });

    const client = await db.pool.connect(); // Get a client from the connection pool

    try {
      await client.query('BEGIN'); // Start transaction

      // Mark the existing question as deleted
      await this.markQuestionAsDeleted(questionId, client);

      // Insert the new question
      const result = await client.query(
        `INSERT INTO questions (quiz_id, question_text, question_type, deleted) VALUES ((SELECT quiz_id FROM questions WHERE id = $1), $2, $3, false) RETURNING *`,
        [questionId, questionText, questionType]
      );
      const newQuestion = result.rows[0];
      console.log('New question inserted:', newQuestion);

      // Insert options for the new question
      for (const option of options) {
        await client.query(
          `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
          [newQuestion.id, option.option_text, option.is_correct]
        );
      }

      await client.query('COMMIT'); // Commit transaction
      console.log(
        'Transaction committed, question and options updated successfully.'
      );

      return newQuestion;
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaction on error
      console.error('Transaction rolled back due to error:', error);
      throw error;
    } finally {
      client.release(); // Release the client back to the pool
    }
  }

  // Get detailed responses for a quiz
  async getDetailedQuizResponses(quizId) {
    const query = `
    SELECT 
      q.question_text, 
      r.response_text AS user_response, 
      r.is_correct, 
      o.option_text AS correct_answer, 
      u.username
    FROM 
      responses r
    INNER JOIN 
      quiz_attempts a ON r.attempt_id = a.id
    INNER JOIN 
      questions q ON r.question_id = q.id
    INNER JOIN 
      options o ON q.id = o.question_id AND o.is_correct = true
    INNER JOIN 
      users u ON a.user_id = u.id
    WHERE 
      a.quiz_id = $1
    AND 
      a.attempt_date = (
        SELECT MAX(attempt_date)
        FROM quiz_attempts
        WHERE quiz_id = $1
        AND user_id = a.user_id
      )
  `;
    const result = await db.query(query, [quizId]);
    console.log('Quiz Responses Fetched:', result.rows); // Debug log
    return result.rows;
  }

  // Get detailed responses for a user
  async getDetailedUserResponses(userId) {
    const query = `
    SELECT 
      q.question_text, 
      r.response_text AS user_response, 
      r.is_correct, 
      o.option_text AS correct_answer, 
      qu.title AS quiz_title
    FROM 
      responses r
    INNER JOIN 
      quiz_attempts a ON r.attempt_id = a.id
    INNER JOIN 
      questions q ON r.question_id = q.id
    INNER JOIN 
      options o ON q.id = o.question_id AND o.is_correct = true
    INNER JOIN 
      quizzes qu ON a.quiz_id = qu.id
    WHERE 
      a.user_id = $1
    AND 
      a.attempt_date = (
        SELECT MAX(attempt_date)
        FROM quiz_attempts
        WHERE user_id = $1
        AND quiz_id = a.quiz_id
      )
  `;
    const result = await db.query(query, [userId]);
    console.log('User Responses Fetched:', result.rows); // Debug log
    return result.rows;
  }

  async getUnattemptedQuizzes(userId) {
    const query = `
      SELECT q.* 
      FROM quizzes q
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.user_id = $1
      WHERE q.is_active = true AND qa.id IS NULL;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }
}

module.exports = new QuizQueries();
