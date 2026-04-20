const mongoose = require('mongoose');

const koiEnquirySchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    contact: { type: String, required: true },
    requirement: { type: String, required: true }, // Fish requirement / food enquiry
    date: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['New', 'Follow-up', 'Converted'], 
        default: 'New' 
    },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('KoiEnquiry', koiEnquirySchema);
