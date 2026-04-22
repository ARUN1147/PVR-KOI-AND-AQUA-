const mongoose = require('mongoose');

const koiCustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    address: { type: String },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KoiOrder' }],
    purchaseFrequency: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('KoiCustomer', koiCustomerSchema);
