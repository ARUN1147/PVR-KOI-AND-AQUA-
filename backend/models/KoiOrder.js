const mongoose = require('mongoose');

const koiOrderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiCustomer', required: true },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiEnquiry' },
    fishType: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('KoiOrder', koiOrderSchema);
