import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    FileText,
    User,
    Calendar,
    Download,
    Eye,
    Tag,
    IndianRupee,
    Printer,
    Trash2
} from 'lucide-react';
import { getKoiInvoices, createKoiInvoice, getKoiOrders, getKoiCustomers } from '../../services/api';
import Modal from '../../components/Modal';

const KoiInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [formData, setFormData] = useState({
        order: '',
        customer: '',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        type: 'Fish',
        items: [{ name: '', quantity: 1, price: 0, total: 0 }],
        totalAmount: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invoicesRes, ordersRes, customersRes] = await Promise.all([
                getKoiInvoices(),
                getKoiOrders(),
                getKoiCustomers()
            ]);
            setInvoices(invoicesRes.data);
            setOrders(ordersRes.data);
            setCustomers(customersRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 1, price: 0, total: 0 }]
        });
    };

    const removeItem = (idx) => {
        const newItems = formData.items.filter((_, i) => i !== idx);
        const newTotal = newItems.reduce((acc, curr) => acc + curr.total, 0);
        setFormData({ ...formData, items: newItems, totalAmount: newTotal });
    };

    const updateItem = (idx, field, val) => {
        const newItems = [...formData.items];
        newItems[idx][field] = val;
        if (field === 'quantity' || field === 'price') {
            newItems[idx].total = newItems[idx].quantity * newItems[idx].price;
        }
        const newTotal = newItems.reduce((acc, curr) => acc + curr.total, 0);
        setFormData({ ...formData, items: newItems, totalAmount: newTotal });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createKoiInvoice(formData);
            fetchData();
            setIsModalOpen(false);
            setFormData({
                order: '',
                customer: '',
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                type: 'Fish',
                items: [{ name: '', quantity: 1, price: 0, total: 0 }],
                totalAmount: 0
            });
        } catch (err) {
            console.error('Error creating invoice:', err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic uppercase tracking-tight">Invoices</h1>
                    <p className="text-gray-400 font-medium mt-1">Generate and manage billing for Koi & Food</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-gray-100 hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} />
                    <span>NEW INVOICE</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.length > 0 ? invoices.map((invoice) => (
                    <div key={invoice._id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 text-gray-50 group-hover:text-orange-50/50 transition-colors duration-500">
                            <FileText size={120} />
                        </div>

                        <div className="flex items-start justify-between mb-8">
                            <div className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                {invoice.type} INVOICE
                            </div>
                            <span className="text-xs font-black text-gray-400 font-display italic tracking-tighter">#{invoice.invoiceNumber}</span>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2 flex items-center gap-2">
                                    <User size={16} className="text-gray-400" />
                                    {invoice.customer?.name}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium italic">{invoice.customer?.phone}</p>
                            </div>

                            <div className="border-t border-dashed border-gray-100 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar size={14} />
                                        {new Date(invoice.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xl font-black text-gray-900 flex items-center gap-1">
                                        <IndianRupee size={18} />
                                        {invoice.totalAmount}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                        <Eye size={14} /> View
                                    </button>
                                    <button className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all shadow-lg shadow-orange-100">
                                        <Printer size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <FileText size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400 uppercase italic tracking-widest">No invoices found</h3>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="GENERATE INVOICE"
                maxWidth="max-w-3xl"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Linked Order</label>
                                <select
                                    required
                                    value={formData.order}
                                    onChange={(e) => {
                                        const ord = orders.find(o => o._id === e.target.value);
                                        if (ord) {
                                            setFormData({
                                                ...formData,
                                                order: e.target.value,
                                                customer: ord.customer?._id,
                                                items: [{ name: ord.fishType, quantity: ord.quantity, price: ord.price, total: ord.totalAmount }],
                                                totalAmount: ord.totalAmount
                                            });
                                        } else {
                                            setFormData({ ...formData, order: e.target.value });
                                        }
                                    }}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold appearance-none"
                                >
                                    <option value="">Select Order</option>
                                    {orders.map(o => <option key={o._id} value={o._id}>#{o._id.slice(-6).toUpperCase()} - {o.customer?.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Invoice Type</label>
                                <div className="flex gap-2">
                                    {['Fish', 'Food'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: t })}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === t ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Invoice Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.invoiceNumber}
                                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Customer</label>
                                <select
                                    required
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold appearance-none"
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Line Items</label>
                            <button type="button" onClick={addItem} className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                                <Plus size={12} /> Add Item
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.items.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        placeholder="Item Name"
                                        className="flex-[2] px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500"
                                        value={item.name}
                                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        className="flex-[0.5] px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500 text-center"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-500"
                                        value={item.price}
                                        onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))}
                                    />
                                    <div className="flex-1 text-sm font-black text-gray-900 px-2">₹{item.total}</div>
                                    {formData.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(idx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">Total Billing Amount</div>
                        <div className="text-3xl font-black text-gray-900 flex items-center gap-1">
                            <IndianRupee size={24} />
                            {formData.totalAmount}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                        >
                            Generate
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default KoiInvoices;
