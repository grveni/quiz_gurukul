import React, { useState, useEffect } from 'react';

const StudentList = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Fetch students from API
    setStudents([
      { id: 1, username: 'Student 1', email: 'student1@example.com' },
      { id: 2, username: 'Student 2', email: 'student2@example.com' },
    ]);
  }, []);

  return (
    <div>
      <h2>All Students</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.username}</td>
              <td>{student.email}</td>
              <td>
                <button>View Report</button>
                <button>Update</button>
                <button>Deactivate</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
