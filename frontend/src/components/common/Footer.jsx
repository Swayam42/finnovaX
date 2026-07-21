import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-md relative z-10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
                            <div className="w-8 h-8 rounded-lg bg-finnovax-primary/10 flex items-center justify-center border border-finnovax-primary/20 group-hover:bg-finnovax-primary/20 transition-colors">
                                <img src="/favicon.svg" alt="FinnovaX Logo" className="w-4 h-4 brightness-0 invert" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                Finnova<span className="text-finnovax-primary">X</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-6">
                            Next-generation enterprise service portal. 
                            Built for modern financial institutions to streamline investor operations.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-500 hover:text-white transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                            <li><Link to="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
                            <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} FinnovaX. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Status:</span>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-green-500 font-medium text-xs">All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
