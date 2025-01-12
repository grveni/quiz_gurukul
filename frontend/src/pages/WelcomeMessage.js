import React from 'react';

const WelcomeMessage = ({ userName }) => {
  return (
    <div className="welcome-message">
      <h2>Welcome, {userName || 'Student'}!</h2>
      <p>Here’s what you can do on this platform:</p>
      <ul>
        <li>
          <strong>Profile:</strong> Keep your profile updated with the latest
          information.
        </li>
        <li>
          <strong>Quizzes:</strong> View your quiz attempts and take new quizzes
          to improve your knowledge.
        </li>
        <li>
          <strong>Support:</strong> For any further queries or help, please
          contact the admin at
          <strong> +91-9811406988</strong>.
        </li>
      </ul>
    </div>
  );
};

export default WelcomeMessage;
