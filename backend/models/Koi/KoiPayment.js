const mongoose = require('mongoose');

const koiPaymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiOrder', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'KoiCustomer', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Completed'], 
        default: 'Completed' 
    }
}, { timestamps: true });

module.exports = mongoose.model('KoiPayment', koiPaymentSchema);
