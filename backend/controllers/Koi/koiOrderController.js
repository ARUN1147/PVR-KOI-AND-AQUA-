const KoiOrder = require('../../models/Koi/KoiOrder');
const KoiCustomer = require('../../models/Koi/KoiCustomer');
const KoiFoodInventory = require('../../models/Koi/KoiFoodInventory');
const StockTransaction = require('../../models/Koi/StockTransaction');

exports.createOrder = async (req, res) => {
    try {
        console.log('--- KOI ORDER CREATION ATTEMPT ---');
        console.log('Payload:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user?._id);

        if (!req.body.customer) throw new Error('Customer ID is required');
        if (!req.body.fishType) throw new Error('Product/Fish Type is required');

        const order = await KoiOrder.create(req.body);
        console.log('Order created in DB:', order._id);
        
        // Update customer order history
        await KoiCustomer.findByIdAndUpdate(req.body.customer, {
            $push: { orderHistory: order._id },
            $inc: { purchaseFrequency: 1 }
        });

        // Reduce food stock if it's a food order
        if (req.body.orderType === 'Food') {
            console.log('Processing Food Stock Reduction for:', req.body.fishType);
            const foodItem = await KoiFoodInventory.findOne({ itemName: req.body.fishType });
            if (foodItem) {
                foodItem.totalAvailableQuantity -= Number(req.body.quantity || 1);
                await foodItem.save();

                await StockTransaction.create({
                    itemId: foodItem._id,
                    type: 'Sale',
                    quantity: -Number(req.body.quantity || 1),
                    remainingStockAfter: foodItem.totalAvailableQuantity,
                    performedBy: req.user ? req.user._id : null,
                    notes: `Auto-generated from Order: ${order._id}`
                });
                console.log('Stock reduced for:', foodItem.itemName);
            } else {
                console.warn('Food item not found in inventory for stock reduction:', req.body.fishType);
            }
        }

        res.status(201).json(order);
    } catch (err) {
        console.error('CRITICAL ORDER ERROR:', err);
        res.status(400).json({ 
            message: err.message,
            errors: err.errors,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const orders = await KoiOrder.find()
            .populate('customer')
            .populate('enquiry')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await KoiOrder.countDocuments();

        res.json({
            orders,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await KoiOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateOrderStatus = exports.updateOrder;

exports.deleteOrder = async (req, res) => {
    try {
        const order = await KoiOrder.findById(req.params.id);
        if (order) {
            // Remove from customer history
            await KoiCustomer.findByIdAndUpdate(order.customer, {
                $pull: { orderHistory: order._id },
                $inc: { purchaseFrequency: -1 }
            });
            await KoiOrder.findByIdAndDelete(req.params.id);
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
