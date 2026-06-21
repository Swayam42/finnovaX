import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ currentRole, setRole }) => {
    const location = useLocation();

    // Helper function to style the currently active navigation tab
    const getLinkClass = (path) => {
        const isActive = location.pathname.includes(path);
        return `px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-200 ${
            isActive 
                ? 'bg-kfintech-accent text-white shadow-md transform scale-105' 
                : 'text-blue-100 hover:bg-blue-800 hover:text-white'
        }`;
    };

    // Automatically update the mock authentication role to seamlessly bypass ProtectedRoute restrictions during navigation
    const handleNavClick = (role) => {
        setRole(role);
    };

    return (
        <nav className="bg-kfintech-primary text-white shadow-xl sticky top-0 z-50">
            <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                
                {/* KFintech Brand Logo */}
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded">
                        <svg className="w-8 h-8 text-kfintech-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <span className="font-black text-2xl tracking-tighter">KFintech Nexus</span>
                </div>

                {/* Core Navigation Links */}
                <div className="flex items-center gap-2 bg-blue-900/50 p-1.5 rounded-xl border border-blue-800">
                    <Link 
                        to="/investor" 
                        onClick={() => handleNavClick('INVESTOR')}
                        className={getLinkClass('/investor')}
                    >
                        Investor View
                    </Link>
                    <Link 
                        to="/l1-maker" 
                        onClick={() => handleNavClick('ADMIN_L1')}
                        className={getLinkClass('/l1-maker')}
                    >
                        L1 Maker View
                    </Link>
                    <Link 
                        to="/l2-checker" 
                        onClick={() => handleNavClick('ADMIN_L2')}
                        className={getLinkClass('/l2-checker')}
                    >
                        L2 Checker View
                    </Link>
                </div>

                {/* Session Indicator */}
                <div className="bg-blue-900 border border-blue-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs font-mono text-blue-200">Session: <span className="text-white font-bold ml-1">{currentRole}</span></span>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;
