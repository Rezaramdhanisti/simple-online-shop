const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
// Get all products
router.get('/', productController.getAllProducts);

// Protected routes - require authentication
// Create a new product
router.post('/', protect, productController.createProduct);

module.exports = router;
