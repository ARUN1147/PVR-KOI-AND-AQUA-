const Role = require('../../models/Boss/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Boss
exports.getRoles = async (req, res) => {
    try {
        console.log('Fetching all system roles...');
        const roles = await Role.find();
        console.log(`Successfully retrieved ${roles.length} roles.`);
        res.status(200).json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new role
// @route   POST /api/roles
// @access  Private/Boss
exports.createRole = async (req, res) => {
    try {
        let { name, key, modules, description } = req.body;

        if (!key && name) {
            key = name.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
        }

        const roleExists = await Role.findOne({ $or: [{ name }, { key }] });

        if (roleExists) {
            return res.status(400).json({ message: 'Role with this name or key already exists' });
        }

        const role = await Role.create({
            name,
            key,
            modules,
            description
        });

        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Boss
exports.updateRole = async (req, res) => {
    try {
        const { name, key, modules, description } = req.body;
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        role.name = name || role.name;
        role.key = key ? key.toUpperCase().replace(/\s+/g, '_') : role.key;
        role.modules = modules || role.modules;
        role.description = description || role.description;

        const updatedRole = await role.save();
        res.status(200).json(updatedRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/Boss
exports.deleteRole = async (req, res) => {
    try {
        console.log(`DELETE REQUEST: Role ID ${req.params.id}`);
        const role = await Role.findById(req.params.id);

        if (!role) {
            console.log(`DELETE FAILED: Role ${req.params.id} not found`);
            return res.status(404).json({ message: 'Role not found' });
        }

        await role.deleteOne();
        console.log(`DELETE SUCCESS: Role ${req.params.id} removed`);
        res.status(200).json({ message: 'Role removed' });
    } catch (error) {
        console.error('DELETE ERROR:', error.message);
        res.status(500).json({ message: error.message });
    }
};
