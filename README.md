# Blog App API v1.0 🚀

A robust, secure, and versioned RESTful API for a modern blogging platform. This documentation is tailored for frontend developers to facilitate seamless integration.

## 🔗 Base URL
All requests must be prefixed with:
`http://localhost:3000/api/v1`

---

## 🛠️ Global Architecture
- **API Versioning**: Current version is `v1`.
- **Security**: Hardened with `helmet` and custom `cors`.
- **Performance**: Gzip `compression` enabled for all data transfers.
- **Data Integrity**: **Joi** schema validation on all POST/PUT/PATCH requests.
- **Error Handling**: Standardized JSON error response format.

---

## 📂 API Reference

### 🏷️ Category Management
Categories are now first-class entities. Every post MUST have a `categoryId`.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Get all available categories | Public |
| `POST` | `/categories` | Create a new category | Admin |
| `PUT` | `/categories/:id` | Update category name | Admin |
| `DELETE` | `/categories/:id` | Remove a category | Admin |

### 📝 Post Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | List all published posts | Public |
| `GET` | `/posts/:id` | Get individual post details | Public |
| `POST` | `/posts` | Create post (**req: title, content, categoryId**) | Author |
| `PUT` | `/posts/:id` | Update post content/status | Author |
| `DELETE` | `/posts/:id` | Permanently delete post | Author |
| `GET` | `/posts/admin` | Management view with status filters | Admin |

### 👤 User & Profile
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/signup-with-otp` | Start registration (OTP sent via email) | Public |
| `POST` | `/users/signup/verify` | Finalize setup with OTP code | Public |
| `POST` | `/users/emaillogin` | Standard email login | Public |
| `GET` | `/profiles/:userId` | Get profile bio & categories | Public |
| `PUT` | `/profiles/:userId` | Update bio & **categoryIds** array | Owner |
| `PUT` | `/profiles/:userId/password`| Secure password change | Owner |

### 🔍 Search & Discovery
| Method | Endpoint | Description |
| :--- | : :--- | :--- |
| `GET` | `/search/posts` | Filter by `q`, `categoryId`, or `author` |
| `GET` | `/search/users` | Find authors by `q` or `categoryId` |
| `GET` | `/search/trending` | Most liked posts in last 7 days |

### 💬 Social & Engagement
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/comments` | Add comment to a post |
| `GET` | `/comments/post/:postId`| Get all comments for a post |
| `POST` | `/likes/:postId/like` | Like a post (Authentication required) |

---

## 🔒 Authentication
Use **Bearer Token** for all protected endpoints.
`Authorization: Bearer <your_token>`

---

## ⚠️ Input Validation
All requests must adhere to these Joi validation rules:
- **Title**: 5-100 characters.
- **Content**: Minimum 10 characters.
- **Passwords**: Minimum 8 characters.
- **Usernames**: 3-30 alphanumeric characters.
- **CategoryIds**: Must be an array of integers (e.g., `[1, 3]`).

---

## 🚦 Error Response Format
```json
{
  "status": "fail",
  "message": "Detailed error message goes here"
}
```
*Note: In development mode, a complete stack trace is provided.*