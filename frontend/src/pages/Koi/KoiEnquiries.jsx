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
    Trash2,
    Wallet,
    Loader2,
    Eye,
    Edit3
} from 'lucide-react';
import { getKoiEnquiries, createKoiEnquiry, updateKoiEnquiryStatus, deleteKoiEnquiry, updateKoiEnquiry } from '../../services/api';
import Modal from '../../components/Modal';

const KoiEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        customerName: '',
        contact: '',
        requirement: '',
        notes: ''
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [enquiryToDelete, setEnquiryToDelete] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingEnquiry, setViewingEnquiry] = useState(null);

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await getKoiEnquiries();
            setEnquiries(res.data);
        } catch (err) {
            console.error('Error fetching enquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateKoiEnquiry(editingId, formData);
            } else {
                await createKoiEnquiry(formData);
            }
            fetchEnquiries();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving enquiry:', err);
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

    const handleAddClick = () => {
        setIsEditMode(false);
        setFormData({ customerName: '', contact: '', requirement: '', notes: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (enquiry) => {
        setFormData({
            customerName: enquiry.customerName,
            contact: enquiry.contact,
            requirement: enquiry.requirement,
            notes: enquiry.notes || ''
        });
        setEditingId(enquiry._id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (enquiry) => {
        setEnquiryToDelete(enquiry);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteKoiEnquiry(enquiryToDelete._id);
            fetchEnquiries();
            setIsDeleteModalOpen(false);
            setEnquiryToDelete(null);
        } catch (err) {
            console.error('Error deleting enquiry:', err);
        }
    };

    const handleViewClick = (enquiry) => {
        setViewingEnquiry(enquiry);
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingId(null);
        setFormData({ customerName: '', contact: '', requirement: '', notes: '' });
    };

    const filtered = enquiries.filter(enq =>
        enq.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.contact.includes(searchTerm) ||
        enq.requirement.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
                    <p className="text-gray-500 mt-1">Manage new and follow-up customer enquiries</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add Enquiry</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, contact or requirement..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-100 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Total Enquiries</span>
                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full font-bold">{enquiries.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50/50">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                <th className="px-8 py-6">Customer Info</th>
                                <th className="px-8 py-6">Requirement Details</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-orange-500" size={32} />
                                            <p className="text-gray-400 font-medium italic">Loading enquiries...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? filtered.map((enquiry) => (
                                <tr key={enquiry._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                                                {enquiry.customerName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{enquiry.customerName}</p>
                                                <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1.5">
                                                    <Phone size={12} className="text-gray-300" />
                                                    {enquiry.contact}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="max-w-xs">
                                            <p className="text-sm text-gray-700 line-clamp-2">{enquiry.requirement}</p>
                                            {enquiry.notes && <p className="text-[10px] text-gray-400 mt-1 italic font-medium">Note: {enquiry.notes}</p>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${enquiry.status === 'New' ? 'bg-orange-100 text-orange-600' :
                                            enquiry.status === 'Follow-up' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {enquiry.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">{new Date(enquiry.date).toLocaleDateString('en-GB')}</span>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase">{new Date(enquiry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {enquiry.status !== 'Converted' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(enquiry._id, enquiry.status === 'New' ? 'Follow-up' : 'Converted')}
                                                    className="p-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all h-10 flex items-center justify-center"
                                                    title={enquiry.status === 'New' ? 'Move to Follow-up' : 'Mark as Converted'}
                                                >
                                                    {enquiry.status === 'New' ? 'Follow-up' : 'Convert'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewClick(enquiry)}
                                                className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                title="View Enquiry"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(enquiry)}
                                                className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                                title="Edit Enquiry"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(enquiry)} 
                                                className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="Delete Enquiry"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <MessageCircle size={48} className="opacity-20" />
                                            <p className="font-medium italic">No enquiries match your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={isEditMode ? "EDIT ENQUIRY" : "ADD NEW ENQUIRY"}
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
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
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
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold resize-none"
                            placeholder="Describe fish or food requirement..."
                        ></textarea>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 italic">Internal Notes</label>
                        <input
                            type="text"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-semibold"
                            placeholder="Optional follow-up notes"
                        />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-100"
                        >
                            {isEditMode ? 'Save Changes' : 'Save Enquiry'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Enquiry Modal */}
            <Modal 
                isOpen={isViewModalOpen} 
                onClose={() => setIsViewModalOpen(false)} 
                title="ENQUIRY DETAILS" 
                maxWidth="max-w-2xl"
                accent="#f97316"
            >
                {viewingEnquiry && (
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-5 border-b border-gray-50 pb-6">
                            <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-900/20">
                                {viewingEnquiry.customerName[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase">
                                    {viewingEnquiry.customerName}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    <Phone size={14} className="text-orange-500" />
                                    {viewingEnquiry.contact}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <MessageCircle size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Requirement</span>
                                </div>
                                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                    {viewingEnquiry.requirement}
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <Calendar size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Status</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-700">Date:</span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(viewingEnquiry.date).toLocaleDateString('en-GB')} {new Date(viewingEnquiry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-700">Status:</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            viewingEnquiry.status === 'New' ? 'bg-orange-100 text-orange-600' :
                                            viewingEnquiry.status === 'Follow-up' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {viewingEnquiry.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {viewingEnquiry.notes && (
                            <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Internal Notes</span>
                                </div>
                                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                                    {viewingEnquiry.notes}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-end pt-4 border-t border-gray-50 gap-4">
                            <button
                                onClick={() => { setIsViewModalOpen(false); handleEditClick(viewingEnquiry); }}
                                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all uppercase tracking-widest"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-xs hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/10 uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                title="CONFIRM DELETION" 
                maxWidth="max-w-md"
                accent="#EF4444"
            >
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-100">
                        <Trash2 size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2 uppercase font-black">Are you sure?</h4>
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        Do you really want to delete enquiry for <span className="font-bold text-gray-800">{enquiryToDelete?.customerName}</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 hover:text-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default KoiEnquiries;
