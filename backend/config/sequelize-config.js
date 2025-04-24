require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'shopuser',
    password: process.env.DB_PASSWORD || 'shoppassword',
    database: process.env.DB_NAME || 'simple_online_shop',
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  test: {
    username: process.env.DB_USER || 'shopuser',
    password: process.env.DB_PASSWORD || 'shoppassword',
    database: process.env.DB_NAME || 'simple_online_shop_test',
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    }
  }
};
