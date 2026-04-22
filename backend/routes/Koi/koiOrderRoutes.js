const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, updateOrder, deleteOrder } = require('../../controllers/Koi/koiOrderController');

router.get('/', getOrders);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

module.exports = router;
