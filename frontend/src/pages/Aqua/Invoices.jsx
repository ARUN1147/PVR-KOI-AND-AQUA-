import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Download,
    Printer,
    Mail,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Eye,
    Plus,
    Trash2,
    Pencil
} from 'lucide-react';

import { getOrders, getCustomers, getProducts, createOrder, updateOrderStatus, updatePayment } from '../../services/api';
import Modal from '../../components/Modal';

// Helper for Total in Words
const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if ((n = n.toString()).length > 9) return 'overflow';
        let nArray = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!nArray) return '';
        let str = '';
        str += (nArray[1] != 0) ? (a[Number(nArray[1])] || b[nArray[1][0]] + ' ' + a[nArray[1][1]]) + 'Crore ' : '';
        str += (nArray[2] != 0) ? (a[Number(nArray[2])] || b[nArray[2][0]] + ' ' + a[nArray[2][1]]) + 'Lakh ' : '';
        str += (nArray[3] != 0) ? (a[Number(nArray[3])] || b[nArray[3][0]] + ' ' + a[nArray[3][1]]) + 'Thousand ' : '';
        str += (nArray[4] != 0) ? (a[Number(nArray[4])] || b[nArray[4][0]] + ' ' + a[nArray[4][1]]) + 'Hundred ' : '';
        str += (nArray[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(nArray[5])] || b[nArray[5][0]] + ' ' + a[nArray[5][1]]) + 'Only ' : 'Only';
        return str;
    };
    return inWords(Math.floor(num));
};


