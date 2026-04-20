const mongoose = require('mongoose');

const koiInvoiceSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiOrder', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiCustomer', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Fish', 'Food'], required: true },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('KoiInvoice', koiInvoiceSchema);
