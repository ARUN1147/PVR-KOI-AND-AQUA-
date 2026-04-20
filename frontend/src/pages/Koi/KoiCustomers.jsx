import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    User, 
    Phone, 
    MapPin, 
    History, 
    ChevronRight,
    TrendingUp,
    PhoneCall,
    Mail,
    Users
} from 'lucide-react';
import { getKoiCustomers, createKoiCustomer, getKoiCustomerById } from '../../services/api';
import Modal from '../../components/Modal';

const KoiCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await getKoiCustomers();
            setCustomers(res.data);
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            await createKoiCustomer(formData);
            fetchCustomers();
            setIsAddModalOpen(false);
            setFormData({ name: '', phone: '', address: '' });
        } catch (err) {
            console.error('Error adding customer:', err);
        }
    };

    const handleViewDetail = async (id) => {
        try {
            const res = await getKoiCustomerById(id);
            setSelectedCustomer(res.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            console.error('Error fetching customer detail:', err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic uppercase tracking-tight">Customer Database</h1>
                    <p className="text-gray-400 font-medium mt-1">Manage Koi Centre clientele and purchase history</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-gray-100 hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} />
                    <span>ADD CUSTOMER</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {customers.length > 0 ? customers.map((customer) => (
                    <div key={customer._id} className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500 group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-inner">
                                {customer.name[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-black text-gray-900 font-display uppercase tracking-tight">{customer.name}</h3>
                                <div className="flex items-center gap-1.5 text-[11px] font-black text-orange-600 uppercase tracking-widest italic">
                                    <TrendingUp size={12} />
                                    {customer.purchaseFrequency} Purchases
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                <Phone size={16} className="text-gray-300" />
                                {customer.phone}
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-500 font-medium leading-relaxed">
                                <MapPin size={16} className="text-gray-300 mt-1 flex-shrink-0" />
                                {customer.address || 'Address not provided'}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleViewDetail(customer._id)}
                                className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                <History size={16} className="text-gray-400 group-hover/btn:text-gray-900 transition-colors" /> View History
                            </button>
                            <a href={`tel:${customer.phone}`} className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl transition-all shadow-lg shadow-orange-100 hover:-translate-y-1">
                                <PhoneCall size={20} />
                            </a>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <Users size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 uppercase italic tracking-widest">No customers found</h3>
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                title="REGISTER NEW CLIENT"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Full Name</label>
                        <input 
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                            placeholder="e.g. Adhithya Saminathan"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Mobile Number</label>
                        <input 
                            type="text"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                            placeholder="+91 90000 00000"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Billing Address</label>
                        <textarea 
                            rows="3"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold resize-none"
                            placeholder="Enter full address for invoicing..."
                        ></textarea>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                        >
                            Save Client
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                title="CUSTOMER HISTORY"
                maxWidth="max-w-2xl"
            >
                {selectedCustomer && (
                    <div className="p-8 space-y-8">
                        <div className="flex items-center gap-6 p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100">
                            <div className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-orange-200">
                                {selectedCustomer.name[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 font-display italic uppercase tracking-tighter">{selectedCustomer.name}</h3>
                                <p className="text-sm font-bold text-gray-400 flex items-center gap-1.5">
                                    <Phone size={14} /> {selectedCustomer.phone}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Order History</h4>
                            <div className="space-y-3">
                                {selectedCustomer.orderHistory && selectedCustomer.orderHistory.length > 0 ? selectedCustomer.orderHistory.map((order, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-all">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-900 uppercase">#{order._id?.slice(-6).toUpperCase() || 'ID-ERR'}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">{order.fishType} ({order.quantity} qty)</span>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-sm font-black text-gray-900">₹{order.totalAmount}</span>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">{order.status}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center text-gray-400 italic text-sm">No orders found for this customer.</div>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsDetailModalOpen(false)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Close Record
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default KoiCustomers;
