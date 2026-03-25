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

### Base URL
All API requests must be prefixed with:
`http://localhost:3000/api/v1`

---

### Global Features
- **Security**: Hardened with `helmet` and custom `cors` (dynamic origins).
- **Performance**: Gzip `compression` enabled for all data transfers.
- **Data Integrity**: **Joi** schema validation on all POST/PUT/PATCH requests.
- **Error Handling**: Standardized JSON error response format.

---

### Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### User Endpoints

#### Register User
- **POST** `/api/v1/users/signup`
- **Body**:
  ```json
  {
    "userName": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user",
    "categoryIds": [1, 2] 
  }
  ```
- **Response**: User object

#### Register with OTP Verification
- **POST** `/api/v1/users/signup-with-otp`
- **Body**:
  ```json
  {
    "userName": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "role": "author",
    "categoryIds": [1, 3]
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
- **POST** `/api/v1/users/signup/verify`
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
- **POST** `/api/v1/users/emaillogin`
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
    "user": { "email": "john@example.com", "userName": "johndoe", "id": 1 }
  }
  ```

#### Login with Username
- **POST** `/api/v1/users/usernamelogin`
- **Response**: Same as email login

#### User Management
- **GET** `/api/v1/users` | **GET** `/api/v1/users/:id` | **PUT** `/api/v1/users/:id` | **DELETE** `/api/v1/users/:id`
- **Auth**: Required

### Post Endpoints

#### Create Post
- **POST** `/api/v1/posts`
- **Auth**: Required (Author role)
- **Body**:
  ```json
  {
    "title": "My Blog Post",
    "content": "This is the content of my blog post.",
    "categoryId": 1
  }
  ```
- **Response**: Created post object

#### Post Lifecycle
- **GET** `/api/v1/posts` | **GET** `/api/v1/posts/:id` | **PUT** `/api/v1/posts/:id` | **DELETE** `/api/v1/posts/:id`
- **Note**: `PUT` requires `categoryId`. Use `PATCH` for partial updates.

### Admin Endpoints (Requires Admin Role)
- **GET** `/api/v1/users/admin` - List all users
- **PUT** `/api/v1/users/admin/:userId/role` - Change user role
- **POST** `/api/v1/users/admin/:userId/suspend` - Suspend a user
- **GET** `/api/v1/posts/admin` - Manage posts
- **GET** `/api/v1/users/admin/stats` - Global statistics

### Post Engagement Endpoints
- **POST** `/api/v1/likes/:postId/like` | **DELETE** `/api/v1/likes/:postId/like` - Like/Unlike
- **GET** `/api/v1/likes/:postId/likes` - Get likes
- **POST** `/api/v1/comments` - Add comment
- **GET** `/api/v1/comments/post/:postId` - Get comments
- **DELETE** `/api/v1/comments/:id` - Delete comment

### Search & Profiles Endpoints
- **GET** `/api/v1/search/posts?q=query` - Filter by `q`, `categoryId`, `author`
- **GET** `/api/v1/search/users?q=query` - Filter by `q`, `categoryId`
- **GET** `/api/v1/profiles/:userId` - Get profile & categories
- **PUT** `/api/v1/profiles/:userId` - Update bio & **categoryIds**

### Category Management
- **GET** `/api/v1/categories` - List categories (Public)
- **POST** `/api/v1/categories` - Create category (Admin)
- **PUT** `/api/v1/categories/:id` - Update category (Admin)
- **DELETE** `/api/v1/categories/:id` - Delete category (Admin)

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
- `400`: Bad Request (Check `status: "fail"` for validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Input Validation (Joi)
All requests must adhere to these rules:
- **Title**: 5-100 characters.
- **Content**: Minimum 10 characters.
- **Passwords**: Minimum 8 characters.
- **Usernames**: 3-30 alphanumeric characters.
- **categoryIds**: Array of integers (e.g., `[1, 5]`).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (if any)
5. Submit a pull request

## License

This project is licensed under the ISC License.