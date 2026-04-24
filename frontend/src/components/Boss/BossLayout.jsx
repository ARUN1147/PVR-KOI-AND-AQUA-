import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Package,
    MessageSquare,
    ShoppingCart,
    CheckSquare,
    Wrench,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    Droplets,
    Fish,
    Contact,
    FileText,
    CreditCard,
    Shield,
    BarChart3,
    Calendar,
    ChevronRight,
    Plus
} from 'lucide-react';

const SidebarIcon = ({ icon: Icon, path, label, active, onClick, expanded }) => (
    <Link
        to={path}
        onClick={onClick}
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
                layoutId="activeSide"
                className="absolute -right-4 w-1.5 h-8 bg-white rounded-l-full"
            />
        )}
    </Link>
);

const BossLayout = () => {
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const [searchQuery, setSearchQuery] = useState('');

    const [activeModule, setActiveModule] = useState(() => {
        if (location.pathname.includes('/koi')) return 'KOI';
        if (['/boss-dashboard', '/boss/users', '/boss/reports'].includes(location.pathname)) return 'MASTER';
        return 'AQUA';
    });

    useEffect(() => {
        if (location.pathname.includes('/koi')) {
            setActiveModule('KOI');
        } else if (['/boss-dashboard', '/boss/users', '/boss/reports'].includes(location.pathname)) {
            setActiveModule('MASTER');
        } else if (location.pathname === '/' || location.pathname.startsWith('/boss/')) {
            if (!['/boss/users', '/boss/reports'].includes(location.pathname)) {
                setActiveModule('AQUA');
            }
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('role');
        window.location.reload();
    };

    const modules = {
        MASTER: [
            { icon: Shield, label: 'Dashboard', path: '/boss-dashboard' },
            { icon: Users, label: 'Users', path: '/boss/users' },
            { icon: BarChart3, label: 'Reports', path: '/boss/reports' },
        ],
        AQUA: [
            { icon: LayoutDashboard, label: 'Stats', path: '/aqua-dashboard' },
            { icon: Users, label: 'Customers', path: '/boss/customers' },
            { icon: Package, label: 'Inventory', path: '/boss/inventory' },
            { icon: MessageSquare, label: 'Complaints', path: '/boss/complaints' },
            { icon: ShoppingCart, label: 'Orders', path: '/boss/orders' },
            { icon: CheckSquare, label: 'Tasks', path: '/boss/tasks' },
            { icon: Wrench, label: 'Services', path: '/boss/services' },
            { icon: Contact, label: 'Employees', path: '/boss/employees' },
            { icon: FileText, label: 'Invoices', path: '/boss/invoices' },
        ],
        KOI: [
            { icon: Fish, label: 'Dashboard', path: '/boss/koi/dashboard' },
            { icon: MessageSquare, label: 'Enquiries', path: '/boss/koi/enquiries' },
            { icon: ShoppingCart, label: 'Sales', path: '/boss/koi/orders' },
            { icon: CreditCard, label: 'Payments', path: '/boss/koi/payments' },
            { icon: Package, label: 'Inventory', path: '/boss/koi/inventory' },
            { icon: Users, label: 'Customers', path: '/boss/koi/customers' },
        ]
    };

    const currentItems = modules[activeModule];

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
                    <div className="w-full flex flex-col items-center gap-2">
                        {currentItems.map((item, idx) => (
                            <SidebarIcon
                                key={idx}
                                icon={item.icon}
                                path={item.path}
                                label={item.label}
                                active={location.pathname === item.path}
                                expanded={isHovered}
                            />
                        ))}
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

            {/* Main Wrapper */}
            <div className="flex-1 flex bg-[#F0F7FF] relative">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white m-4 rounded-[3rem] shadow-xl shadow-blue-900/5 relative">
                    {/* Top Header */}
                    <header className="h-20 flex items-center px-12 gap-8">
                        <div className="flex-1 relative max-w-xl group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2988FF] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full bg-[#F5F9FC] border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-2 focus:ring-[#2988FF]/50 transition-all text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Module Toggler (Moved to Header) */}
                        <div className="flex bg-[#F5F9FC] p-1.5 rounded-full shadow-inner border border-gray-100/50">
                            <button
                                onClick={() => { setActiveModule('MASTER'); navigate('/boss-dashboard'); }}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${activeModule === 'MASTER' ? 'bg-white text-[#2988FF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Shield size={18} />
                                <span className={`text-xs font-bold ${activeModule === 'MASTER' ? 'block' : 'hidden md:hidden lg:hidden'}`}>Master</span>
                            </button>
                            <button
                                onClick={() => { setActiveModule('AQUA'); navigate('/aqua-dashboard'); }}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${activeModule === 'AQUA' ? 'bg-white text-[#2988FF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Droplets size={18} />
                                <span className={`text-xs font-bold ${activeModule === 'AQUA' ? 'block' : 'hidden md:hidden lg:hidden'}`}>Aqua</span>
                            </button>
                            <button
                                onClick={() => { setActiveModule('KOI'); navigate('/boss/koi/dashboard'); }}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 ${activeModule === 'KOI' ? 'bg-white text-[#2988FF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Fish size={18} />
                                <span className={`text-xs font-bold ${activeModule === 'KOI' ? 'block' : 'hidden md:hidden lg:hidden'}`}>Koi</span>
                            </button>
                        </div>

                        {/* Profile Info */}
                        <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                            <div className="flex flex-col items-end">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{role === 'BOSS' ? 'PVR Boss' : 'General Manager'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#2988FF] flex items-center justify-center text-white font-bold shadow-sm">
                                {role?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Content */}
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

export default BossLayout;

