import React, { useState, useEffect } from 'react';
import { 
    Users, 
    ShoppingCart, 
    TrendingUp, 
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    Package
} from 'lucide-react';
import { getKoiOrders, getPendingKoiPayments, getLowKoiStock } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-2xl ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'} bg-gray-50 px-3 py-1 rounded-full`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trendValue}
                </div>
            )}
        </div>
        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest italic ml-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-display italic tracking-tight uppercase">Dashboard</h1>
                    <p className="text-gray-400 font-medium mt-1">Real-time overview of your Koi Centre operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 w-10 rounded-full border-4 border-gray-50 bg-gray-200 overflow-hidden shadow-sm">
                                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                            </div>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest italic ml-2">3 Managers Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Orders" 
                    value={stats.totalOrders} 
                    icon={ShoppingCart} 
                    trend="up" 
                    trendValue="+12%" 
                    color="bg-orange-500"
                />
                <StatCard 
                    title="Pending Payments" 
                    value={stats.pendingPayments} 
                    icon={Clock} 
                    trend="down" 
                    trendValue="-5%" 
                    color="bg-red-500"
                />
                <StatCard 
                    title="Low Stock Items" 
                    value={stats.lowStockItems} 
                    icon={AlertCircle} 
                    color="bg-amber-500"
                />
                <StatCard 
                    title="Top Customers" 
                    value="124" 
                    icon={Users} 
                    trend="up" 
                    trendValue="+8%" 
                    color="bg-indigo-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-lg shadow-gray-200">
                                <TrendingUp size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 font-display italic uppercase">Recent Activity</h2>
                        </div>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Order ID</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Customer</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Status</th>
                                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest italic border-b border-gray-100">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-gray-900 font-display">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                                                    {order.customer?.name?.[0].toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-600">{order.customer?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Completed' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-gray-900">₹{order.totalAmount}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-gray-400 italic">No recent orders found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 font-display italic uppercase mb-6 flex items-center gap-3">
                        <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-100">
                            <AlertCircle size={20} />
                        </div>
                        Critical Alerts
                    </h2>
                    <div className="space-y-4">
                        {stats.lowStockItems > 0 && (
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4 group hover:bg-amber-100 transition-colors duration-300">
                                <div className="p-2 bg-amber-500 rounded-xl text-white shadow-md">
                                    <Package size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight italic">Low Stock Warning</h4>
                                    <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">{stats.lowStockItems} items are below the threshold. Restock soon to avoid disruptions.</p>
                                </div>
                            </div>
                        )}
                        {stats.pendingPayments > 0 && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 group hover:bg-red-100 transition-colors duration-300">
                                <div className="p-2 bg-red-500 rounded-xl text-white shadow-md">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-red-900 uppercase tracking-tight italic">Pending Payments</h4>
                                    <p className="text-xs text-red-700 font-medium mt-1 leading-relaxed">{stats.pendingPayments} orders have overdue payments. Follow up with customers.</p>
                                </div>
                            </div>
                        )}
                        <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 text-white/10 group-hover:scale-125 transition-transform duration-700">
                                <ArrowUpRight size={120} />
                            </div>
                            <h4 className="text-lg font-bold font-display italic uppercase">Premium Feature</h4>
                            <p className="text-sm text-indigo-100 mt-2 font-medium leading-relaxed">Unlock advanced AI-powered sales forecasting and customer insights.</p>
                            <button className="mt-4 px-6 py-2 bg-white text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors">Upgrade Now</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KoiDashboard;
