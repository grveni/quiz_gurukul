import React from 'react';

const DropdownComponent = ({
  selectedQuiz,
  selectedUser,
  selectedResponseType,
  quizzes,
  users,
  handleQuizSelect,
  handleUserSelect,
  handleResponseTypeSelect,
}) => {
  return (
    <div className="selection-container">
      <label>Select Quiz:</label>
      <select
        value={selectedQuiz}
        onChange={(e) => handleQuizSelect(e.target.value)}
        disabled={!!selectedUser}
      >
        <option value="">Select Quiz</option>
        {quizzes.map((quiz) => (
          <option key={quiz.id} value={quiz.id}>
            {quiz.title}
          </option>
        ))}
      </select>

      <label>Select User:</label>
      <select
        value={selectedUser}
        onChange={(e) => handleUserSelect(e.target.value)}
        disabled={!!selectedQuiz}
      >
        <option value="">Select User</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.username}
          </option>
        ))}
      </select>

      <label>Select Response Type:</label>
      <select value={selectedResponseType} onChange={handleResponseTypeSelect}>
        <option value="summary">Summary</option>
        <option value="detail">Detail</option>
      </select>
    </div>
  );
};

export default DropdownComponent;
