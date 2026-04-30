const Task = require('../../models/Staff/Task');
const Product = require('../../models/Aqua/Product');
const Service = require('../../models/Aqua/Service');
const Customer = require('../../models/Aqua/Customer');

exports.createTask = async (req, res) => {
    try {
        const taskData = { ...req.body };
        
        // Auto-populate Google Maps Link if missing but customerId exists
        if (!taskData.googleMapsLink && taskData.customerId) {
            const customer = await Customer.findById(taskData.customerId);
            if (customer?.location?.googleMapsLink) {
                taskData.googleMapsLink = customer.location.googleMapsLink;
            }
        }

        const task = await Task.create(taskData);
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('customerId').populate('assignedTo');
        res.json(tasks);
    } catch (err) {

        res.status(500).json({ message: err.message });
    }
};

exports.getAssignedTasks = async (req, res) => {
    try {
        const { employeeId } = req.user;
        const User = require('../../models/Boss/User');
        const userDoc = await User.findById(req.user.id);
        console.log(`DEBUG: User ${userDoc?.name} has modules:`, userDoc?.allocatedModules);
        
        const systemTechnicians = await User.find({ allocatedModules: 'Staff:Technician' });
        console.log(`DEBUG: System-wide Technicians: ${systemTechnicians.length}`);
        systemTechnicians.forEach(t => console.log(`  - ${t.name} (EMP: ${t.employeeId})`));
        
        console.log('DEBUG: Fetching tasks for employeeId:', employeeId);
        if (!employeeId) {
            return res.status(400).json({ message: 'User is not linked to an employee record' });
        }
        const tasks = await Task.find({ assignedTo: employeeId }).populate('customerId').populate('assignedTo');
        const unassigned = await Task.countDocuments({ assignedTo: null });
        console.log(`DEBUG: Found ${tasks.length} tasks for ${employeeId} | Global Unassigned: ${unassigned}`);
        tasks.forEach(t => console.log(`  - TASK: ${t.description} | TYPE: ${t.type} | STATUS: ${t.status}`));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const task = await Task.findById(id);
        task.status = status;
        task.timeline.push({ status });

        if ((status === 'Completed' || status === 'Work completed') && task.materialsUsed.length > 0) {
            // Auto stock deduction
            for (let material of task.materialsUsed) {
                await Product.findByIdAndUpdate(material.productId, {
                    $inc: { stock: -material.quantity }
                });
            }
        }

        // AUTO SERVICE RESET: If this was a service task, reset the cycle in the Service module
        if ((status === 'Completed' || status === 'Work completed') && task.type === 'Service' && task.customerId) {
            const service = await Service.findOne({ customerId: task.customerId });
            if (service) {
                const visitDate = new Date();
                const newExpiry = new Date();
                newExpiry.setDate(newExpiry.getDate() + 60);

                // Add log entry
                service.logs.push({
                    visitDate,
                    notes: `Automatically reset from Task Management: ${task.description}`,
                    visitedBy: task.assignedTo,
                    replacedItems: task.materialsUsed || []
                });

                service.serviceExpiryDate = newExpiry;
                await service.save();

                // Update customer dates
                await Customer.findByIdAndUpdate(task.customerId, {
                    lastServiceDate: visitDate,
                    nextServiceDate: newExpiry
                });
            }
        }

        // AUTO ORDER TRANSITION: If this was a design task, push order to Verification
        if ((status === 'Completed' || status === 'Work completed') && task.orderId) {
            const Order = require('../../models/Aqua/Order');
            const order = await Order.findById(task.orderId);
            if (order && order.status === 'AutoCAD Design') {
                order.status = 'Design Verification';
                
                // Sync design file to order record if available
                if (task.designUrl && !order.autoCADFiles.includes(task.designUrl)) {
                    order.autoCADFiles.push(task.designUrl);
                }
                
                await order.save();
            }
        }

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // If customer is changing, refresh the link
        if (updateData.customerId) {
            const customer = await Customer.findById(updateData.customerId);
            if (customer?.location?.googleMapsLink) {
                updateData.googleMapsLink = customer.location.googleMapsLink;
            }
        }

        const task = await Task.findByIdAndUpdate(id, updateData, { new: true })
            .populate('customerId')
            .populate('assignedTo');
        res.json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
