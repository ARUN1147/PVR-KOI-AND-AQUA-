import React, { useState } from 'react';
import { Droplets, Mail, Lock, ArrowRight, ShieldCheck, Users, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await login({ email: loginId, password });
            const { token, role, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('isAuthenticated', 'true');
            if (user?.allocatedModules) {
                localStorage.setItem('allocatedModules', JSON.stringify(user.allocatedModules));
            } else {
                localStorage.setItem('allocatedModules', JSON.stringify([]));
            }

            if (onLogin) onLogin(role, user?.allocatedModules || []);

            // Role-based redirection
            if (role === 'BOSS') {
                navigate('/boss-dashboard');
            } else if (role === 'KOI_MANAGER') {
                navigate('/koi/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert(err.response?.data?.message || 'Invalid credentials or server error');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 md:p-8 font-sans">
            {/* Main Container */}
            <div className="w-full max-w-6xl aspect-[16/10] bg-white rounded-[2.5rem] shadow-3d overflow-hidden flex flex-col md:flex-row">

                {/* Left Side: Full Video Branding */}
                <div className="hidden md:flex flex-1 relative overflow-hidden group">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    >
                        <source src="/koi.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Overlay Gradient for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2988FF]/60 via-transparent to-black/20"></div>

                    {/* Branding Text Overlaid */}
                    <div className="relative z-10 mt-auto p-12 text-center w-full">
                        <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-2xl">PVR AQUA & KOI</h2>
                        <p className="text-white/90 mt-3 font-semibold text-lg drop-shadow-lg">Experience management in motion</p>
                        <div className="mt-6 mx-auto w-16 h-1.5 bg-white rounded-full opacity-50"></div>
                    </div>

                    {/* Floating Decorative Elements (Subtle) */}
                    <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center bg-white">
                    <div className="w-full max-w-sm">

                        {/* PVR Logo Branding */}
                        <div className="flex flex-col items-center mb-10">
                            <img
                                src="/PVR.png"
                                alt="PVR Logo"
                                className="h-28 w-auto mb-4 object-contain"
                            />
                            <div className="h-1 w-16 bg-[#2988FF] rounded-full"></div>
                        </div>

                        <div className="mb-10 text-center">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Workspace Login</h1>
                            <p className="text-gray-500 font-medium text-sm italic">Manage your aquatic empire securely</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-1">
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2988FF] transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#2988FF] focus:bg-white outline-none transition-all font-semibold text-gray-900"
                                        placeholder="Manager ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2988FF] transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#2988FF] focus:bg-white outline-none transition-all font-semibold text-gray-900"
                                        placeholder="Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2988FF] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-[#2988FF] hover:bg-[#1C6ED9] text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] mt-4"
                            >
                                Enter Workspace
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-sm text-gray-400 font-medium">
                                Secured by <span className="text-[#2988FF] font-bold">PVR Systems</span>
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

