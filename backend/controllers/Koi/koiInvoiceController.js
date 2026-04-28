const KoiInvoice = require('../../models/Koi/KoiInvoice');

exports.createInvoice = async (req, res) => {
    try {
        if (req.body._id) {
            // Check if it's a delete action
            if (req.body.action === 'delete' || req.body.isDeleted === true) {
                const invoice = await KoiInvoice.findByIdAndUpdate(req.body._id, { isDeleted: true }, { new: true });
                if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
                return res.json({ message: 'Invoice deleted successfully (soft delete)', invoice });
            }
            // Otherwise it's an update action
            const invoice = await KoiInvoice.findByIdAndUpdate(req.body._id, req.body, { new: true }).populate('customer').populate('order');
            if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
            return res.json(invoice);
        }

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

exports.updateInvoice = async (req, res) => {
    try {
        const invoice = await KoiInvoice.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('customer').populate('order');
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await KoiInvoice.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json({ message: 'Invoice deleted successfully (soft delete)', invoice });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
