import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Calendar, 
    User, 
    Phone, 
    MessageCircle,
    ArrowRightCircle,
    Trash2
} from 'lucide-react';
import { getKoiEnquiries, createKoiEnquiry, updateKoiEnquiryStatus, deleteKoiEnquiry } from '../../services/api';
import Modal from '../../components/Modal';

const KoiEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        contact: '',
        requirement: '',
        notes: ''
    });

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const res = await getKoiEnquiries();
            setEnquiries(res.data);
        } catch (err) {
            console.error('Error fetching enquiries:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createKoiEnquiry(formData);
            fetchEnquiries();
            setIsModalOpen(false);
            setFormData({ customerName: '', contact: '', requirement: '', notes: '' });
        } catch (err) {
            console.error('Error creating enquiry:', err);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateKoiEnquiryStatus(id, status);
            fetchEnquiries();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this enquiry?')) {
            try {
                await deleteKoiEnquiry(id);
                fetchEnquiries();
            } catch (err) {
                console.error('Error deleting enquiry:', err);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic uppercase tracking-tight">Enquiries</h1>
                    <p className="text-gray-400 font-medium mt-1">Manage new and follow-up customer enquiries</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-orange-100 hover:-translate-y-1 active:scale-95"
                >
                    <Plus size={20} />
                    <span>ADD ENQUIRY</span>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search enquiries..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                    {enquiries.length > 0 ? enquiries.map((enquiry) => (
                        <div key={enquiry._id} className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-50 hover:border-orange-200 hover:bg-white hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    enquiry.status === 'New' ? 'bg-orange-100 text-orange-600' :
                                    enquiry.status === 'Follow-up' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {enquiry.status}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(enquiry._id)} className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-xl transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{enquiry.customerName}</h3>
                                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                                            <Phone size={10} />
                                            {enquiry.contact}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[80px]">
                                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 italic">Requirement</h4>
                                    <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">{enquiry.requirement}</p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(enquiry.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {enquiry.status !== 'Converted' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(enquiry._id, enquiry.status === 'New' ? 'Follow-up' : 'Converted')}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all group/btn"
                                            >
                                                <span>{enquiry.status === 'New' ? 'Follow-up' : 'Convert'}</span>
                                                <ArrowRightCircle size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                                <MessageCircle size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-400 uppercase italic tracking-widest">No enquiries found</h3>
                        </div>
                    )}
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="ADD NEW ENQUIRY"
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Customer Name</label>
                            <input 
                                type="text"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Contact Number</label>
                            <input 
                                type="text"
                                required
                                value={formData.contact}
                                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Requirement Details</label>
                        <textarea 
                            required
                            rows="4"
                            value={formData.requirement}
                            onChange={(e) => setFormData({...formData, requirement: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold resize-none"
                            placeholder="Describe fish or food requirement..."
                        ></textarea>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Internal Notes</label>
                        <input 
                            type="text"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                            placeholder="Optional follow-up notes"
                        />
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
                            Save Enquiry
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default KoiEnquiries;
