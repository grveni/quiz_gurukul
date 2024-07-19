import React, { useState, useEffect } from 'react';

const ConsolidatedReport = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Fetch consolidated reports from API
    setReports([
      { id: 1, username: 'Student 1', total_score: 170, average_score: 85 },
      { id: 2, username: 'Student 2', total_score: 180, average_score: 90 },
    ]);
  }, []);

  return (
    <div>
      <h2>Consolidated Reports</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Total Score</th>
            <th>Average Score</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.username}</td>
              <td>{report.total_score}</td>
              <td>{report.average_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsolidatedReport;
