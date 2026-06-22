import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, ShieldCheck, ShieldAlert } from 'lucide-react';

const Navbar = ({ currentRole, setRole }) => {
    const location = useLocation();

    const navLinks = [
        { path: '/investor', label: 'Investor View', role: 'INVESTOR', icon: <User className="w-4 h-4" /> },
        { path: '/l1-maker', label: 'L1 Maker View', role: 'ADMIN_L1', icon: <ShieldAlert className="w-4 h-4" /> },
        { path: '/l2-checker', label: 'L2 Checker View', role: 'ADMIN_L2', icon: <ShieldCheck className="w-4 h-4" /> }
    ];

    const handleNavClick = (role) => {
        setRole(role);
    };

    return (
        <nav className="glass-panel sticky top-0 z-50 border-b border-kfintech-border/50">
            <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                
                {/* Brand Logo */}
                <div className="flex items-center gap-3">
                    <div className="bg-kfintech-primary/10 p-2 rounded-lg border border-kfintech-primary/30">
                        <Activity className="w-6 h-6 text-kfintech-primary" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter text-white">KFintech Nexus</span>
                </div>

                {/* Core Navigation Links */}
                <div className="flex items-center gap-1 bg-kfintech-bg/50 p-1.5 rounded-xl border border-kfintech-border relative">
                    {navLinks.map((link) => {
                        const isActive = location.pathname.includes(link.path);
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => handleNavClick(link.role)}
                                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors duration-200 z-10 ${
                                    isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-kfintech-primary rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        style={{ zIndex: -1 }}
                                    />
                                )}
                                <span className="relative z-10">{link.icon}</span>
                                <span className="relative z-10">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Session Indicator */}
                <div className="bg-kfintech-bg border border-kfintech-border px-4 py-2 rounded-lg flex items-center gap-3 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-kfintech-accent shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    <span className="text-xs font-mono text-gray-400 tracking-widest">
                        SESSION: <span className="text-white font-bold ml-1">{currentRole}</span>
                    </span>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;
