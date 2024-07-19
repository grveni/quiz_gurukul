# Quiz Management System

## Overview

The Quiz Management System is a web application designed to facilitate the creation, management, and participation in quizzes. It includes functionalities for both administrators and students, allowing for seamless interaction and management of quizzes, questions, and user performance.

## Features

### Implemented Features

#### Admin Dashboard
- **Create Quiz:** Administrators can create new quizzes with titles and descriptions.
- **Add Questions:** Ability to add different types of questions (multiple-choice, true-false, text) to quizzes.
- **Manage Quizzes:** View and manage the list of quizzes.


#### Student Dashboard
- **Take Quiz:** Students can participate in quizzes assigned to them.
- **View Results:** Students can see the results of quizzes they have taken.

### Future Plans

**####Admin Dashboard**
- **View Quiz Details:** Detailed view of each quiz, including its questions and options.
- **Manage Users:** Ability to manage users who are part of the system.
- **Student Reports:** View individual student performance on quizzes.
- **Consolidated Reports:** View overall performance metrics across quizzes.

**####User Dashboard**

- **View Profile:** Students can view their profiles and related information.
 
- **Enhanced User Management:** Implement role-based access control and more granular user permissions.
- **Question Banks:** Create a repository of reusable questions.
- **Quiz Analytics:** Provide detailed analytics on quiz performance for administrators.
- **Notifications:** Implement a notification system for quiz deadlines and results.
- **Mobile App:** Develop a mobile application for both Android and iOS platforms.
  

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-repo/quiz-management-system.git
   cd quiz-management-system
   ```

2. **Backend Setup:**
   - Navigate to the backend directory:
     ```bash
     cd core
     ```
   - Install backend dependencies:
     ```bash
     npm install
     ```
   - Set up environment variables:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` file with your database configuration and other settings.
   
   - Start the backend server:
     ```bash
     npm start
     ```

3. **Frontend Setup:**
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```
   - Start the frontend development server:
     ```bash
     npm start
     ```

4. **Access the Application:**
   - Open your browser and navigate to `http://localhost:3000` for the frontend.
   - The backend will be running on `http://localhost:5000` (or the port you specified).
  
5. **Documentation**

   - [API Documentation](./API.md)

## Contribution Guidelines

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.


For any questions or issues, please contact [veni.prof@gmail.com].



