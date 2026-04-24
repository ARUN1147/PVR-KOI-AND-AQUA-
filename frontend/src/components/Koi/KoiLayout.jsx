import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Package,
    MessageSquare,
    ShoppingCart,
    CheckSquare,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    Fish,
    FileText,
    CreditCard,
    ChevronRight,
    Shield,
    Plus
} from 'lucide-react';

const SidebarIcon = ({ icon: Icon, path, label, active, expanded }) => (
    <Link
        to={path}
        className={`relative group flex items-center ${expanded ? 'justify-start px-4 gap-4 w-[90%]' : 'justify-center w-12'} h-12 rounded-2xl transition-all duration-300 ${active
            ? 'bg-white text-[#2988FF] shadow-lg'
            : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
    >
        <Icon size={24} strokeWidth={2} className="shrink-0" />
        {expanded && (
            <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-bold whitespace-nowrap overflow-hidden"
            >
                {label}
            </motion.span>
        )}
        {active && !expanded && (
            <motion.div
                layoutId="activeSideKoi"
                className="absolute -right-4 w-1.5 h-8 bg-white rounded-l-full"
            />
        )}
    </Link>
);

const KoiLayout = () => {
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const role = localStorage.getItem('role');
    const [searchQuery, setSearchQuery] = useState('');

    const getAllocatedModules = () => {
        try {
            return JSON.parse(localStorage.getItem('allocatedModules') || '[]');
        } catch (e) {
            return [];
        }
    };

    const allocatedModules = getAllocatedModules();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/koi/dashboard' },
        { icon: MessageSquare, label: 'Enquiries', path: '/koi/enquiries' },
        { icon: ShoppingCart, label: 'Sales & Billing', path: '/koi/orders' },
        { icon: CreditCard, label: 'Payments', path: '/koi/payments' },
        { icon: Package, label: 'Inventory', path: '/koi/inventory' },
        { icon: Users, label: 'Customers', path: '/koi/customers' },
    ].filter(item => {
        if (role === 'BOSS' || role === 'MANAGER' || role === 'KOI_MANAGER' || role === 'BRANCH_MANAGER') return true;
        return allocatedModules.includes(`Koi:${item.label}`);
    });

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-[#F0F7FF] overflow-hidden font-sans">
            {/* Sidebar (Expandable Blue Bar) */}
            <motion.aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{ width: isHovered ? 240 : 96 }}
                className="bg-[#2988FF] flex flex-col items-center py-8 gap-8 z-50 shadow-2xl transition-all duration-300"
            >
                <div className={`${isHovered ? 'w-48' : 'w-12'} h-12 px-2 flex items-center justify-center transition-all duration-300`}>
                    <img src="/PVR.png" alt="PVR" className="w-full h-full object-contain filter brightness-0 invert" />
                </div>

                <div className="flex-1 flex flex-col items-center gap-4 w-full">
                    {menuItems.map((item, idx) => (
                        <SidebarIcon
                            key={idx}
                            icon={item.icon}
                            path={item.path}
                            label={item.label}
                            active={location.pathname === item.path}
                            expanded={isHovered}
                        />
                    ))}

                    <div className="w-full flex flex-col items-center gap-2 mt-4 border-t border-white/10 pt-6">
                        <SidebarIcon icon={Users} path="#" label="Staff" active={false} expanded={isHovered} />
                        <SidebarIcon icon={Shield} path="#" label="Security" active={false} expanded={isHovered} />
                        <SidebarIcon icon={Plus} path="#" label="Add New" active={false} expanded={isHovered} />
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className={`flex items-center ${isHovered ? 'justify-start px-6 gap-4 w-[85%]' : 'justify-center w-12'} h-12 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white transition-all`}
                >
                    <LogOut size={24} className="shrink-0" />
                    {isHovered && <span className="text-sm font-bold">Logout</span>}
                </button>
            </motion.aside>

            {/* Content Wrapper */}
            <div className="flex-1 flex bg-[#F0F7FF] relative">
                <div className="flex-1 flex flex-col overflow-hidden bg-white m-4 rounded-[3rem] shadow-xl shadow-blue-900/5 relative">
                    <header className="h-20 flex items-center px-12 gap-8">
                        <div className="flex-1 relative max-w-xl group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2988FF] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search Koi database..."
                                className="w-full bg-[#F5F9FC] border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-2 focus:ring-[#2988FF]/50 transition-all text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                            <div className="flex flex-col items-end">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{role?.replace('_', ' ') || 'Koi Officer'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Koi Centre</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#2988FF] flex items-center justify-center text-white font-bold shadow-sm">
                                {role?.charAt(0) || 'K'}
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto custom-scrollbar px-12 pb-12">
                        <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2988FF]"></div></div>}>
                            <Outlet />
                        </React.Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default KoiLayout;
