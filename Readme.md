# Assignment Management System

A web application that facilitates assignment management between students, tutors, and administrators.

## Getting Started

### Running with Docker

1. **Start the application:**
  ```bash
  docker-compose up -d
  ```

### Running without Docker

#### Backend Setup

1. Navigate to the backend directory:
  ```bash
  cd backend
  ```

2. Create a virtual environment:
  ```bash
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  ```

3. Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

4. Run the server:
  ```bash
  uvicorn main:app --reload
  ```

#### Frontend Setup

1. Navigate to the frontend directory:
  ```bash
  cd frontend
  ```

2. Install dependencies:
  ```bash
  npm install
  ```

3. Run the development server:
  ```bash
  npm start
  ```

## Authentication

- **POST /register** - Register a new user
- **POST /token** - Login and get access token
- **POST /logout** - Logout and clear session


## Test Users

- **Admin**
  - Email: `user@example.com`
  - Password: `string`

- **Student and Tutor**
  - You can sign up and create your own accounts.