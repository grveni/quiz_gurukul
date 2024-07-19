
        
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    
        
      DROP TABLE IF EXISTS roles CASCADE;
      CREATE TABLE roles (
          id SERIAL PRIMARY KEY,
          role_name VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    
        
      DROP TABLE IF EXISTS user_roles CASCADE;
      CREATE TABLE user_roles (
          user_id INT NOT NULL,
          role_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, role_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      );
    
        
      DROP TABLE IF EXISTS quizzes CASCADE;
      CREATE TABLE quizzes (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          is_active BOOLEAN DEFAULT FALSE
      );
    
        
      DROP TABLE IF EXISTS questions CASCADE;
      CREATE TABLE questions (
          id SERIAL PRIMARY KEY,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL,
          correct_answer TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    
        
      DROP TABLE IF EXISTS options CASCADE;
      CREATE TABLE options (
          id SERIAL PRIMARY KEY,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          option_text TEXT NOT NULL,
          is_correct BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    
        
      DROP TABLE IF EXISTS quiz_attempts CASCADE;
      CREATE TABLE quiz_attempts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
          score INTEGER NOT NULL,
          attempt_date TIMESTAMPTZ DEFAULT NOW()
      );
    
        
      DROP TABLE IF EXISTS responses CASCADE;
      CREATE TABLE responses (
          id SERIAL PRIMARY KEY,
          attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
          question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
          response_text TEXT NOT NULL,
          is_correct BOOLEAN NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    
      