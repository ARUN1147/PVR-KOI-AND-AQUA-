const KoiOrder = require('../models/KoiOrder');
const KoiCustomer = require('../models/KoiCustomer');
const KoiFoodInventory = require('../models/KoiFoodInventory');

exports.createOrder = async (req, res) => {
    try {
        const order = await KoiOrder.create(req.body);
        
        // Update customer order history
        await KoiCustomer.findByIdAndUpdate(req.body.customer, {
            $push: { orderHistory: order._id },
            $inc: { purchaseFrequency: 1 }
        });

        // Reduce food stock if applicable
        if (req.body.foodItems && req.body.foodItems.length > 0) {
            for (const item of req.body.foodItems) {
                await KoiFoodInventory.findByIdAndUpdate(item.id, {
                    $inc: { availableQuantity: -item.quantity }
                });
            }
        }

        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await KoiOrder.find().populate('customer').populate('enquiry').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await KoiOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
