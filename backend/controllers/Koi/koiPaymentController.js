const KoiPayment = require('../../models/Koi/KoiPayment');
const KoiOrder = require('../../models/Koi/KoiOrder');

exports.createPayment = async (req, res) => {
    try {
        const payment = await KoiPayment.create(req.body);
        
        // Update order payment status
        if (payment.status === 'Completed') {
            await KoiOrder.findByIdAndUpdate(req.body.order, { paymentStatus: 'Completed' });
        }

        res.status(201).json(payment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await KoiPayment.find().populate('customer').populate('order').sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPendingPayments = async (req, res) => {
    try {
        const pendingPayments = await KoiOrder.find({ paymentStatus: 'Pending' }).populate('customer');
        res.json(pendingPayments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
