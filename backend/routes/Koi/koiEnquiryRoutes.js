const express = require('express');
const router = express.Router();
const { getEnquiries, createEnquiry, updateEnquiryStatus, deleteEnquiry, updateEnquiry } = require('../../controllers/Koi/koiEnquiryController');

router.get('/', getEnquiries);
router.post('/', createEnquiry);
router.patch('/:id/status', updateEnquiryStatus);
router.put('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);


module.exports = router;
