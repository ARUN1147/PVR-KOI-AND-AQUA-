const KoiInvoice = require('../../models/Koi/KoiInvoice');

exports.createInvoice = async (req, res) => {
    try {
        const invoice = await KoiInvoice.create(req.body);
        res.status(201).json(invoice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await KoiInvoice.find().populate('customer').populate('order').sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await KoiInvoice.findById(req.params.id).populate('customer').populate('order');
        res.json(invoice);
    } catch (err) {
        res.status(404).json({ message: 'Invoice not found' });
    }
};
