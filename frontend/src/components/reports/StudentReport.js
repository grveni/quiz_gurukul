import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const StudentReport = () => {
  const { id } = useParams();
  const [student, setStudent] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);

  useEffect(() => {
    // Fetch student details and quiz attempts from API
    setStudent({ id: 1, username: 'Student 1', email: 'student1@example.com' });
    setQuizAttempts([
      { id: 1, quiz_title: 'Quiz 1', score: 80, attempt_date: '2024-07-14' },
      { id: 2, quiz_title: 'Quiz 2', score: 90, attempt_date: '2024-07-15' },
    ]);
  }, [id]);

  return (
    <div>
      <h2>{student.username}'s Report</h2>
      <p>Email: {student.email}</p>
      <h3>Quiz Attempts</h3>
      <table>
        <thead>
          <tr>
            <th>Quiz Title</th>
            <th>Score</th>
            <th>Attempt Date</th>
          </tr>
        </thead>
        <tbody>
          {quizAttempts.map((attempt) => (
            <tr key={attempt.id}>
              <td>{attempt.quiz_title}</td>
              <td>{attempt.score}</td>
              <td>{attempt.attempt_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentReport;
