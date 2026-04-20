const express = require('express');
const router = express.Router();
const { getStock, addStock, updateStock, getLowStock } = require('../controllers/koiInventoryController');

router.get('/', getStock);
router.post('/', addStock);
router.patch('/:id', updateStock);
router.get('/low-stock', getLowStock);

module.exports = router;
