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

        <table className="detail-responses-table">
          <thead>
            <tr>
              <th>User</th>
              {questions &&
                questions.map((question, idx) => (
                  <th
                    key={idx}
                    data-tooltip={question.questionText} // Tooltip with full question
                  >
                    {question.questionText.substring(0, 25)}...{' '}
                    {/* Show first 25 characters */}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {/* Correct Answer Row */}
            <tr>
              <td className="correct-answer-row">Correct Answer</td>
              {questions &&
                questions.map((question, idx) => (
                  <td key={idx} className="correct-answer-cell">
                    {question.correctAnswer}
                  </td>
                ))}
            </tr>

            {/* User Responses Rows */}
            {responses.map((response, idx) => (
              <tr key={idx}>
                <td>{response.username}</td>
                {response.quizResponses.map((resp, i) => (
                  <td
                    key={i}
                    className={resp.isCorrect ? 'correct' : 'incorrect'}
                    data-tooltip={resp.userResponse}
                  >
                    {resp.userResponse}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