const Invoices = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('invoices'); // 'invoices' or 'quotations'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState({ status: '', paidAmount: 0 });

    // New Invoice Form State
    const [newInvoice, setNewInvoice] = useState({
        customerId: '',
        items: [{ productId: '', quantity: 1, price: 0 }],
        status: 'Completed',
        paidAmount: 0,
        taxPhase: 'Inside TN'
    });

    useEffect(() => {
        fetchInvoices();
        loadFormData();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await getOrders();
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrder = async (e) => {
        e.preventDefault();
        try {
            // First update status
            await updateOrderStatus(selectedOrder._id, editFormData.status);
            // Then update payment - allows sequential save() on backend to avoid version errors
            await updatePayment(selectedOrder._id, editFormData.paidAmount);
            
            setIsEditMode(false);
            fetchInvoices();
        } catch (err) {
            console.error("Order Update Error:", err);
            alert('Error updating order: ' + (err.response?.data?.message || err.message));
        }
    };

    const loadFormData = async () => {
        try {
            const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
            setCustomers(custRes.data);
            setProducts(prodRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            const totalAmount = newInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            const orderData = {
                ...newInvoice,
                totalAmount,
                // If it's a quotation, we can allow partial paidAmount (advance) or 0
                // If it's a quick invoice, we assume fully paid
                paidAmount: newInvoice.status === 'Quotation' ? (newInvoice.paidAmount || 0) : totalAmount,
                status: newInvoice.status || 'Completed'
            };
            await createOrder(orderData);
            setIsCreateModalOpen(false);
            setNewInvoice({ customerId: '', items: [{ productId: '', quantity: 1, price: 0 }], status: 'Completed', paidAmount: 0, taxPhase: 'Inside TN' });
            fetchInvoices();
        } catch (err) {
            alert('Error creating invoice');
        }
    };

    const addItem = () => {
        setNewInvoice({ ...newInvoice, items: [...newInvoice.items, { productId: '', quantity: 1, price: 0 }] });
    };

    const updateItem = (index, field, value) => {
        const updatedItems = [...newInvoice.items];
        updatedItems[index][field] = value;

        if (field === 'productId') {
            const product = products.find(p => p._id === value);
            if (product) updatedItems[index].price = product.price;
        }

        setNewInvoice({ ...newInvoice, items: updatedItems });
    };

    const handleViewInvoice = (order) => {
        setSelectedOrder(order);
        setIsInvoiceModalOpen(true);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Dispatched': return 'bg-blue-100 text-blue-700';
            case 'Ready for Dispatch': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filtered = orders.filter(o => {
        const matchesSearch = (o.customerId?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                             (o._id?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const isQuotation = o.status === 'Quotation';
        
        if (viewMode === 'quotations') return matchesSearch && isQuotation;
        return matchesSearch && !isQuotation;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-display">Invoice Manager</h1>
                    <p className="text-gray-500 mt-1">Generate, track, and manage customer billing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mr-4">
                        <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); setViewMode('invoices'); }}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'invoices' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Invoices
                        </button>
                        <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); setViewMode('quotations'); }}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'quotations' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Quotations
                        </button>
                    </div>
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-bold text-gray-400 uppercase">Outstanding</span>
                        <span className="text-xl font-bold text-red-500">
                            ₹{orders.filter(o => o.status !== 'Quotation').reduce((acc, o) => acc + ((o.totalAmount || 0) - (o.paidAmount || 0)), 0).toLocaleString()}
                        </span>
                    </div>
                    <button onClick={() => { 
                        setNewInvoice({ ...newInvoice, status: viewMode === 'quotations' ? 'Quotation' : 'Completed', taxPhase: 'Inside TN' });
                        setIsCreateModalOpen(true); 
                    }} className="btn-primary">
                        <FileText size={18} />
                        <span>{viewMode === 'quotations' ? 'New Quotation' : 'Quick Invoice'}</span>
                    </button>
                </div>

            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer name or Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                    <p className="text-gray-400 font-medium italic">Loading invoices...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Info</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 leading-none">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium mt-1">
                                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-primary-600">#{order._id.slice(-6).toUpperCase()}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate w-32">
                                                {order.items?.[0]?.productId?.name || 'Service Order'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{order.customerId?.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">₹{(order.totalAmount || 0).toLocaleString()}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-1 ${
                                                order.paidAmount >= order.totalAmount ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                                {order.paidAmount >= order.totalAmount ? 'Fully Paid' : `Pending ₹${((order.totalAmount || 0) - (order.paidAmount || 0)).toLocaleString()}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleViewInvoice(order)}
                                                className="p-2 hover:bg-primary-50 rounded-lg text-gray-400 hover:text-primary-600 transition-all"
                                                title="View/Print"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsEditMode(true);
                                                    setEditFormData({
                                                        status: order.status,
                                                        paidAmount: order.paidAmount
                                                    });
                                                }}
                                                className="p-2 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-all"
                                                title="Edit Status/Payment"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
                            <FileText size={48} className="text-gray-200 mb-4" />
                            <p className="text-gray-400 italic font-medium">No invoice records found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Quick Invoice Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title={newInvoice.status === 'Quotation' ? 'New Quotation' : 'Generate Quick Invoice'} maxWidth="max-w-3xl">
                <form onSubmit={handleCreateInvoice} className="flex flex-col max-h-[80vh]">
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                        {/* Customer Selection Card */}
                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Plus size={16} className="text-primary-600" />
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Customer Details</h4>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Select Existing Customer</label>
                                <select
                                    required className="input-field bg-white"
                                    value={newInvoice.customerId}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, customerId: e.target.value })}
                                >
                                    <option value="">-- Choose Customer --</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Product Items Card */}
                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Plus size={16} className="text-primary-600" />
                                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Invoice Items</h4>
                                </div>
                                <button type="button" onClick={addItem} className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-100 transition-colors flex items-center gap-1.5">
                                    <Plus size={14} /> Add Item
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {newInvoice.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-4 items-end bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-primary-200">
                                        <div className="col-span-12 md:col-span-5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Product / Service</label>
                                            <select
                                                required className="input-field py-2 text-sm"
                                                value={item.productId}
                                                onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                                            >
                                                <option value="">Select Product</option>
                                                {products.map(p => (
                                                    <option key={p._id} value={p._id} disabled={p.stock <= 0}>
                                                        {p.name} {p.hsnSac ? `(HSN: ${p.hsnSac})` : ''} - ₹{p.price}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block text-center">HSN/SAC</label>
                                            <div className="input-field py-2 text-sm text-center bg-gray-50 text-gray-400 font-bold h-[38px] flex items-center justify-center">
                                                {products.find(p => p._id === item.productId)?.hsnSac || 'N/A'}
                                            </div>
                                        </div>

                                        <div className="col-span-4 md:col-span-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block text-center">Qty</label>
                                            <input
                                                type="number" required min="1" className="input-field py-2 text-sm text-center"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block">Unit Price</label>
                                            <input
                                                type="number" required className="input-field py-2 text-sm"
                                                value={item.price}
                                                onChange={(e) => updateItem(idx, 'price', Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setNewInvoice({ ...newInvoice, items: newInvoice.items.filter((_, i) => i !== idx) })}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tax Phase & Payment Card */}
                        <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Plus size={16} className="text-primary-600" />
                                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Tax & Additional Details</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-500 ml-1">Taxation Phase</label>
                                    <div className="flex flex-col gap-2">
                                        <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${newInvoice.taxPhase === 'Inside TN' ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-500/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                            <input 
                                                type="radio" 
                                                name="taxPhase" 
                                                className="accent-primary-600 w-4 h-4"
                                                checked={newInvoice.taxPhase === 'Inside TN'} 
                                                onChange={() => setNewInvoice({ ...newInvoice, taxPhase: 'Inside TN' })} 
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${newInvoice.taxPhase === 'Inside TN' ? 'text-primary-700' : 'text-gray-700'}`}>Inside TN</span>
                                                <span className="text-[10px] text-gray-400 font-medium">9% CGST + 9% SGST</span>
                                            </div>
                                        </label>
                                        <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${newInvoice.taxPhase === 'Outside TN' ? 'bg-primary-50 border-primary-200 ring-2 ring-primary-500/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                                            <input 
                                                type="radio" 
                                                name="taxPhase" 
                                                className="accent-primary-600 w-4 h-4"
                                                checked={newInvoice.taxPhase === 'Outside TN'} 
                                                onChange={() => setNewInvoice({ ...newInvoice, taxPhase: 'Outside TN' })} 
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold ${newInvoice.taxPhase === 'Outside TN' ? 'text-primary-700' : 'text-gray-700'}`}>Outside TN</span>
                                                <span className="text-[10px] text-gray-400 font-medium">18% IGST</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {newInvoice.status === 'Quotation' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Advance Payment (Optional)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                            <input
                                                type="number"
                                                className="input-field pl-8 py-3 bg-white text-lg font-bold"
                                                placeholder="0.00"
                                                value={newInvoice.paidAmount}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, paidAmount: Number(e.target.value) })}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 italic font-medium ml-1">Record advance received for this quotation.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Container */}
                    <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between flex-shrink-0 shadow-2xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total Amount</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-gray-400">₹</span>
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">
                                    {newInvoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                             <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 text-gray-400 font-bold text-sm uppercase hover:text-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary px-10 py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-200">
                                {newInvoice.status === 'Quotation' ? 'Save Quotation' : 'Confirm & Generate'}
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Premium Invoice Modal */}
            <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Tax Invoice" maxWidth="max-w-3xl">
                {selectedOrder && (
                    <div className="bg-white rounded-lg overflow-hidden flex flex-col">
                        <div id="printable-invoice" className="p-8 space-y-6 bg-white min-h-[900px] flex flex-col">
                             <div className="flex justify-between items-center border-b-[3px] border-[#1e3a8a] pb-2 mb-4 uppercase italic">
                                <span className="text-[11px] font-black text-[#1e3a8a] tracking-[0.2em]">Original Tax Invoice</span>
                                <span className="text-[9px] font-bold text-gray-400 tracking-widest leading-none">High-Tech Aquaculture Management System</span>
                             </div>
                            
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start pb-4 gap-4 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                                    <h1 className="text-[100px] font-black text-[#1e3a8a] -rotate-12">INVOICE</h1>
                                </div>

                                <div className="space-y-2 z-10">
                                    <h2 className="text-2xl font-black text-[#1e3a8a] tracking-tight leading-none mb-1">PVR AQUACULTURE</h2>
                                    <div className="text-[9px] text-gray-500 font-bold leading-relaxed max-w-[300px] uppercase tracking-wide">
                                        334E, KUMARAN NAGAR, ILLUPUR TALUK,<br />
                                        Perumanadu, Pudukkottai, Tamil Nadu, 622104<br />
                                        <div className="flex gap-4 mt-2 border-t border-gray-100 pt-2">
                                            <span>Phone: +91 9600124725</span>
                                            <span>GSTIN : 33CQRPA2571H1ZW</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:text-right flex flex-col items-end gap-2 z-10">
                                    <div className="border-2 border-[#1e3a8a] text-[10px] font-black overflow-hidden rounded-xl shadow-lg shadow-blue-50 bg-white">
                                        <div className="flex border-b-2 border-[#1e3a8a]">
                                            <span className="bg-[#1e3a8a] text-white px-2.5 py-1 w-24 text-left uppercase italic">Invoice No.</span>
                                            <span className="px-2.5 py-1 w-32 text-left text-gray-900 tracking-widest">#{selectedOrder._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <div className="flex bg-gray-50/50">
                                            <span className="bg-gray-100 text-[#1e3a8a] px-2.5 py-1 border-r-2 border-[#1e3a8a] w-24 text-left uppercase italic">Date</span>
                                            <span className="px-2.5 py-1 w-32 text-left font-black">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <img src="/PVR.png" alt="PVR Logo" className="w-40 h-auto object-contain" />
                                </div>
                            </div>

                             {/* Billing Info */}
                            <div className="flex flex-col gap-1 items-center bg-gray-50/50 p-5 rounded-xl border-2 border-dashed border-gray-200">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1 italic">Billed To</span>
                                <h3 className="text-base font-black text-gray-900 uppercase leading-tight tracking-tight">{selectedOrder.customerId?.name}</h3>
                                <p className="text-[10px] text-gray-500 font-bold leading-relaxed max-w-[450px] text-center uppercase tracking-wide">
                                    {selectedOrder.customerId?.address || 'No Address Provided'}
                                </p>
                                <div className="flex gap-4 mt-2 text-[10px] font-black text-[#1e3a8a] bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                                    <span className="flex items-center gap-1 opacity-70">PH: <span className="text-gray-900 tracking-wider font-bold">{selectedOrder.customerId?.phone}</span></span>
                                    {selectedOrder.customerId?.gstNo && <span className="flex items-center gap-1 border-l border-gray-200 pl-4 opacity-70">GSTIN: <span className="text-gray-900 tracking-wider font-bold">{selectedOrder.customerId?.gstNo}</span></span>}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="flex-grow">
                                <table className="w-full border-collapse border-2 border-gray-900 rounded-xl overflow-hidden shadow-sm">
                                    <thead>
                                        <tr className="bg-gray-900 text-white">
                                            <th className="py-3 px-3 text-[9px] font-black uppercase tracking-widest text-left w-14">SL#</th>
                                            <th className="py-3 px-3 text-[9px] font-black uppercase tracking-widest text-left">ITEM DESCRIPTION</th>
                                            <th className="py-3 px-3 text-[9px] font-black uppercase tracking-widest text-center w-28">HSN/SAC</th>
                                            <th className="py-3 px-3 text-[9px] font-black uppercase tracking-widest text-center w-16">QTY</th>
                                            <th className="py-3 px-3 text-[9px] font-black uppercase tracking-widest text-right w-32">UNIT PRICE</th>
                                            <th className="py-3 px-3 text-[9px] font-black uppercase tracking-widest text-right w-32">AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-gray-100 italic">
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item, idx) => (
                                                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} h-11`}>
                                                    <td className="px-3 py-1.5 text-[11px] font-bold text-gray-400 text-center">{String(idx + 1).padStart(2, '0')}</td>
                                                    <td className="px-3 py-1.5 text-[11px] font-black text-gray-800 uppercase tracking-tight">{item.productId?.name || 'Order Item'}</td>
                                                    <td className="px-3 py-1.5 text-[11px] font-bold text-gray-500 text-center tracking-widest">{item.productId?.hsnSac || '—'}</td>
                                                    <td className="px-3 py-1.5 text-[11px] font-black text-gray-900 text-center">{item.quantity}</td>
                                                    <td className="px-3 py-1.5 text-[11px] font-bold text-gray-500 text-right">₹{item.price?.toLocaleString()}</td>
                                                    <td className="px-3 py-1.5 text-[12px] font-black text-gray-900 text-right">₹{(item.quantity * item.price).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                             <tr className="h-11">
                                                <td className="px-3 py-1.5 text-[11px] font-bold text-gray-400 text-center">01</td>
                                                <td className="px-3 py-1.5 text-[11px] font-black text-gray-800 uppercase tracking-tight">Service/Custom Order</td>
                                                <td className="px-3 py-1.5 text-[11px] font-bold text-gray-500 text-center">—</td>
                                                <td className="px-3 py-1.5 text-[11px] font-black text-gray-900 text-center">1</td>
                                                <td className="px-3 py-1.5 text-[11px] font-bold text-gray-500 text-right">₹{(selectedOrder.totalAmount || 0).toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-[12px] font-black text-gray-900 text-right">₹{(selectedOrder.totalAmount || 0).toLocaleString()}</td>
                                            </tr>
                                        )}
                                        {/* Whitespace rows */}
                                        {[...Array(Math.max(0, 5 - (selectedOrder.items?.length || 1)))].map((_, i) => (
                                            <tr key={`empty-${i}`} className="h-11 border-0">
                                                <td className="border-0"></td>
                                                <td className="border-0"></td>
                                                <td className="border-0"></td>
                                                <td className="border-0"></td>
                                                <td className="border-0"></td>
                                                <td className="border-0"></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals Section */}
                            <div className="flex flex-col pt-4 gap-4">
                                <div className="ml-auto w-full md:w-[380px] space-y-1.5">
                                    <div className="flex justify-between items-center py-2 px-4 border-b border-gray-100">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transport & Installation</span>
                                        <span className="text-[11px] font-black text-gray-900 italic">₹0.00</span>
                                    </div>
                                    {selectedOrder.taxPhase === 'Outside TN' ? (
                                        <div className="flex justify-between items-center py-2 px-4 border-b border-gray-100">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">IGST (18% Output)</span>
                                            <span className="text-[11px] font-black text-gray-900 italic">₹{((selectedOrder.totalAmount || 0) - ((selectedOrder.totalAmount || 0) / 1.18)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center py-2 px-4 border-b border-gray-100">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">CGST (09% Output)</span>
                                                <span className="text-[11px] font-black text-gray-900 italic">₹{(((selectedOrder.totalAmount || 0) - ((selectedOrder.totalAmount || 0) / 1.18)) / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 px-4 border-b border-gray-100">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">SGST (09% Output)</span>
                                                <span className="text-[11px] font-black text-gray-900 italic">₹{(((selectedOrder.totalAmount || 0) - ((selectedOrder.totalAmount || 0) / 1.18)) / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between items-center py-3 px-6 bg-[#1e3a8a] rounded-xl text-white shadow-2xl shadow-blue-100 mt-4 transform translate-x-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Total Amount</span>
                                        <span className="text-xl font-black italic">₹{(selectedOrder.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <div className="text-center py-4 border-t-2 border-dashed border-gray-200 mt-2">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-1">Total Amount in Words</p>
                                    <p className="text-xs font-black text-[#1e3a8a] uppercase italic tracking-tight">{numberToWords(selectedOrder.totalAmount || 0)}</p>
                                </div>
                            </div>

                            {/* Bank & Signature */}
                             <div className="border-2 border-gray-900 rounded-2xl overflow-hidden shadow-2xl shadow-blue-50 mt-6">
                                <div className="grid grid-cols-12 italic min-h-[160px]">
                                    <div className="col-span-12 md:col-span-7 border-r-2 border-gray-900">
                                        <div className="bg-gray-900 px-4 py-2">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Digital Payment Gateway Details</span>
                                        </div>
                                        <div className="grid grid-cols-12 text-[11px] font-black">
                                            <div className="col-span-4 px-4 py-2 border-b-2 border-r-2 border-gray-50 uppercase text-gray-400">Account No</div>
                                            <div className="col-span-8 px-4 py-2 border-b-2 border-gray-50 text-[#1e3a8a] tracking-[0.2em]">7037881010</div>
                                            <div className="col-span-4 px-4 py-2 border-b-2 border-r-2 border-gray-50 uppercase text-gray-400">IFSC Code</div>
                                            <div className="col-span-8 px-4 py-2 border-b-2 border-gray-50 text-[#1e3a8a] tracking-[0.2em]">IDIB000N140</div>
                                            <div className="col-span-4 px-4 py-2 border-b-2 border-r-2 border-gray-50 uppercase text-gray-400">Bank Name</div>
                                            <div className="col-span-8 px-4 py-2 border-b-2 border-gray-50 uppercase">INDIAN BANK</div>
                                            <div className="col-span-4 px-4 py-2 border-r-2 border-gray-50 uppercase text-gray-400">Branch</div>
                                            <div className="col-span-8 px-4 py-2 uppercase">NATHAMPANNAI</div>
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-5 flex flex-col bg-gray-50/30">
                                        <div className="bg-gray-100/50 border-b-2 border-gray-900 px-4 py-2 md:text-right">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Signatory</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center p-6">
                                            <p className="text-[9px] font-black text-gray-300 uppercase mb-4 tracking-tighter italic opacity-50">Electronically Verified for</p>
                                            <span className="text-xs font-black text-[#1e3a8a] uppercase tracking-widest">PVR AQUACULTURE</span>
                                            <div className="w-4/5 border-b-2 border-gray-900/10 mt-2"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Tagline */}
                            <div className="text-center pt-6 border-t-2 border-gray-50 mt-auto">
                                <p className="text-[12px] font-black text-[#1e3a8a] italic tracking-[0.2em] uppercase opacity-30">✦ Global Standards in Aquaculture Technology ✦</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">Certified Quality & Professional Support</p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-6 bg-gray-50 border-t-2 border-gray-100 flex justify-center items-center no-print gap-6">
                            <button 
                                onClick={handlePrint} 
                                className="group relative flex items-center gap-3 px-8 py-3 bg-[#1e3a8a] text-white rounded-xl font-black text-sm hover:bg-[#1e40af] transition-all shadow-2xl shadow-blue-200 uppercase tracking-widest overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <Printer size={18} className="relative z-10" /> <span className="relative z-10">Print Record</span>
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="flex items-center gap-3 px-8 py-3 bg-white border-3 border-[#1e3a8a] text-[#1e3a8a] rounded-xl font-black text-sm hover:bg-gray-50 transition-all uppercase tracking-widest shadow-xl shadow-gray-100"
                            >
                                <Download size={18} /> Export PDF
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


            {/* Edit Order Modal */}
            <Modal isOpen={isEditMode} onClose={() => setIsEditMode(false)} title="Update Order Status / Payment" maxWidth="max-w-md">
                <form onSubmit={handleUpdateOrder} className="space-y-6 flex flex-col p-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order Status</label>
                        <select 
                            className="input-field"
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        >
                            <option value="Quotation">Quotation</option>
                            <option value="In Production">In Production</option>
                            <option value="Ready for Dispatch">Ready for Dispatch</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</label>
                        <div className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                            ₹{(selectedOrder?.totalAmount || 0).toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paid Amount (Current: ₹{(selectedOrder?.paidAmount || 0).toLocaleString()})</label>
                        <input 
                            type="number"
                            className="input-field"
                            value={editFormData.paidAmount}
                            onChange={(e) => setEditFormData({ ...editFormData, paidAmount: Number(e.target.value) })}
                        />
                        <p className="text-[10px] text-gray-400 italic">Updating this will overwrite the total paid amount.</p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 flex-shrink-0 mt-auto">
                        <button type="button" onClick={() => setIsEditMode(false)} className="px-4 py-2 text-gray-400 font-bold text-xs uppercase hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="btn-primary py-2 px-6 text-xs uppercase tracking-widest shadow-lg shadow-primary-100 transition-all hover:scale-105 active:scale-95">Save Changes</button>
                    </div>
                </form>
            </Modal>
            
            <style>
                {`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    main { padding: 0 !important; }
                    header, aside { display: none !important; }
                    #printable-invoice { padding: 0 !important; width: 100% !important; margin: 0 !important; }
                }
                `}
            </style>
        </div>
    );
};

export default Invoices;
