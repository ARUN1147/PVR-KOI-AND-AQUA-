import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Phone,
    MapPin,
    ExternalLink,
    MessageSquare,
    History,
    ShoppingCart,
    Loader2
} from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/api';
import Modal from '../../components/Modal';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        location: { lat: 0, lng: 0, googleMapsLink: '' }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await getCustomers();
            setCustomers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCustomer(formData);
            setIsModalOpen(false);
            setFormData({ name: '', phone: '', address: '', location: { lat: 0, lng: 0, googleMapsLink: '' } });
            fetchCustomers();
        } catch (err) {
            alert('Error creating customer');
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    const [expandedId, setExpandedId] = useState(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight font-display">Customer Directory</h1>
                    <p className="text-gray-500 font-medium">Manage your elite aquaculture client base and history.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-sm hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 uppercase tracking-widest active:scale-95 group"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span>New Customer</span>
                </button>
            </div>

            {/* Filter & Stats Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-2/5 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search elite client or contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-gray-50/50 border-2 border-transparent rounded-xl focus:bg-white focus:border-primary-500/20 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Database</span>
                        <span className="text-2xl font-black text-primary-600 leading-none">{customers.length.toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-80 gap-4">
                    <div className="relative">
                        <Loader2 className="animate-spin text-primary-500" size={48} />
                        <div className="absolute inset-0 bg-primary-500/10 blur-xl animate-pulse rounded-full"></div>
                    </div>
                    <p className="text-gray-400 font-bold italic animate-pulse">Retrieving secure client records...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((customer) => (
                        <div 
                            key={customer._id} 
                            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === customer._id ? 'border-primary-500 shadow-xl shadow-primary-50 ring-1 ring-primary-500' : 'border-gray-100 shadow-sm hover:border-primary-200'}`}
                        >
                            {/* Customer Row Header */}
                            <div 
                                onClick={() => setExpandedId(expandedId === customer._id ? null : customer._id)}
                                className="p-4 flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all duration-500 ${expandedId === customer._id ? 'bg-primary-600 text-white scale-110 rotate-3 shadow-lg shadow-primary-200' : 'bg-primary-50 text-primary-600'}`}>
                                        {customer.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors italic">
                                            {customer.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                <Phone size={10} className="text-primary-400" />
                                                <span>{customer.phone}</span>
                                            </div>
                                            <span className="text-[8px] text-gray-300">•</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1 h-1 rounded-full bg-green-500"></div>
                                                <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg transition-all duration-300 ${expandedId === customer._id ? 'bg-primary-50 text-primary-600 rotate-180' : 'text-gray-300 group-hover:text-primary-400'}`}>
                                        <History size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Dropdown Details Section */}
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedId === customer._id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-4 pb-6 pt-2 border-t border-gray-50 bg-gray-50/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                                                    <MapPin size={16} />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Location details</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed uppercase italic">
                                                {customer.address}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex gap-2">
                                                <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 hover:border-primary-500 hover:text-primary-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                                                    <ShoppingCart size={16} /> Orders
                                                </button>
                                                <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 hover:border-aqua-500 hover:text-aqua-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                                                    <MessageSquare size={16} /> Feedback
                                                </button>
                                            </div>
                                            <button className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 hover:border-primary-500 hover:text-primary-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-sm">
                                                <ExternalLink size={16} /> Full Profile Analysis
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                            <Users size={48} className="text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold italic tracking-wide">No client records found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Optimized Smaller New Customer Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Registration" maxWidth="max-w-md">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-6 space-y-6 bg-white">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight leading-none leading-none">Register Elite client</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Aquaculture Partner Profile</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type="text" placeholder="e.g. Adhithya Saminathan" required 
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-xl outline-none transition-all font-black text-gray-800 text-sm italic"
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type="text" placeholder="+91 XXXXX XXXXX" required 
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-xl outline-none transition-all font-black text-gray-800 text-sm italic"
                                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Details</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-gray-300" size={16} />
                                    <textarea
                                        placeholder="Enter complete office/residential address..." required 
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-xl outline-none transition-all font-black text-gray-800 text-sm italic min-h-[80px] resize-none"
                                        value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Google Maps (Opt)</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input
                                        type="text" placeholder="Paste URL here" 
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white rounded-xl outline-none transition-all font-black text-gray-800 text-sm italic"
                                        value={formData.location.googleMapsLink} onChange={(e) => setFormData({ ...formData, location: { ...formData.location, googleMapsLink: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                        <button 
                            type="button" onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-3.5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            type="submit" 
                            className="flex-[2] py-3.5 bg-primary-600 text-white rounded-xl font-black text-[10px] hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 uppercase tracking-[0.2em] active:scale-[0.98]"
                        >
                            Save Client Record
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );

};

export default Customers;
