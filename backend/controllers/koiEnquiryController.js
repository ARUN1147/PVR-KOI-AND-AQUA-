const KoiEnquiry = require('../models/KoiEnquiry');

exports.createEnquiry = async (req, res) => {
    try {
        const enquiry = await KoiEnquiry.create(req.body);
        res.status(201).json(enquiry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getEnquiries = async (req, res) => {
    try {
        const enquiries = await KoiEnquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEnquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const enquiry = await KoiEnquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(enquiry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteEnquiry = async (req, res) => {
    try {
        await KoiEnquiry.findByIdAndDelete(req.params.id);
        res.json({ message: 'Enquiry deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
