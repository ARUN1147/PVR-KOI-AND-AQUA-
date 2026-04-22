const express = require('express');
const router = express.Router();
const { 
    getSuppliers, 
    createSupplier, 
    updateSupplier, 
    deleteSupplier 
} = require('../../controllers/Koi/supplierController');

router.get('/', getSuppliers);
router.post('/', createSupplier);
router.patch('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;
