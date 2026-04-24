import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    Package,
    Fish,
    ArrowRight,
    CreditCard
} from 'lucide-react';
import { getKoiOrders, getPendingKoiPayments, getLowKoiStock } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col gap-4 hover:shadow-md transition-all group"
    >
        <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    </motion.div>
);

const KoiDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingPayments: 0,
        lowStockItems: 0,
        recentOrders: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [orders, pending, lowStock] = await Promise.all([
                    getKoiOrders(),
                    getPendingKoiPayments(),
                    getLowKoiStock()
                ]);
                setStats({
                    totalOrders: orders.data.length,
                    pendingPayments: pending.data.length,
                    lowStockItems: lowStock.data.length,
                    recentOrders: orders.data.slice(0, 5)
                });
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="py-6">
            {/* Banner */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#E6F0FF] rounded-[3rem] p-12 overflow-hidden mb-12"
            >
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold text-[#1a365d] mb-4 leading-tight">
                        Koi Hub <br />
                        <span className="text-[#2988FF]">Centre Operations</span>
                    </h1>
                    <p className="text-[#1a365d]/60 font-medium mb-8">
                        Track premium koi inventory, manage high-value sales & enquiries.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-[#1a365d] text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
                            New Sale <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:flex items-center justify-center opacity-20">
                    <Fish size={240} className="text-[#2988FF]" />
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    color="bg-orange-500"
                    delay={0.1}
                />
                <StatCard
                    title="Pending Payments"
                    value={stats.pendingPayments}
                    icon={CreditCard}
                    color="bg-red-500"
                    delay={0.2}
                />
                <StatCard
                    title="Low Stock"
                    value={stats.lowStockItems}
                    icon={AlertCircle}
                    color="bg-amber-500"
                    delay={0.3}
                />
                <StatCard
                    title="Customers"
                    value="124"
                    icon={Users}
                    color="bg-indigo-500"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="bg-white rounded-[2.5rem] p-4 border border-gray-50 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order, i) => (
                                    <motion.tr
                                        key={order._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="hover:bg-[#F0F7FF]/50 transition-all group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#E6F0FF] text-[#2988FF] flex items-center justify-center text-xs font-bold">
                                                    {order.customer?.name?.[0]}
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">{order.customer?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.totalAmount}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Alerts</h2>
                    <div className="space-y-4">
                        {stats.lowStockItems > 0 && (
                            <div className="p-6 bg-[#2988FF] rounded-[2rem] text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group">
                                <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                                    <Package size={100} />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Inventory</h4>
                                <p className="text-2xl font-bold mb-1">{stats.lowStockItems} Items Low</p>
                                <p className="text-[10px] font-medium opacity-70 leading-relaxed mb-4">Stock levels critically low across multiple koi varieties.</p>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Restock Now</button>
                            </div>
                        )}

                        <div className="p-6 bg-[#1a365d] rounded-[2rem] text-white shadow-lg shadow-blue-900/20 relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                                <Clock size={100} />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Finance</h4>
                            <p className="text-2xl font-bold mb-1">{stats.pendingPayments} Pending</p>
                            <p className="text-[10px] font-medium opacity-70 leading-relaxed mb-4">Follow up on high-value koi sales payments.</p>
                            <Link to="/koi/payments" className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-center">Open Payments</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KoiDashboard;
