const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders
router.get('/', orderController.getAllOrders);

// Get single order by ID
router.get('/:id', orderController.getOrderById);

// Create a new order
router.post('/', orderController.createOrder);

// Update an order status
router.put('/:id/status', orderController.updateOrderStatus);

// Get user orders
router.get('/user/:userId', orderController.getUserOrders);

module.exports = router;
