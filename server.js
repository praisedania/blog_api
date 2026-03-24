require('dotenv').config();
const db = require('./models')
const express = require('express');
const app = express();

app.use(express.json());

const postRoutes = require('./src/routes/postRoutes');
app.use('/', postRoutes);
const commentRoutes = require('./src/routes/commentRoutes');
app.use('/', commentRoutes);
const userRoutes = require('./src/routes/userRoutes');
app.use('/', userRoutes);
const searchRoutes = require('./src/routes/searchRoutes');
app.use('/search', searchRoutes);
const likeRoutes = require('./src/routes/likeRoutes');
app.use('/', likeRoutes);
const profileRoutes = require('./src/routes/profileRoutes');
app.use('/', profileRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});