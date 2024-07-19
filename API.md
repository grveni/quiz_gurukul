### API Documentation

This document provides the details of the API endpoints available in the application. Each endpoint includes the request method, URL, parameters, request body, and example responses.

## Authentication

### Register

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "role_id": "integer"
  }
  ```
- **Response**:
  - **Success**: `201 Created`
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": 1,
        "username": "exampleUser",
        "email": "example@example.com",
        "role_name": "student"
      }
    }
    ```
  - **Error**: `400 Bad Request`
    ```json
    {
      "errors": [
        {
          "msg": "Error message",
          "path": "field"
        }
      ]
    }
    ```

### Login

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "token": "JWT token"
    }
    ```
  - **Error**: `401 Unauthorized`
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

### Fetch Roles

- **URL**: `/api/auth/roles`
- **Method**: `GET`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "roles": [
        {
          "id": 1,
          "role_name": "admin"
        },
        {
          "id": 2,
          "role_name": "student"
        }
      ]
    }
    ```
  - **Error**: `500 Internal Server Error`
    ```json
    {
      "message": "Failed to fetch roles"
    }
    ```

## Quizzes

### List All Quizzes with Pagination

- **URL**: `/api/quizzes/listAllPagination`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "quizzes": [
        {
          "id": 1,
          "title": "Quiz Title",
          "description": "Quiz Description",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "pages": 10
      }
    }
    ```
  - **Error**: `401 Unauthorized`
    ```json
    {
      "message": "Unauthorized"
    }
    ```

### Create a Quiz

- **URL**: `/api/quizzes/addQuiz`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Response**:
  - **Success**: `201 Created`
    ```json
    {
      "quiz": {
        "id": 1,
        "title": "Quiz Title",
        "description": "Quiz Description",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    }
    ```
  - **Error**: `400 Bad Request`
    ```json
    {
      "errors": [
        {
          "msg": "Error message",
          "path": "field"
        }
      ]
    }
    ```

### Get Quiz Details

- **URL**: `/api/quizzes/:quizId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "quiz": {
        "id": 1,
        "title": "Quiz Title",
        "description": "Quiz Description",
        "questions": [
          {
            "id": 1,
            "question_text": "Question text",
            "question_type": "multiple-choice",
            "options": [
              {
                "id": 1,
                "option_text": "Option text",
                "is_correct": true
              }
            ]
          }
        ],
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    }
    ```
  - **Error**: `404 Not Found`
    ```json
    {
      "message": "Quiz not found"
    }
    ```

### List Available Quizzes for Students

- **URL**: `/api/quizzes/available`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "quizzes": [
        {
          "id": 1,
          "title": "Quiz Title",
          "description": "Quiz Description",
          "created_at": "timestamp",
          "updated_at": "timestamp"
        }
      ]
    }
    ```
  - **Error**: `401 Unauthorized`
    ```json
    {
      "message": "Unauthorized"
    }
    ```

### Get Quiz for Taking

- **URL**: `/api/quizzes/:quizId/take`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "quiz": {
        "id": 1,
        "title": "Quiz Title",
        "description": "Quiz Description",
        "questions": [
          {
            "id": 1,
            "question_text": "Question text",
            "question_type": "multiple-choice",
            "options": [
              {
                "id": 1,
                "option_text": "Option text",
                "is_correct": true
              }
            ]
          }
        ],
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    }
    ```
  - **Error**: `404 Not Found`
    ```json
    {
      "message": "Quiz not found"
    }
    ```

### Submit Quiz Answers

- **URL**: `/api/quizzes/:quizId/submit`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT token>`, `Content-Type: application/json`
- **Body**:
  ```json
  {
    "quizId": 1,
    "answers": [
      {
        "questionId": 1,
        "answerText": "Answer text"
      }
    ]
  }
  ```
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "quizAttemptId": 1,
      "score": 5,
      "quizResults": [
        {
          "id": 1,
          "question_text": "Question text",
          "question_type": "multiple-choice",
          "options": [
            {
              "id": 1,
              "option_text": "Option text",
              "is_correct": true
            }
          ],
          "user_response": "Answer text",
          "response_correct": true
        }
      ],
      "percentageScore": "50.0"
    }
    ```
  - **Error**: `400 Bad Request`
    ```json
    {
      "message": "Failed to submit quiz"
    }
    ```

### Get Quiz Results

- **URL**: `/api/quizzes/:quizId/results`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "score": 5,
      "percentScore": "50.0",
      "questions": [
        {
          "id": 1,
          "question_text": "Question text",
          "question_type": "multiple-choice",
          "options": [
            {
              "id": 1,
              "option_text": "Option text",
              "is_correct": true
            }
          ],
          "user_response": "Answer text",
          "response_correct": true
        }
      ]
    }
    ```
  - **Error**: `404 Not Found`
    ```json
    {
      "message": "No results found"
    }
    ```

### Get Next Untaken Active Quiz for Student

- **URL**: `/api/quizzes/student/next`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "quiz": {
        "id": 1,
        "title": "Quiz Title",
        "description": "Quiz Description",
        "questions": [
          {
            "id": 1,
            "question_text": "Question text",
            "question_type": "multiple-choice",
            "options": [
              {
                "id": 1,
                "

option_text": "Option text",
                "is_correct": true
              }
            ]
          }
        ],
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    }
    ```
  - **Error**: `404 Not Found`
    ```json
    {
      "message": "No available quizzes"
    }
    ```

### List All Quizzes Taken by Student

- **URL**: `/api/quizzes/students/quizzes`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "quizzes": [
        {
          "quizId": 1,
          "title": "Quiz Title",
          "score": 5,
          "attemptDate": "timestamp"
        }
      ]
    }
    ```
  - **Error**: `401 Unauthorized`
    ```json
    {
      "message": "Unauthorized"
    }
    ```

### Get Results of All Quizzes Taken by Student

- **URL**: `/api/quizzes/students/quizzes/:quizId/results`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT token>`
- **Response**:
  - **Success**: `200 OK`
    ```json
    {
      "score": 5,
      "percentScore": "50.0",
      "questions": [
        {
          "id": 1,
          "question_text": "Question text",
          "question_type": "multiple-choice",
          "options": [
            {
              "id": 1,
              "option_text": "Option text",
              "is_correct": true
            }
          ],
          "user_response": "Answer text",
          "response_correct": true
        }
      ]
    }
    ```
  - **Error**: `404 Not Found`
    ```json
    {
      "message": "No results found"
    }
    ```
