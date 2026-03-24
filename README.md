# Blog App API

A RESTful API for a blog application built with Node.js, Express, and Sequelize ORM. It supports user authentication, OTP verification, CRUD operations for blog posts, as well as profiles, comments, likes, searching, and admin features.

## Features

- User registration, login, and profile management
- OTP-based signup and Password Reset flows
- JWT-based authentication
- Create, read, update, and delete blog posts
- Post Engagement: Add comments and like posts
- Search & Pagination: Find posts and users seamlessly
- Admin Roles: User suspension, role assignment, and post moderation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email Service**: Resend for OTP emails

## Project Structure

```
blog_app/
├── config/
│   └── config.js          # Database configuration
├── migrations/            # Sequelize migrations
├── models/                # Sequelize models (User, Post, Comment, Like)
├── seeders/               # Database seeders
├── src/
│   ├── controllers/       # Route controllers (auth, profiles, comments, likes, search, admin)
│   ├── middleware/        # Middlewares (auth, tokenValidator)
│   └── routes/            # API routes (user, post, comment, like, profile, search)
├── package.json
├── server.js              # Main application entry point
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd blog_app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@yourdomain.com
   DATABASE_USERNAME=your_mysql_username
   DATABASE_PASSWORD=your_mysql_password
   DATABASE_NAME=blog_app_db
   DATABASE_HOST=localhost
   ```

4. Set up the database:
   - Create a MySQL database named `blog_app_db`
   - Run migrations:
     ```bash
     npx sequelize-cli db:migrate
     ```
   - (Optional) Run seeders:
     ```bash
     npx sequelize-cli db:seed:all
     ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`.

## API Documentation

### Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### User Endpoints

#### Register User
- **POST** `/api/users/signup`
- **Body**:
  ```json
  {
    "userName": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object

#### Register with OTP Verification
- **POST** `/api/users/signup-with-otp`
- **Body**:
  ```json
  {
    "userName": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User created. A verification code was sent to your email.",
    "userId": 1
  }
  ```

#### Verify OTP
- **POST** `/api/users/signup/verify`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User verified successfully."
  }
  ```

#### Login with Email
- **POST** `/api/users/emaillogin`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "email": "john@example.com",
      "userName": "johndoe",
      "id": 1,
      "createdAt": "2023-03-16T...",
      "updatedAt": "2023-03-16T..."
    }
  }
  ```

#### Login with Username
- **POST** `/api/users/usernamelogin`
- **Body**:
  ```json
  {
    "userName": "johndoe",
    "password": "password123"
  }
  ```
- **Response**: Same as email login

#### Get All Users
- **GET** `/api/users`
- **Auth**: Required
- **Response**: Array of user objects

#### Get User by ID
- **GET** `/api/users/:id`
- **Auth**: Required
- **Response**: User object

#### Update User
- **PUT** `/api/users/:id`
- **Auth**: Required
- **Body**: User fields to update
- **Response**: Updated user object

#### Patch User
- **PATCH** `/api/users/:id`
- **Auth**: Required
- **Body**: Partial user fields
- **Response**: Updated user object

#### Delete User
- **DELETE** `/api/users/:id`
- **Auth**: Required
- **Response**:
  ```json
  {
    "message": "User deleted successfully."
  }
  ```

### Post Endpoints

#### Create Post
- **POST** `/api/posts`
- **Auth**: Required
- **Body**:
  ```json
  {
    "title": "My Blog Post",
    "content": "This is the content of my blog post."
  }
  ```
- **Response**: Created post object

#### Get All Posts
- **GET** `/api/posts`
- **Response**: Array of post objects

#### Get Post by ID
- **GET** `/api/posts/:id`
- **Auth**: Required
- **Response**: Post object

#### Update Post
- **PUT** `/api/posts/:id`
- **Auth**: Required (user must own the post)
- **Body**: Post fields to update
- **Response**: Updated post object

#### Patch Post
- **PATCH** `/api/posts/:id`
- **Auth**: Required (user must own the post)
- **Body**: Partial post fields
- **Response**: Updated post object

#### Delete Post
- **DELETE** `/api/posts/:id`
- **Auth**: Required (user must own the post)
- **Response**:
  ```json
  {
    "message": "Post deleted successfully."
  }
  ```

### Admin Endpoints (Requires Admin Role)
- **GET** `/api/admin/users` - List all users
- **PUT** `/api/admin/users/:userId/role` - Change user role
- **POST** `/api/admin/users/:userId/suspend` - Suspend a user
- **POST** `/api/admin/users/:userId/unsuspend` - Unsuspend a user
- **GET** `/api/admin/stats` - Fetch global app statistics

### Post Engagement Endpoints
- **POST** `/:postId/like` | **DELETE** `/:postId/like` - Like/Unlike a post
- **GET** `/:postId/likes` - Get likes for a post
- **POST** `/:postId/comments` - Add a comment
- **GET** `/:postId/comments` - Get comments for a post
- **DELETE** `/comments/:commentId` - Delete a comment

### Search & Profiles Endpoints
- **GET** `/search?q=query` - Global search for posts and users
- **GET** `/profile/:userId` - Get user profile details

## Database Schema

### Users Table
- `id` (Primary Key, Auto Increment)
- `userName` (String, Not Null)
- `email` (String, Not Null)
- `password` (String, Not Null, Hashed)
- `isVerified` (Boolean, Default: false)
- `role` (String, Default: 'user')
- `isSuspended` (Boolean, Default: false)
- Profile details (bio, avatar, reset tokens, etc.)

### Posts Table
- `id` (Primary Key, Auto Increment)
- `title`, `content`, `author`
- `userId` (Integer, Foreign Key to Users.id)
- `isModerated` (Boolean, Default: false)

### Comments & Likes Tables
- `Comment`: `id`, `content`, `userId`, `postId`
- `Like`: `id`, `userId`, `postId`

## Error Handling

The API returns appropriate HTTP status codes and error messages in JSON format:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (if any)
5. Submit a pull request

## License

This project is licensed under the ISC License.