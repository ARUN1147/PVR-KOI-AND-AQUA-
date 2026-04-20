const KoiFoodInventory = require('../models/KoiFoodInventory');

exports.getStock = async (req, res) => {
    try {
        const stock = await KoiFoodInventory.find().sort({ itemName: 1 });
        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addStock = async (req, res) => {
    try {
        const stock = await KoiFoodInventory.create(req.body);
        res.status(201).json(stock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const stock = await KoiFoodInventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(stock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const lowStock = await KoiFoodInventory.find({
            $expr: { $lte: ["$availableQuantity", "$lowStockThreshold"] }
        });
        res.json(lowStock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
