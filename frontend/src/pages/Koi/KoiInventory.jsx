import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Package, 
    AlertCircle, 
    Edit3,
    IndianRupee
} from 'lucide-react';
import { getKoiStock, addKoiStock, updateKoiStock } from '../../services/api';
import Modal from '../../components/Modal';

const KoiInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        availableQuantity: '',
        lowStockThreshold: 5,
        price: '',
        unit: 'kg'
    });

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const res = await getKoiStock();
            setInventory(res.data);
        } catch (err) {
            console.error('Error fetching stock:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateKoiStock(editingItem._id, formData);
            } else {
                await addKoiStock(formData);
            }
            fetchStock();
            setIsModalOpen(false);
            setEditingItem(null);
            resetForm();
        } catch (err) {
            console.error('Error saving stock:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            itemName: '',
            description: '',
            availableQuantity: '',
            lowStockThreshold: 5,
            price: '',
            unit: 'kg'
        });
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            itemName: item.itemName,
            description: item.description,
            availableQuantity: item.availableQuantity,
            lowStockThreshold: item.lowStockThreshold,
            price: item.price,
            unit: item.unit
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic uppercase tracking-tight">Food Inventory</h1>
                    <p className="text-gray-400 font-medium mt-1">Manage fish food stock and low stock alerts</p>
                </div>
                <button 
                    onClick={() => { setEditingItem(null); resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-orange-100 hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} />
                    <span>ADD STOCK</span>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Item Details</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Stock Status</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Commercials</th>
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest italic border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {inventory.length > 0 ? inventory.map((item) => {
                                const isLow = item.availableQuantity <= item.lowStockThreshold;
                                return (
                                    <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 ${isLow ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'}`}>
                                                    <Package size={22} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 font-display uppercase tracking-tight">{item.itemName}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 mt-0.5 line-clamp-1 italic">{item.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>{item.availableQuantity}</span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.unit}</span>
                                                </div>
                                                {isLow && (
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase tracking-widest">
                                                        <AlertCircle size={10} /> Low Stock
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">₹{item.price}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Per {item.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleEdit(item)}
                                                className="p-3 hover:bg-gray-100 text-gray-400 hover:text-orange-600 rounded-xl transition-all"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                            <Package size={40} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-400 uppercase italic tracking-widest">No inventory items found</h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editingItem ? "EDIT STOCK ITEM" : "ADD NEW STOCK ITEM"}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Item Name</label>
                        <input 
                            type="text"
                            required
                            value={formData.itemName}
                            onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                            placeholder="e.g. Sinking Koi Pellets"
                        />
                    </div>
                    <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Description</label>
                            <textarea 
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold resize-none"
                                placeholder="Brief item details..."
                            ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Quantity</label>
                                <input 
                                    type="number"
                                    required
                                    value={formData.availableQuantity}
                                    onChange={(e) => setFormData({...formData, availableQuantity: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Unit</label>
                                <select 
                                    value={formData.unit}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                                >
                                    <option value="kg">kg</option>
                                    <option value="pkt">pkt</option>
                                    <option value="pcs">pcs</option>
                                </select>
                            </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Price (₹)</label>
                                <input 
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Low Stock Alert</label>
                                <input 
                                    type="number"
                                    required
                                    value={formData.lowStockThreshold}
                                    onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                                />
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
                            className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                        >
                            {editingItem ? 'Update Stock' : 'Add Stock'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default KoiInventory;
