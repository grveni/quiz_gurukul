import React, { useEffect, useState } from 'react';
import './css/ResponsesDetailTable.css'; // Import the CSS

const DetailTable = ({ responses, questions }) => {
  const [questionsCollapsed, setQuestionsCollapsed] = useState(true);
  const [responsesCollapsed, setResponsesCollapsed] = useState({});

  useEffect(() => {
    // Initialize all response tables as collapsed
    const initialCollapsedState = {};
    responses.forEach((_, index) => {
      initialCollapsedState[index] = true;
    });
    setResponsesCollapsed(initialCollapsedState);
  }, [responses]);

  if (!responses || !questions) {
    return <p>No valid data available to display</p>;
  }

  // Helper function to map UUIDs to text
  const mapOptionUUIDToText = (question, uuid, side = 'right') => {
    const option =
      side === 'right'
        ? question.options.find(
            (opt) => opt.right_option_uuid === uuid || opt.option_uuid === uuid
          )
        : question.options.find((opt) => opt.left_option_uuid === uuid);
    return option
      ? side === 'right'
        ? option.right_option_text || option.option_text
        : option.left_option_text
      : 'Unknown';
  };

  // Render responses for each question type
  const renderUserResponse = (question, userResponses, responseGrid) => {
    if (question.question_type === 'match-pairs') {
      return responseGrid
        .filter((res) => res.question_id === question.id)
        .map((res, index) => (
          <div
            key={index}
            style={{
              color: res.is_correct ? 'green' : 'red',
            }}
          >
            {mapOptionUUIDToText(question, res.left_option_uuid, 'left')} →{' '}
            {mapOptionUUIDToText(question, res.right_option_uuid, 'right')}{' '}
            {res.is_correct ? '✅' : '❌'}
          </div>
        ));
    }

    if (question.question_type === 'correct-order') {
      return responseGrid
        .filter((res) => res.question_id === question.id)
        .map((res, index) => (
          <div
            key={index}
            style={{
              color: res.is_correct ? 'green' : 'red',
            }}
          >
            {mapOptionUUIDToText(question, res.right_option_uuid)}{' '}
            {res.is_correct ? '✅' : '❌'}
          </div>
        ));
    }

    // Default case for text, MCQ, and true/false
    return userResponses.map((res, index) => (
      <div
        key={index}
        style={{
          color: res.is_correct ? 'green' : 'red',
        }}
      >
        {question.question_type === 'text'
          ? res.response_text
          : mapOptionUUIDToText(question, res.option_uuid)}
        {res.is_correct ? ' ✅' : ' ❌'}
      </div>
    ));
  };

  return (
    <div className="detail-table-container">
      {/* Questions Table */}
      <h5
        onClick={() => setQuestionsCollapsed(!questionsCollapsed)}
        style={{
          cursor: 'pointer',
          backgroundColor: '#f1f1f1',
          padding: '10px',
        }}
      >
        Questions {questionsCollapsed ? '(Show)' : '(Hide)'}
      </h5>
      {!questionsCollapsed && (
        <table className="questions-table">
          <thead>
            <tr>
              <th>Question No.</th>
              <th>Question Text</th>
              <th>Type of Question</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, questionIndex) => (
              <tr key={question.id}>
                <td>{questionIndex + 1}</td>
                <td>{question.question_text}</td>
                <td>{question.question_type.replace('-', ' ')}</td>
                <td>
                  {question.question_type === 'match-pairs'
                    ? question.options.map((opt, index) => (
                        <div key={index}>
                          {opt.left_option_text} → {opt.right_option_text}
                        </div>
                      ))
                    : question.question_type === 'correct-order'
                    ? question.options
                        .sort((a, b) => a.left_option_text - b.left_option_text)
                        .map((opt, index) => (
                          <div key={index}>{opt.right_option_text}</div>
                        ))
                    : question.options.map((opt) => (
                        <div
                          key={opt.id}
                          style={{
                            color: opt.isCorrect ? 'green' : 'black',
                          }}
                        >
                          {opt.option_text}
                          {opt.isCorrect && ' ✅'}
                        </div>
                      ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Responses Table */}
      <h5>User Responses</h5>
      {responses.map((response, responseIndex) => (
        <div
          key={`${response.user.id}-${responseIndex}`}
          className="response-container"
        >
          <h5
            onClick={() =>
              setResponsesCollapsed((prevState) => ({
                ...prevState,
                [responseIndex]: !prevState[responseIndex],
              }))
            }
            style={{
              cursor: 'pointer',
              backgroundColor: '#f1f1f1',
              padding: '10px',
            }}
          >
            {response.user.username} | Score: {response.attempt.score} |
            Percentage: {parseFloat(response.attempt.percentage).toFixed(2)}%
            {responsesCollapsed[responseIndex] ? ' (Show)' : ' (Hide)'}
          </h5>
          {!responsesCollapsed[responseIndex] && (
            <table className="responses-table">
              <thead>
                <tr>
                  <th>Question No.</th>
                  <th>User's Response</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question, questionIndex) => {
                  const userResponses = response.responses.filter(
                    (res) => res.question_id === question.id
                  );
                  const responseGrid = response.responses_grid.filter(
                    (res) => res.question_id === question.id
                  );

                  return (
                    <tr key={question.id}>
                      <td>{questionIndex + 1}</td>
                      <td>
                        {renderUserResponse(
                          question,
                          userResponses,
                          responseGrid
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default DetailTable;
