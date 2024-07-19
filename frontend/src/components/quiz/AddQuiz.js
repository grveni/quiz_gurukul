import React, { useState } from 'react';
import { createQuiz } from '../../utils/QuizAPI';

const AddQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await createQuiz({ title, description });
      setMessage('Quiz created successfully!');
      setTitle('');
      setDescription('');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="add-quiz">
      <h2>Add Quiz</h2>
      <form onSubmit={handleCreateQuiz}>
        <div>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">Create Quiz</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AddQuiz;
