require('dotenv').config();
const db = require('./models')
const express = require('express');
const app = express();

app.use(express.json());

const postRoutes = require('./src/routes/postRoutes');
app.use('/', postRoutes);

db.sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});