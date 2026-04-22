const express = require('express');
const router = express.Router();
const { getPayments, createPayment, getPendingPayments } = require('../../controllers/Koi/koiPaymentController');

router.get('/', getPayments);
router.post('/', createPayment);
router.get('/pending', getPendingPayments);

module.exports = router;
