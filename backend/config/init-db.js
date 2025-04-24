const { sequelize } = require('./database');
const User = require('../models/User');
const { Product, ProductImage } = require('../models/Product');

// Initialize database
const initDb = async () => {
  try {
    // Create tables if they don't exist
    // Force: true will drop the table if it already exists
    // Use force: false for production
    await sequelize.sync({ force: false });
    console.log('Database tables have been initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = initDb;
