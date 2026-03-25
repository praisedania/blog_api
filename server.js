require('dotenv').config();
const validateEnv = require('./src/utils/validateEnv');
validateEnv();

const db = require('./models')
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const app = express();

// Security and Performance Middleware
app.use(helmet());
app.use(compression());

// Dynamic CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

const postRoutes = require('./src/routes/postRoutes');
app.use('/api/v1/posts', postRoutes);
const commentRoutes = require('./src/routes/commentRoutes');
app.use('/api/v1/comments', commentRoutes);
const userRoutes = require('./src/routes/userRoutes');
app.use('/api/v1/users', userRoutes);
const searchRoutes = require('./src/routes/searchRoutes');
app.use('/api/v1/search', searchRoutes);
const likeRoutes = require('./src/routes/likeRoutes');
app.use('/api/v1/likes', likeRoutes);
const profileRoutes = require('./src/routes/profileRoutes');
app.use('/api/v1/profiles', profileRoutes);
const categoryRoutes = require('./src/routes/categoryRoutes');
app.use('/api/v1/categories', categoryRoutes);

const errorHandler = require('./src/middleware/errorHandler');

// Fallback for 404
app.all('*', (req, res, next) => {
  const AppError = require('./src/utils/appError');
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

// Remove automatic sync in favor of migrations
// db.sequelize.sync().then(() => {
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// });