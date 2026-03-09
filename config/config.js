require('dotenv').config();
module.exports = {
  development: {
     username: process.env.database_username,
    password: process.env.database_password,
    database: process.env.database_name,
    host: process.env.database_host,
    dialect: 'mysql'
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql"
  }
};