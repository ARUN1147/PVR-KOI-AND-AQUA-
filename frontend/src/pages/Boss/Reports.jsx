import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingCart, MessageSquare, AlertCircle, Calendar, Download, Filter } from 'lucide-react';

const BossReports = () => {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BarChart3 className="text-indigo-600" size={32} />
                            Strategic Global Reports
                        </h1>
                        <p className="text-gray-500 mt-1">Real-time business intelligence across all branches</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50 shadow-sm">
                            <Calendar size={18} />
                            Last 30 Days
                        </button>
                        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                            <Download size={18} />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <DollarSign size={80} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Revenue (Net)</p>
                        <h3 className="text-3xl font-bold text-gray-900">₹45,28,000</h3>
                        <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-sm">
                            <TrendingUp size={16} />
                            +12.4% vs last month
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShoppingCart size={80} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Combined Orders</p>
                        <h3 className="text-3xl font-bold text-gray-900">842</h3>
                        <p className="mt-4 text-gray-400 text-sm font-medium">Aqua: 512 | Koi: 330</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageSquare size={80} />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resolution Rate</p>
                        <h3 className="text-3xl font-bold text-gray-900">94.2%</h3>
                        <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full w-[94.2%]"></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Inventory Analysis */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Package size={20} className="text-indigo-600" />
                                Inventory Health
                            </h2>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">Full Audit</button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: 'Premium Fish Feed', stock: '24kg', status: 'Optimal', color: 'text-emerald-500' },
                                { name: 'Water Filter Cartridges', stock: '12 units', status: 'Low Stock', color: 'text-orange-500' },
                                { name: 'Aquarium Lighting Kit', stock: '2 units', status: 'Critical', color: 'text-red-500' },
                                { name: 'Koi Pellets (Growth)', stock: '45kg', status: 'Optimal', color: 'text-emerald-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                                    <span className="font-semibold text-gray-700">{item.name}</span>
                                    <div className="flex items-center gap-6">
                                        <span className="text-sm text-gray-500 font-bold">{item.stock}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${item.color}`}>{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Department Performance */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp size={20} className="text-indigo-600" />
                                Branch Efficiency
                            </h2>
                            <Filter size={18} className="text-gray-400 cursor-pointer" />
                        </div>
                        <div className="space-y-8 mt-4">
                            {[
                                { branch: 'Aqua Culture', metric: 'Sales Conversion', value: 78 },
                                { branch: 'Koi Centre', metric: 'Customer Satisfaction', value: 92 },
                                { branch: 'Services Dept', metric: 'Resolution Speed', value: 65 },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-2">
                                        <p className="font-bold text-gray-900">{item.branch}</p>
                                        <p className="text-xs font-bold text-gray-400 tracking-wider text-right">{item.metric}: <span className="text-indigo-600">{item.value}%</span></p>
                                    </div>
                                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-primary-500 h-full transition-all duration-1000 ease-out"
                                            style={{ width: `${item.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 p-6 bg-indigo-50 rounded-2xl flex items-center gap-4">
                            <AlertCircle className="text-indigo-600" size={24} />
                            <p className="text-sm font-medium text-indigo-700">Services Dept efficiency has dropped by 4% since last week. Consideration for additional training recommended.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BossReports;
