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
            <tr key={response.userId}>
              <td>{viewType === 'quiz' ? response.username : selectedQuiz}</td>
              <td>{response.score}</td>
              <td>{parseFloat(response.percentage).toFixed(2)}%</td>
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
