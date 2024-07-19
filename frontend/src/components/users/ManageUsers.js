import React, { useState, useEffect } from 'react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from API
    setUsers([
      {
        id: 1,
        username: 'Student 1',
        email: 'student1@example.com',
        status: 'active',
      },
      {
        id: 2,
        username: 'Student 2',
        email: 'student2@example.com',
        status: 'inactive',
      },
    ]);
  }, []);

  const handleDelete = (id) => {
    // Call API to delete user
  };

  const handleDeactivate = (id) => {
    // Call API to deactivate user
  };

  const handleUpdate = (id) => {
    // Navigate to user update form
  };

  return (
    <div>
      <h2>Manage Users</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td>
                <button onClick={() => handleUpdate(user.id)}>Update</button>
                <button onClick={() => handleDeactivate(user.id)}>
                  Deactivate
                </button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
