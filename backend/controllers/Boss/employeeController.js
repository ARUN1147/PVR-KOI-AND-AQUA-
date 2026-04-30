const Employee = require('../../models/Boss/Employee');

exports.getEmployees = async (req, res) => {
    try {
        const branch = req.query.branch || 'Aqua';
        const query = branch === 'All' ? {} : { branch };
        const employees = await Employee.find(query).sort({ createdAt: -1 });
        
        // Link with User data to get allocatedModules
        const User = require('../../models/Boss/User');
        const users = await User.find({ employeeId: { $in: employees.map(e => e._id) } });
        
        const enrichedEmployees = employees.map(emp => {
            const user = users.find(u => u.employeeId?.toString() === emp._id.toString());
            return {
                ...emp.toObject(),
                allocatedModules: user ? user.allocatedModules : []
            };
        });

        res.json(enrichedEmployees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const employee = await Employee.create(req.body);
        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
