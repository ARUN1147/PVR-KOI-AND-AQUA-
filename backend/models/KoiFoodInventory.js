const mongoose = require('mongoose');

const koiFoodInventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    description: { type: String },
    availableQuantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    price: { type: Number, required: true },
    unit: { type: String, default: 'kg' }
}, { timestamps: true });

module.exports = mongoose.model('KoiFoodInventory', koiFoodInventorySchema);
