import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';

const LandingNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-black/40 backdrop-blur-md border-b border-white/10 shadow-lg py-3'
                    : 'bg-transparent py-5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-finnovax-primary/20 flex items-center justify-center border border-finnovax-primary/30 group-hover:bg-finnovax-primary/40 transition-colors">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white">
                        Finnova<span className="text-finnovax-primary">X</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Features
                    </a>
                    <a href="#security" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Security
                    </a>
                    <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                        Log in
                    </Link>
                    <Link
                        to="/register"
                        className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-gray-300 hover:text-white p-2"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <div
                className={`md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 overflow-hidden ${
                    isMobileMenuOpen ? 'max-h-[400px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
                }`}
            >
                <div className="flex flex-col items-center gap-6 px-6">
                    <a 
                        href="#features" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-300 hover:text-white transition-colors w-full text-center"
                    >
                        Features
                    </a>
                    <a 
                        href="#security" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-300 hover:text-white transition-colors w-full text-center"
                    >
                        Security
                    </a>
                    <div className="w-full h-px bg-white/10 my-2"></div>
                    <Link 
                        to="/login" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-300 hover:text-white transition-colors w-full text-center"
                    >
                        Log in
                    </Link>
                    <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-3 rounded-full bg-white text-black font-semibold text-center hover:bg-gray-200 transition-all"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default LandingNavbar;
