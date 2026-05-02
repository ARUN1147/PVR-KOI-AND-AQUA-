import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { 
    Users, UserPlus, Trash2, Edit2, Shield, Search, 
    Filter, Mail, Briefcase, MapPin, CheckCircle2, 
    X, Fingerprint, Camera, RefreshCw, Settings2,
    Plus, Check, Info, Layout, Droplets, Fish,
    AlertCircle, Loader2, Sparkles, ArrowLeft, Save,
    Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FaceEnrollment from '../../components/Attendance/FaceEnrollment';

const PersonnelHub = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('USERS'); // USERS or ROLES
    
    // Shared State
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // User Management State
    const [users, setUsers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        name: '', email: '', password: '', role: '', branch: 'Global (All Branches)',
        allocatedModules: [],
        employeeId: '',
        isStaffPortalEnabled: false
    });
    const [rfid, setRfid] = useState('');
    const [faceEncodings, setFaceEncodings] = useState([]);
    const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('All Branches');
    const [selectedFilterRole, setSelectedFilterRole] = useState('All Roles');

    // Role Management State
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [currentRole, setCurrentRole] = useState({ name: '', modules: [], description: '' });
    const [savingRole, setSavingRole] = useState(false);

    const availableModules = [
        'Aqua:Dashboard', 'Aqua:Attendance', 'Aqua:Employees', 'Aqua:Customers', 'Aqua:Inventory', 'Aqua:Complaints', 'Aqua:Orders', 'Aqua:Tasks', 'Aqua:Services', 'Aqua:Invoices',
        'Koi:Dashboard', 'Koi:Attendance', 'Koi:Employees', 'Koi:Enquiries', 'Koi:Sales & Billing', 'Koi:Payments', 'Koi:Inventory', 'Koi:Customers', 'Koi:Invoices',
        'Staff:Dashboard', 'Staff:Tasks', 'Staff:Attendance', 'Staff:Enquiries', 'Staff:Orders', 'Staff:Complaints',
        'Staff:Technician', 'Staff:Installation', 'Staff:Service'
    ];

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [userRes, empRes, roleRes] = await Promise.all([
                api.getUsers(),
                api.getEmployees(),
                api.getRoles()
            ]);
            setUsers(userRes.data);
            setEmployees(empRes.data);
            setRoles(roleRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- User Management Handlers ---
    const handleUserRoleChange = (newRoleKey) => {
        const role = roles.find(r => r.key === newRoleKey);
        const autoModules = role ? role.modules : [];
        let newBranch = userFormData.branch;

        if (newRoleKey === 'KOI_MANAGER') {
            newBranch = 'Koi Centre';
        } else if (newRoleKey?.toLowerCase() === 'admin') {
            newBranch = 'Aqua Culture';
        }

        setUserFormData({
            ...userFormData,
            role: newRoleKey,
            branch: newBranch,
            allocatedModules: autoModules
        });
    };

    const handleOpenUserModal = (user = null) => {
        setShowPassword(false); // Reset show password when opening
        if (user) {
            setEditingUser(user);
            const linkedEmp = employees.find(e => e._id === user.employeeId);
            setUserFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                branch: user.branch,
                allocatedModules: user.allocatedModules || [],
                employeeId: user.employeeId || ''
            });
            setRfid(linkedEmp?.rfid || '');
            setFaceEncodings(linkedEmp?.faceEncodings || []);
        } else {
            setEditingUser(null);
            const defaultRole = roles.length > 0 ? roles[0].key : 'BOSS';
            setUserFormData({
                name: '', email: '', password: '', role: defaultRole, branch: 'Global (All Branches)',
                allocatedModules: roles.length > 0 ? roles[0].modules : [],
                employeeId: ''
            });
            handleGenerateRFID();
            setFaceEncodings([]);
        }
        setIsUserModalOpen(true);
    };

    const handleGenerateRFID = () => {
        const prefixes = ['ZO', 'ON', 'TO', 'RE', 'AL', 'PX', 'KV', 'TR'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const newRfid = `${randomPrefix}${Math.floor(1000 + Math.random() * 9000)}`;
        setRfid(newRfid);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            let targetEmployeeId = userFormData.employeeId;
            const empData = {
                name: userFormData.name,
                designation: userFormData.role,
                branch: userFormData.branch === 'Koi Centre' ? 'Koi' : 'Aqua',
                rfid,
                faceEncodings
            };

            if (!targetEmployeeId) {
                const empRes = await api.createEmployee(empData);
                targetEmployeeId = empRes.data._id;
            } else {
                await api.updateEmployee(targetEmployeeId, empData);
            }

            const submissionData = { ...userFormData, employeeId: targetEmployeeId };
            if (editingUser) {
                await api.updateUser(editingUser._id, submissionData);
            } else {
                await api.createUser(submissionData);
            }
            setIsUserModalOpen(false);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving user');
        }
    };

    const handleUserDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.deleteUser(id);
            fetchAll();
        } catch (err) {
            alert('Error deleting user');
        }
    };

    // --- Role Management Handlers ---
    const handleSaveRole = async (e) => {
        e.preventDefault();
        try {
            setSavingRole(true);
            if (isEditingRole) {
                await api.updateRole(currentRole._id, currentRole);
            } else {
                await api.createRole(currentRole);
            }
            resetRoleForm();
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving role');
        } finally {
            setSavingRole(false);
        }
    };

    const handleEditRole = (role) => {
        setCurrentRole(role);
        setIsEditingRole(true);
        // We don't scroll here as it's a tabbed view, but we could
    };

    const resetRoleForm = () => {
        setCurrentRole({ name: '', modules: [], description: '' });
        setIsEditingRole(false);
    };

    const handleRoleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            console.log('Attempting to delete role with ID:', id);
            const response = await api.deleteRole(id);
            console.log('Delete response:', response.data);
            
            // Immediately remove from local state for instant UI update
            setRoles(prevRoles => prevRoles.filter(role => role._id !== id));
            
            // Then sync with server
            await fetchAll();
        } catch (err) {
            console.error('Full Error during role deletion:', err);
            const errorMessage = err.response?.data?.message || 'Error deleting role';
            alert(`Failed to delete role: ${errorMessage}`);
        }
    };

    const toggleModule = (module) => {
        const newModules = currentRole.modules.includes(module)
            ? currentRole.modules.filter(m => m !== module)
            : [...currentRole.modules, module];
        setCurrentRole({ ...currentRole, modules: newModules });
    };

    // --- View Logic ---
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesBranch = selectedBranch === 'All Branches' || user.branch === selectedBranch;
        const matchesRole = selectedFilterRole === 'All Roles' || (user.role?.toUpperCase() === selectedFilterRole?.toUpperCase());
        return matchesSearch && matchesBranch && matchesRole;
    });

    const tabVariants = {
        initial: { opacity: 0, x: 10 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -10 }
    };

    return (
        <div className="min-h-screen space-y-8 pb-12">
            {/* Header / Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-200/5">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Shield className="text-indigo-600" size={32} />
                        Staff & Access Hub
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Unified administrative console for workforce management</p>
                </div>

                <div className="flex p-1.5 bg-gray-100 rounded-[1.5rem] self-start lg:self-center">
                    <button 
                        onClick={() => setActiveTab('USERS')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-sm font-black transition-all ${activeTab === 'USERS' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users size={18} />
                        USER MATRIX
                    </button>
                    <button 
                        onClick={() => setActiveTab('ROLES')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[1.2rem] text-sm font-black transition-all ${activeTab === 'ROLES' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Settings2 size={18} />
                        SYSTEM ROLES
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'USERS' ? (
                    <motion.div 
                        key="users-tab"
                        variants={tabVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-6"
                    >
                        {/* Users Toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex-1 w-full max-w-xl relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search officers by name or email..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 outline-none transition-all font-bold text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <select 
                                    className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                >
                                    <option value="All Branches">All Branches</option>
                                    <option value="Aqua Culture">Aqua Culture</option>
                                    <option value="Koi Centre">Koi Centre</option>
                                </select>
                                <button 
                                    onClick={() => handleOpenUserModal()}
                                    className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    <UserPlus size={18} />
                                    REGISTER OFFICER
                                </button>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-200/5 border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="px-8 py-5">Officer Information</th>
                                            <th className="px-8 py-5">Access Level</th>
                                            <th className="px-8 py-5">Branch Assignment</th>
                                            <th className="px-8 py-5">Biometrics</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-300">Syncing personnel data...</td></tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-300">No personnel found matching your criteria</td></tr>
                                        ) : filteredUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
                                                            {user.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 leading-tight">{user.name}</p>
                                                            <p className="text-xs text-gray-400 font-medium mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                        user.role === 'BOSS' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                    }`}>
                                                        {roles.find(r => r.key === user.role)?.name || user.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin size={14} className="text-gray-300" />
                                                        <span className="text-sm font-bold text-gray-600">{user.branch}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${employees.find(e => e._id === user.employeeId)?.faceEncodings?.length > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'}`}>
                                                            <Camera size={14} />
                                                        </div>
                                                        <div className={`p-2 rounded-lg flex items-center gap-2 ${employees.find(e => e._id === user.employeeId)?.rfid ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-300'}`}>
                                                            <Fingerprint size={14} />
                                                            <span className="text-[10px] font-black font-mono">{employees.find(e => e._id === user.employeeId)?.rfid || '--'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => handleOpenUserModal(user)} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleUserDelete(user._id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="roles-tab"
                        variants={tabVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="grid grid-cols-1 xl:grid-cols-12 gap-8"
                    >
                        {/* Role Editor */}
                        <div className="xl:col-span-5">
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-200/5 border border-gray-100 overflow-hidden sticky top-8">
                                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        {isEditingRole ? <Edit2 className="text-indigo-500" /> : <Plus className="text-indigo-500" />}
                                        {isEditingRole ? 'Update Template' : 'New Role Template'}
                                    </h3>
                                    {isEditingRole && (
                                        <button onClick={resetRoleForm} className="text-[10px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest flex items-center gap-1 transition-colors">
                                            <X size={12} /> CANCEL
                                        </button>
                                    )}
                                </div>
                                <form onSubmit={handleSaveRole} className="p-8 space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Template Name</label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="e.g. Regional Supervisor"
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-gray-900 shadow-sm"
                                            value={currentRole.name}
                                            onChange={(e) => setCurrentRole({...currentRole, name: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">Component Access Matrix</label>
                                        
                                        <div className="space-y-4">
                                            {/* Aqua */}
                                            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Droplets size={16} className="text-blue-500" />
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Aqua Branch Modules</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {availableModules.filter(m => m.startsWith('Aqua:')).map(module => (
                                                        <label key={module} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentRole.modules.includes(module) ? 'bg-white border-blue-400 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${currentRole.modules.includes(module) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                                                {currentRole.modules.includes(module) && <Check size={12} strokeWidth={4} />}
                                                            </div>
                                                            <span className={`text-[10px] font-bold ${currentRole.modules.includes(module) ? 'text-blue-900' : 'text-gray-400'}`}>
                                                                {module.split(':')[1]}
                                                            </span>
                                                            <input type="checkbox" className="hidden" checked={currentRole.modules.includes(module)} onChange={() => toggleModule(module)} />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Staff Portal */}
                                            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Layout size={16} className="text-indigo-500" />
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Employee Operations Matrix</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {availableModules.filter(m => m.startsWith('Staff:')).map(module => (
                                                        <label key={module} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentRole.modules.includes(module) ? 'bg-white border-indigo-400 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${currentRole.modules.includes(module) ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>
                                                                 {currentRole.modules.includes(module) && <Check size={12} strokeWidth={4} />}
                                                            </div>
                                                            <span className={`text-[10px] font-bold ${currentRole.modules.includes(module) ? 'text-indigo-900' : 'text-gray-400'}`}>
                                                                {module.split(':')[1]}
                                                            </span>
                                                            <input type="checkbox" className="hidden" checked={currentRole.modules.includes(module)} onChange={() => toggleModule(module)} />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Koi */}
                                            <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Fish size={16} className="text-orange-500" />
                                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Koi Centre Modules</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {availableModules.filter(m => m.startsWith('Koi:')).map(module => (
                                                        <label key={module} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentRole.modules.includes(module) ? 'bg-white border-orange-400 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${currentRole.modules.includes(module) ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
                                                                {currentRole.modules.includes(module) && <Check size={12} strokeWidth={4} />}
                                                            </div>
                                                            <span className={`text-[10px] font-bold ${currentRole.modules.includes(module) ? 'text-orange-900' : 'text-gray-400'}`}>
                                                                {module.split(':')[1]}
                                                            </span>
                                                            <input type="checkbox" className="hidden" checked={currentRole.modules.includes(module)} onChange={() => toggleModule(module)} />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={savingRole || currentRole.modules.length === 0}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {savingRole ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                        {isEditingRole ? 'CONSOLIDATE UPDATES' : 'PROVISION TEMPLATE'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Roles List */}
                        <div className="xl:col-span-7 space-y-4">
                            <h3 className="text-xl font-bold text-gray-800 ml-2 mb-4">Security Matrices</h3>
                            {roles.map(role => (
                                <motion.div 
                                    key={role._id}
                                    layout
                                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                                            <Shield size={32} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{role.name}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                                                {role.key} <span className="w-1 h-1 bg-gray-200 rounded-full" /> {role.modules.length} GRANTED MODULES
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 border-l border-gray-50 pl-6 h-12">
                                        <button onClick={() => handleEditRole(role)} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                                        <button onClick={() => handleRoleDelete(role._id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Registration Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 relative"
                    >
                        <button onClick={() => setIsUserModalOpen(false)} className="absolute right-8 top-8 p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all group">
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                        
                        {!isFaceModalOpen ? (
                            <>
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                                            <UserPlus size={28} />
                                        </div>
                                        <div>
                                            <span className="block leading-tight">{editingUser ? 'UPDATE' : 'REGISTER'}</span>
                                            <span className="block text-indigo-600 text-sm tracking-[0.2em] font-black uppercase mt-1">Personnel Security Profile</span>
                                        </div>
                                    </h2>
                                </div>

                                <form onSubmit={handleUserSubmit} className="space-y-8">
                                    {/* Identity Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Identity</label>
                                            <input required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-700" value={userFormData.name} onChange={(e) => setUserFormData({...userFormData, name: e.target.value})} placeholder="e.g. Johnathan Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Access Email</label>
                                            <input required type="email" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-700" value={userFormData.email} onChange={(e) => setUserFormData({...userFormData, email: e.target.value})} placeholder="john@pvr-aqua.com" />
                                        </div>
                                    </div>

                                    {/* Security & Access Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Matrix (Role)</label>
                                            <div className="relative">
                                                <select className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold appearance-none cursor-pointer text-slate-700 transition-all" value={userFormData.role} onChange={(e) => handleUserRoleChange(e.target.value)}>
                                                    {roles.map(r => <option key={r._id} value={r.key}>{r.name}</option>)}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <Shield size={18} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Branch</label>
                                            <div className="relative">
                                                <select className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold appearance-none cursor-pointer text-slate-700 transition-all" value={userFormData.branch} onChange={(e) => setUserFormData({...userFormData, branch: e.target.value})}>
                                                    <option value="Global (All Branches)">Global (All Branches)</option>
                                                    <option value="Aqua Culture">Aqua Culture</option>
                                                    <option value="Koi Centre">Koi Centre</option>
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <MapPin size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Encryption Passkey</label>
                                        <div className="relative">
                                            <input 
                                                required={!editingUser}
                                                type={showPassword ? "text" : "password"} 
                                                placeholder={editingUser ? "Leave blank to keep existing passkey" : "Enter a secure unique passkey"} 
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-slate-700 pr-14" 
                                                value={userFormData.password} 
                                                onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} 
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Biometric & Portal Protocol Box */}
                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Fingerprint className="text-indigo-600" size={18} /> IDENTITY AUTHENTICATION
                                            </h4>
                                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Access</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setUserFormData({...userFormData, isStaffPortalEnabled: !userFormData.isStaffPortalEnabled})}
                                                    className={`w-10 h-5 rounded-full transition-all relative ${userFormData.isStaffPortalEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${userFormData.isStaffPortalEnabled ? 'left-6' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RFID CARD IDENTITY</label>
                                                <div className="relative group">
                                                    <input 
                                                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all pr-12" 
                                                        value={rfid} 
                                                        onChange={(e) => setRfid(e.target.value)} 
                                                        placeholder="SCAN OR ENTER ID"
                                                    />
                                                    <button type="button" onClick={handleGenerateRFID} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                        <RefreshCw size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-end">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsFaceModalOpen(true)}
                                                    className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3 group shadow-sm"
                                                >
                                                    <Camera size={18} className="group-hover:scale-110 transition-transform" />
                                                    {userFormData.faceDescriptor ? 'BIOMETRIC REGISTERED' : 'ENROLL FACIAL MAP'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-4 pt-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsUserModalOpen(false)}
                                            className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                                        >
                                            ABORT
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                                        >
                                            <CheckCircle2 size={20} />
                                            {editingUser ? 'CONFIRM CHANGES' : 'AUTHORIZE ACCESS'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <FaceEnrollment 
                                employee={editingUser ? { _id: editingUser.employeeId, name: userFormData.name } : { _id: 'temp', name: userFormData.name }}
                                onComplete={(descriptors) => { setFaceEncodings(descriptors); setIsFaceModalOpen(false); }}
                                onCancel={() => setIsFaceModalOpen(false)}
                            />
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PersonnelHub;
