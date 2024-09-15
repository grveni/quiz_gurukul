import React from 'react';
import './css/ResponsesDetailTable.css'; // Import the CSS

const DetailTable = ({ responses, viewType, selectedQuizTitle }) => {
  if (viewType === 'quiz') {
    // Extract all unique questions from the first user's response to create the structure
    const questions = responses[0]?.quizResponses.map((resp) => ({
      questionText: resp.questionText,
      correctAnswer: resp.correctAnswer,
    }));

    return (
      <div>
        <h3>Detailed Responses for Quiz: {selectedQuizTitle}</h3>

        <div className="detail-responses-table-wrapper">
          <table className="detail-responses-table">
            <thead>
              <tr>
                <th>User</th>
                {questions &&
                  questions.slice(0, 6).map(
                    (
                      question,
                      idx // Limit to show 6 questions initially
                    ) => (
                      <th
                        key={idx}
                        data-tooltip={question.questionText} // Tooltip with full question
                      >
                        {question.questionText.substring(0, 30)}...{' '}
                        {/* Show first 30 characters */}
                      </th>
                    )
                  )}
              </tr>
            </thead>
            <tbody>
              {/* Correct Answer Row */}
              <tr>
                <td className="correct-answer-row">Correct Answer</td>
                {questions &&
                  questions.slice(0, 6).map(
                    (
                      question,
                      idx // Limit to show 6 questions initially
                    ) => (
                      <td key={idx} className="correct-answer-cell">
                        {question.correctAnswer}
                      </td>
                    )
                  )}
              </tr>

              {/* User Responses Rows */}
              {responses.map((response, idx) => (
                <tr key={idx}>
                  <td>{response.username}</td>
                  {response.quizResponses.slice(0, 6).map(
                    (
                      resp,
                      i // Limit to show 6 questions initially
                    ) => (
                      <td
                        key={i}
                        className={resp.isCorrect ? 'correct' : 'incorrect'}
                        data-tooltip={resp.userResponse}
                      >
                        {resp.userResponse}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4>No responses available</h4>
    </div>
  );
};

export default DetailTable;
