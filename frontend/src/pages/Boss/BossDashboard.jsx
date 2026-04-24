import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Shield,
    Users,
    TrendingUp,
    DollarSign,
    Package,
    Activity,
    CheckSquare,
    ChevronRight,
    ArrowRight,
    Briefcase,
    Globe,
    Zap
} from 'lucide-react';

const StatCard = ({ label, sub, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center gap-6 hover:shadow-md transition-all cursor-pointer group"
    >
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900">{label}</h4>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{sub}</p>
        </div>
        <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
    </motion.div>
);

const BossDashboard = () => {
    return (
        <div className="py-6">
            {/* Banner Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#E6F0FF] rounded-[3rem] p-12 overflow-hidden mb-12"
            >
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold text-[#1a365d] mb-4 leading-tight">
                        PVR Command Centre <br />
                        <span className="text-[#2988FF]">Real-time Oversight</span>
                    </h1>
                    <p className="text-[#1a365d]/60 font-medium mb-8">
                        Manage PVR Aqua and PVR Koi operations from a single unified workspace.
                    </p>
                    <button className="bg-[#1a365d] text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
                        System Audit <ArrowRight size={16} />
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:flex items-center justify-center opacity-20">
                    <Shield size={240} className="text-[#2988FF]" />
                </div>
                <div className="absolute top-10 right-10 flex gap-4 opacity-50">
                    <div className="w-4 h-4 rounded-full bg-[#60A7FF]" />
                    <div className="w-4 h-4 rounded-full bg-blue-400" />
                </div>
            </motion.div>

            {/* Quick Access Grid */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Primary Modules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Aqua Management"
                        sub="Inventory & Shop"
                        icon={Briefcase}
                        color="bg-[#2988FF]"
                        delay={0.1}
                    />
                    <StatCard
                        label="Koi Centre"
                        sub="Enquiries & Sales"
                        icon={Globe}
                        color="bg-[#60A7FF]"
                        delay={0.2}
                    />
                    <StatCard
                        label="User Controls"
                        sub="Access & Permissions"
                        icon={Users}
                        color="bg-indigo-500"
                        delay={0.3}
                    />
                </div>
            </div>

            {/* Main Stats and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed (Large Area) */}
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        System Activity
                        <div className="ml-auto flex gap-2">
                            <button className="px-3 py-1 bg-white text-[10px] font-bold rounded-lg shadow-sm">Today</button>
                            <button className="px-3 py-1 bg-[#2988FF] text-white text-[10px] font-bold rounded-lg shadow-sm">7d</button>
                        </div>
                    </h3>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-50 shadow-sm relative min-h-[400px] flex flex-col justify-between overflow-hidden">
                        {/* Mock Graph Background */}
                        <div className="absolute inset-0 p-12 flex items-end justify-between opacity-10">
                            {[10, 30, 20, 50, 40, 60, 30].map((h, i) => (
                                <div key={i} className="w-8 bg-black rounded-t-xl" style={{ height: `${h}%` }} />
                            ))}
                        </div>

                        <div className="relative z-10 space-y-6">
                            {[
                                { title: 'New Aqua Order', val: '₹12,500', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { title: 'Koi Enquiry Resolved', val: '902', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
                                { title: 'Inventory Alert', val: 'Low Stock', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center ${item.color}`}>
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                        <p className="text-xs text-gray-400 font-medium tracking-tight">Active Operation</p>
                                    </div>
                                    <p className="font-bold text-black italic">{item.val}</p>
                                </div>
                            ))}
                        </div>

                        {/* Chart labels */}
                        <div className="relative z-10 flex justify-between text-[10px] font-bold text-gray-300 uppercase mt-auto pt-8 border-t border-gray-50">
                            <span>Monday</span>
                            <span>Tuesday</span>
                            <span>Wednesday</span>
                            <span>Thursday</span>
                            <span>Friday</span>
                            <span>Saturday</span>
                            <span>Sunday</span>
                        </div>
                    </div>
                </div>

                {/* Performance / Revenue */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Financials</h3>
                    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-50 shadow-sm flex flex-col items-center gap-6">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="#F0F7FF" strokeWidth="15" />
                                <circle cx="80" cy="80" r="70" fill="none" stroke="#2988FF" strokeWidth="15" strokeDasharray="440" strokeDashoffset="120" strokeLinecap="round" />
                                <circle cx="80" cy="80" r="70" fill="none" stroke="#60A7FF" strokeWidth="15" strokeDasharray="440" strokeDashoffset="380" strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Growth</p>
                                <p className="text-2xl font-bold italic">+24%</p>
                            </div>
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center bg-[#F0F7FF] p-4 rounded-2xl">
                                <span className="text-xs font-bold text-gray-500">Revenue</span>
                                <span className="font-bold">₹18.2L</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#F0F7FF] p-4 rounded-2xl">
                                <span className="text-xs font-bold text-gray-500">Customers</span>
                                <span className="font-bold">1,240</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BossDashboard;

