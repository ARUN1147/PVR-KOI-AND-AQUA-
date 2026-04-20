const express = require('express');
const router = express.Router();
const { getEnquiries, createEnquiry, updateEnquiryStatus, deleteEnquiry } = require('../controllers/koiEnquiryController');

router.get('/', getEnquiries);
router.post('/', createEnquiry);
router.patch('/:id/status', updateEnquiryStatus);
router.delete('/:id', deleteEnquiry);

module.exports = router;
