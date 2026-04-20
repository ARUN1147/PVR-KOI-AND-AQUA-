const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, getInvoiceById } = require('../controllers/koiInvoiceController');

router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);

module.exports = router;
