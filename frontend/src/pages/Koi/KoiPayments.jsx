import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    CreditCard, 
    User, 
    Calendar,
    ArrowUpCircle,
    CheckCircle2,
    Clock,
    IndianRupee,
    Wallet
} from 'lucide-react';
import { getKoiPayments, createKoiPayment, getPendingKoiPayments } from '../../services/api';
import Modal from '../../components/Modal';

const KoiPayments = () => {
    const [payments, setPayments] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        order: '',
        customer: '',
        amount: '',
        paymentMethod: 'UPI',
        status: 'Completed'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsRes, pendingRes] = await Promise.all([
                getKoiPayments(),
                getPendingKoiPayments()
            ]);
            setPayments(paymentsRes.data);
            setPendingOrders(pendingRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createKoiPayment(formData);
            fetchData();
            setIsModalOpen(false);
            setFormData({ order: '', customer: '', amount: '', paymentMethod: 'UPI', status: 'Completed' });
        } catch (err) {
            console.error('Error creating payment:', err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic uppercase tracking-tight">Payments</h1>
                    <p className="text-gray-400 font-medium mt-1">Track payments and manage pending balances</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-100 hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} />
                    <span>RECORD PAYMENT</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payments.length > 0 ? payments.map((payment) => (
                    <div key={payment._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 hover:shadow-2xl hover:shadow-emerald-100/30 transition-all duration-500 group border-l-8 border-l-emerald-500">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest italic mb-1">Payment via</span>
                                <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">{payment.paymentMethod}</h3>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <CheckCircle2 size={24} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900">{payment.customer?.name}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase italic">Order #{payment.order?._id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                    <Calendar size={14} />
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                </div>
                                <div className="text-2xl font-black text-gray-900 flex items-center gap-1">
                                    <IndianRupee size={20} />
                                    {payment.amount}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <Wallet size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 uppercase italic tracking-widest">No payments recorded</h3>
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="RECORD PAYMENT"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Pending Order</label>
                        <select 
                            required
                            value={formData.order}
                            onChange={(e) => {
                                const ord = pendingOrders.find(o => o._id === e.target.value);
                                setFormData({...formData, order: e.target.value, customer: ord?.customer?._id, amount: ord?.totalAmount});
                            }}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold appearance-none"
                        >
                            <option value="">Select Order</option>
                            {pendingOrders.map(o => <option key={o._id} value={o._id}>#{o._id.slice(-6).toUpperCase()} - {o.customer?.name} (₹{o.totalAmount})</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Amount Collected (₹)</label>
                            <input 
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Payment Method</label>
                            <select 
                                required
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-semibold appearance-none"
                            >
                                <option value="UPI">UPI / GPay</option>
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                        >
                            Save Record
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default KoiPayments;
