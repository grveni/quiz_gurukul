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
          await this.insertOptions(client, questionId, question.options);
        } else if (
          question.question_type === 'correct-order' ||
          question.question_type === 'match-pairs'
        ) {
          await this.insertOptionsGrid(
            client,
            questionId,
            question.options,
            question.question_type === 'correct-order'
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

  // Helper method to insert correct-order or match-pairs options
  async insertOptionsGrid(client, questionId, options, isCorrectOrder = false) {
    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (isCorrectOrder) {
        // For correct-order: store order number as left_option_text and option text as right_option_text
        await client.query(
          `INSERT INTO options_grid (question_id, left_option_text, right_option_text, left_option_uuid, right_option_uuid) 
         VALUES ($1, $2, $3, uuid_generate_v4(), uuid_generate_v4())`,
          [questionId, option.option_text, `${i + 1}`] // Order number, then actual text
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
      const result = await db.query(
        `
        SELECT 
          q.id AS question_id,
          q.question_text,
          q.question_type,
          q.created_at,
          q.updated_at,
          o.id AS option_id,
          o.option_text,
          o.option_uuid,
          og.left_option_text,
          og.left_option_uuid,
          og.right_option_text,
          og.right_option_uuid
        FROM 
          questions q
        LEFT JOIN 
          options o ON q.id = o.question_id
        LEFT JOIN 
          options_grid og ON q.id = og.question_id
        WHERE 
          q.quiz_id = $1 AND q.deleted = false
        ORDER BY 
          q.id, o.id, og.id;
      `,
        [quizId]
      );

      const questionsMap = new Map();
      result.rows.forEach((row) => {
        if (!questionsMap.has(row.question_id)) {
          questionsMap.set(row.question_id, {
            id: row.question_id,
            question_text: row.question_text,
            question_type: row.question_type,
            created_at: row.created_at,
            updated_at: row.updated_at,
            options: [],
          });
        }

        const question = questionsMap.get(row.question_id);

        if (row.option_id) {
          question.options.push({
            id: row.option_id,
            option_text: row.option_text,
            option_uuid: row.option_uuid,
          });
        }

        if (row.left_option_uuid) {
          question.options.push({
            left_option_uuid: row.left_option_uuid,
            left_option_text: row.left_option_text,
            right_option_uuid: row.right_option_uuid,
            right_option_text: row.right_option_text,
          });
        }
      });

      return Array.from(questionsMap.values());
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

      const totalQuestions = await this.getTotalQuestions(client, quizId);
      const quizAttemptId = await this.createQuizAttempt(
        client,
        studentId,
        quizId
      );

      // Handle empty submissions
      if (answers.length === 0) {
        console.warn(`User ${studentId} submitted an empty quiz.`);
        const percentage = 0; // No answers provided

        await this.updateQuizAttemptScore(client, quizAttemptId, 0, percentage);

        await client.query('COMMIT');
        return { quizAttemptId, score: 0, percentage };
      }
      let score = 0;

      for (const answer of answers) {
        const { questionId, questionType } = answer;
        let isCorrect = false;

        if (!questionId || !questionType) {
          console.log(`Skipping invalid answer:`, answer);
          continue;
        }

        switch (questionType) {
          case 'multiple-choice':
            if (answer.selectedOptions.length > 0) {
              isCorrect = await this.processMultipleChoice(
                client,
                quizAttemptId,
                questionId,
                answer.selectedOptions
              );
            }
            break;
          case 'true-false':
            if (answer.selectedOption) {
              isCorrect = await this.processTrueFalse(
                client,
                quizAttemptId,
                questionId,
                answer.selectedOption
              );
            }
            break;
          case 'text':
            if (answer.answerText.trim()) {
              isCorrect = await this.processText(
                client,
                quizAttemptId,
                questionId,
                answer
              );
            }
            break;
          case 'correct-order':
          case 'match-pairs':
            if (answer.optionPairs.length > 0) {
              isCorrect = await this.processOptionPairs(
                client,
                quizAttemptId,
                questionId,
                answer
              );
            }
            break;

          default:
            console.log(`Unknown question type: ${questionType}`);
            throw new Error(`Unknown question type: ${questionType}`);
        }

        if (isCorrect) score++;
      }

      const percentage = (score / totalQuestions) * 100;
      await this.updateQuizAttemptScore(
        client,
        quizAttemptId,
        score,
        percentage
      );

      await client.query('COMMIT');
      return { quizAttemptId, score, percentage };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during quiz submission:', error);
      throw new Error('Failed to submit quiz');
    } finally {
      client.release();
    }
  }

  // Fetch total number of questions for a quiz
  async getTotalQuestions(client, quizId) {
    const totalQuestionsResult = await client.query(
      `SELECT COUNT(*) as total_questions FROM questions WHERE quiz_id = $1`,
      [quizId]
    );
    return parseInt(totalQuestionsResult.rows[0].total_questions);
  }

  // Create a quiz attempt record in the DB
  async createQuizAttempt(client, studentId, quizId) {
    const quizAttemptResult = await client.query(
      `INSERT INTO quiz_attempts (user_id, quiz_id, score, percentage) VALUES ($1, $2, $3, $4) RETURNING *`,
      [studentId, quizId, 0, 0]
    );
    return quizAttemptResult.rows[0].id;
  }

  // Helper method to update the score and percentage of a quiz attempt
  async updateQuizAttemptScore(client, quizAttemptId, score, percentage) {
    await client.query(
      `UPDATE quiz_attempts SET score = $1, percentage = $2 WHERE id = $3`,
      [score, percentage, quizAttemptId]
    );
  }

  // Process methods updated for empty checks
  async processMultipleChoice(client, attemptId, questionId, selectedOptions) {
    let isCorrect = true; // Assume correct unless proven otherwise

    for (const optionUuid of selectedOptions) {
      const { rows } = await client.query(
        `INSERT INTO responses (attempt_id, question_id, option_uuid, is_correct) 
             SELECT $1, $2, option_uuid, is_correct FROM options WHERE option_uuid = $3
             RETURNING is_correct`,
        [attemptId, questionId, optionUuid]
      );

      // Check if any of the selected options are incorrect
      if (rows.length === 0 || rows[0].is_correct === false) {
        isCorrect = false;
      }
    }

    // Additional validation: ensure no correct options were missed
    const { rows: correctOptions } = await client.query(
      `SELECT COUNT(*) AS correct_count FROM options WHERE question_id = $1 AND is_correct = true`,
      [questionId]
    );

    if (Number(correctOptions[0].correct_count) !== selectedOptions.length) {
      isCorrect = false; // Mismatch between selected and correct options
    }

    return isCorrect; // Return true if all selected options match the correct options
  }

  async processTrueFalse(client, attemptId, questionId, selectedOption) {
    if (!selectedOption) return false; // No selection is incorrect by default

    const { rows } = await client.query(
      `INSERT INTO responses (attempt_id, question_id, option_uuid, is_correct) 
       SELECT $1, $2, option_uuid, is_correct FROM options WHERE option_uuid = $3
       RETURNING is_correct`,
      [attemptId, questionId, selectedOption]
    );

    // Return true if the selected option is correct
    return rows.length > 0 && rows[0].is_correct === true;
  }

  // Helper method to process text questions
  async processText(client, quizAttemptId, questionId, answer) {
    const correctAnswer = await client.query(
      `SELECT option_text FROM options WHERE question_id = $1 AND is_correct = true`,
      [questionId]
    );
    const isCorrect =
      correctAnswer.rows.length > 0 &&
      correctAnswer.rows[0].option_text === answer.answerText;

    await client.query(
      `INSERT INTO responses (attempt_id, question_id, response_text, is_correct) VALUES ($1, $2, $3, $4)`,
      [quizAttemptId, questionId, answer.answerText, isCorrect]
    );

    return isCorrect;
  }

  async processOptionPairs(client, quizAttemptId, questionId, answer) {
    console.log(`Processing pair validation for question ID: ${questionId}`);

    // Step 1: Fetch correct pairs from the database
    const correctPairs = await client.query(
      `SELECT left_option_uuid, right_option_uuid 
       FROM options_grid 
       WHERE question_id = $1`,
      [questionId]
    );

    if (correctPairs.rowCount === 0) {
      console.error(`No correct pairs found for question ID: ${questionId}`);
      return false;
    }

    const correctPairsMap = new Map();
    correctPairs.rows.forEach((pair) => {
      correctPairsMap.set(pair.left_option_uuid, pair.right_option_uuid);
    });

    // Step 2: Validate user response and insert into responses_grid
    let isQuestionCorrect = true;

    for (const userPair of answer.optionPairs) {
      console.log(userPair);
      const { leftUUID, rightUUID } = userPair;

      console.log('UUID : ', leftUUID, rightUUID);
      // Skip unanswered pairs
      if (!rightUUID || rightUUID.trim() === '') {
        console.warn(
          `Skipping unanswered pair for leftUUID=${leftUUID}. Marking question as incorrect.`
        );
        isQuestionCorrect = false; // Mark question incorrect if any pair is unanswered
        continue;
      }

      const correctRightUUID = correctPairsMap.get(leftUUID);

      const isCorrect = correctRightUUID === rightUUID;
      if (!isCorrect) {
        isQuestionCorrect = false; // At least one mismatch makes the question incorrect
      }

      // Insert each answered pair into the responses_grid table
      await client.query(
        `INSERT INTO responses_grid (attempt_id, question_id, left_option_uuid, right_option_uuid, is_correct) 
         VALUES ($1, $2, $3, $4, $5)`,
        [quizAttemptId, questionId, leftUUID, rightUUID, isCorrect]
      );

      console.log(
        `Processed pair: leftUUID=${leftUUID}, rightUUID=${rightUUID}, isCorrect=${isCorrect}`
      );
    }

    console.log(
      `Validation complete for question ID: ${questionId}, isQuestionCorrect=${isQuestionCorrect}`
    );
    return isQuestionCorrect;
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

  /**
   * Fetch the latest quiz attempt for a user
   * @param {Number} userId - The ID of the user
   * @param {Number} quizId - The ID of the quiz
   * @returns {Object|null} - Latest attempt details or null
   */
  async getLatestQuizAttempt(userId, quizId) {
    try {
      const query = `
      SELECT 
          id as attempt_id, 
          score, 
          percentage
      FROM 
          quiz_attempts
      WHERE 
          user_id = $1 AND quiz_id = $2
      ORDER BY 
          attempt_date DESC
      LIMIT 1;
    `;
      const result = await db.query(query, [userId, quizId]);

      if (result.rowCount === 0) {
        console.error(
          `No quiz attempts found for user ID: ${userId}, quiz ID: ${quizId}`
        );
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in getLatestQuizAttempt:', error.message);
      throw new Error('Failed to fetch latest quiz attempt');
    }
  }

  /**
   * Fetch responses for a specific quiz attempt
   * @param {Number} attemptId - The ID of the quiz attempt
   * @returns {Array|null} - Responses for the attempt or null
   */
  async getResponsesForAttempt(attemptId) {
    try {
      const query = `
      SELECT 
    q.id AS question_id,
    q.question_text,
    q.question_type,
    o.option_uuid AS option_id,
    o.option_text,
    o.is_correct AS correct_option, 
    r.option_uuid AS selected_option_uuid,
    r.response_text,
    r.is_correct AS response_correct,
    g.left_option_uuid,
    g.left_option_text,
    g.right_option_uuid,
    rg.right_option_uuid AS selected_right_option_uuid,
    rg.is_correct AS pair_response_correct,
    g2.right_option_text AS selected_right_option_text
FROM 
    questions q
LEFT JOIN 
    options o ON o.question_id = q.id
LEFT JOIN 
    responses r ON r.question_id = q.id 
                AND r.attempt_id = $1
                AND r.option_uuid = o.option_uuid -- Match response with the specific option
LEFT JOIN 
    options_grid g ON g.question_id = q.id
LEFT JOIN 
    responses_grid rg ON rg.question_id = q.id 
                      AND rg.attempt_id = $1 
                      AND rg.left_option_uuid = g.left_option_uuid
LEFT JOIN 
    options_grid g2 ON g2.right_option_uuid = rg.right_option_uuid
WHERE 
    q.quiz_id = (SELECT quiz_id FROM quiz_attempts WHERE id = $1)
ORDER BY 
    q.id, o.id, g.left_option_uuid;
      `;
      const result = await db.query(query, [attemptId]);

      if (result.rowCount === 0) {
        console.warn(`No responses found for attempt ID: ${attemptId}`);
        return [];
      }
      console.log(result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error in getResponsesForAttempt:', error.message);
      throw new Error('Failed to fetch responses for attempt');
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

  // Helper method to insert multiple-choice or true-false options
  async insertOptions(client, questionId, options) {
    for (const option of options) {
      await client.query(
        `INSERT INTO options (question_id, option_text, is_correct) VALUES ($1, $2, $3)`,
        [questionId, option.option_text, option.is_correct]
      );
    }
    console.log(
      `Inserted options for question ID ${questionId} into options table.`
    );
  }

  /*
   * clearExistingOptions:  clears existing options for the question from the options or options_grid table, depending on the questionType
   */
  async clearExistingOptions(client, questionId, questionType) {
    if (['multiple-choice', 'true-false', 'text'].includes(questionType)) {
      await client.query('DELETE FROM options WHERE question_id = $1', [
        questionId,
      ]);
      console.log(
        `Cleared existing options for question ID ${questionId} from options table.`
      );
    } else if (['correct-order', 'match-pairs'].includes(questionType)) {
      await client.query('DELETE FROM options_grid WHERE question_id = $1', [
        questionId,
      ]);
      console.log(
        `Cleared existing options for question ID ${questionId} from options_grid table.`
      );
    }
  }

  /*
   * updateQuestionTextAndType: updates the question’s text and type in the questions table.
   */
  async updateQuestionTextAndType(
    client,
    questionId,
    questionText,
    questionType
  ) {
    const updateQuestionQuery = `
      UPDATE questions 
      SET question_text = $1, question_type = $2, updated_at = NOW() 
      WHERE id = $3 RETURNING *`;
    const result = await client.query(updateQuestionQuery, [
      questionText,
      questionType,
      questionId,
    ]);
    const updatedQuestion = result.rows[0];
    console.log('Updated question:', updatedQuestion);
    return updatedQuestion;
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

    const client = await db.pool.connect();

    try {
      await client.query('BEGIN'); // Start transaction

      // Step 1: Update the question text and type
      const updatedQuestion = await this.updateQuestionTextAndType(
        client,
        questionId,
        questionText,
        questionType
      );

      // Step 2: Clear existing options for this question
      await this.clearExistingOptions(client, questionId, questionType);

      // Step 3: Insert new options based on question type
      if (['multiple-choice', 'true-false', 'text'].includes(questionType)) {
        await this.insertOptions(client, questionId, options);
      } else if (['correct-order', 'match-pairs'].includes(questionType)) {
        await this.insertOptionsGrid(
          client,
          questionId,
          options,
          questionType === 'correct-order'
        );
      }

      await client.query('COMMIT'); // Commit transaction
      console.log(
        'Transaction committed, question and options updated successfully.'
      );

      return updatedQuestion;
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback transaction on error
      console.error('Transaction rolled back due to error:', error);
      throw error;
    } finally {
      client.release();
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
