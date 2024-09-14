import React from 'react';

const SummaryTable = ({ responses, viewType, selectedQuiz, selectedUser }) => {
  return (
    <div>
      <h3>
        Summary Responses for{' '}
        {viewType === 'quiz'
          ? `Quiz: ${selectedQuiz}`
          : `User: ${selectedUser}`}
      </h3>
      <table className="view-responses-table">
        <thead>
          <tr>
            <th>{viewType === 'quiz' ? 'User Name' : 'Quiz Title'}</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>View Detail</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr key={response.id}>
              <td>
                {viewType === 'quiz' ? response.username : response.quizTitle}
              </td>
              <td>{response.score}</td>
              <td>{response.percentage}%</td>
              <td>
                <button className="view-detail-button">View Detail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
