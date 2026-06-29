import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
    Shield, Clock, FileCheck, ArrowRight, Menu, X, 
    Globe, Users, BarChart, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Threads from '../components/ui/Threads';
import { buttonVariants } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-auto",
            isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3" : "bg-transparent py-5"
        )}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold text-foreground tracking-tight">KFintech <span className="text-primary">Nexus</span></span>
                </div>
                
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#solutions" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Solutions</a>
                    <a href="#products" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Products</a>
                    <a href="#about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">About Us</a>
                    <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Contact</a>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "font-semibold")}>Log In</Link>
                    <Link to="/register" className={cn(buttonVariants({ size: "sm" }), "font-semibold shadow-md")}>Register</Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg">
                    <a href="#solutions" className="text-sm font-medium text-foreground p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
                    <a href="#products" className="text-sm font-medium text-foreground p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>Products</a>
                    <a href="#about" className="text-sm font-medium text-foreground p-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>About Us</a>
                    <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
                        <Link to="/login" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}>Log In</Link>
                        <Link to="/register" className={cn(buttonVariants(), "w-full justify-center")}>Register</Link>
                    </div>
                </div>
            )}
        </header>
    );
};

const Footer = () => {
    return (
        <footer className="bg-muted/30 border-t border-border pt-16 pb-8 pointer-events-auto overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-6 h-6 text-primary" />
                            <span className="text-lg font-bold text-foreground tracking-tight">KFintech Nexus</span>
                        </div>
                        <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
                            Empowering investors and corporate entities with next-generation financial technology solutions.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-background border border-border text-foreground/70 hover:text-primary hover:border-primary transition-colors"><Globe className="w-4 h-4" /></a>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Solutions</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Mutual Funds</a></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Corporate Registry</a></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Pension Systems</a></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Wealth Management</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Careers</a></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Investors</a></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link to="/privacy-policy" className="text-sm text-foreground/60 hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms-of-service" className="text-sm text-foreground/60 hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Cookie Policy</a></li>
                            <li><a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors">Disclaimers</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-center w-full mb-12 select-none">
                    <h1 className="text-[16vw] md:text-[20vw] font-black tracking-tighter text-foreground leading-none -ml-4 md:-ml-8">
                        FinovaX
                    </h1>
                </div>

                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-foreground/50">
                        &copy; {new Date().getFullYear()} KFin Technologies Limited. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                        <Globe className="w-3 h-3" />
                        <span>Global Access Hub</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const LandingPage = () => {
    const { isAuthenticated, user, getRoleDefaultRoute } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={getRoleDefaultRoute(user?.role)} replace />;
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-background selection:bg-primary/30 font-sans">
            <Header />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0">
                    <Threads amplitude={1.8} distance={0} enableMouseInteraction={true} color={[0.0, 0.2, 0.8]} />
                </div>
                
                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background z-0 pointer-events-none" />

                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center pointer-events-none mt-16">
                    <div className="pointer-events-auto inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full mb-8">
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-sm font-medium">New Release: Nexus v2.0 Available</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>

                    <h1 className="pointer-events-auto text-5xl md:text-7xl font-black tracking-tight mb-6 text-foreground max-w-4xl drop-shadow-xl leading-tight">
                        Investor Service Request <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-primary to-blue-400">Management Portal</span>
                    </h1>
                    
                    <p className="pointer-events-auto mt-4 max-w-2xl text-lg md:text-xl text-foreground/70 mb-10 leading-relaxed font-medium">
                        A full-featured CRM portal enabling mutual fund investors to raise and track service requests with end-to-end SLA monitoring.
                    </p>

                    <div className="pointer-events-auto flex flex-col sm:flex-row gap-4 mb-16">
                        <Link to="/register" className={cn(buttonVariants({ size: "lg" }), "h-14 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 rounded-xl")}>
                            Get Started Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-14 px-8 text-base bg-background/50 backdrop-blur-md border-border hover:bg-muted transition-all duration-300 hover:-translate-y-1 rounded-xl")}>
                            Explore Features
                        </Link>
                    </div>

                    {/* Quick Stats directly in Hero */}
                    <div className="pointer-events-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 pt-8 border-t border-border/50">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl md:text-4xl font-black text-foreground mb-1">50M+</span>
                            <span className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Investors</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl md:text-4xl font-black text-foreground mb-1">300+</span>
                            <span className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Corporates</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl md:text-4xl font-black text-foreground mb-1">99.9%</span>
                            <span className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Uptime SLA</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl md:text-4xl font-black text-foreground mb-1">ISO</span>
                            <span className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">Certified</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-24 bg-background pointer-events-auto">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Key Portal Features</h2>
                        <p className="text-lg text-foreground/60">
                            Streamline your service request management with powerful tracking, notifications, and AI-driven complaint resolution.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group">
                            <CardHeader className="text-left pb-4 border-b border-border/10 bg-muted/20">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                                    <Shield className="w-7 h-7 text-blue-600" />
                                </div>
                                <CardTitle className="text-xl font-bold">Raise & Update Requests</CardTitle>
                            </CardHeader>
                            <CardContent className="text-left text-foreground/70 pt-6">
                                Easily raise requests for Bank detail changes, Nominee updates, and Address modifications through an intuitive interface.
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group">
                            <CardHeader className="text-left pb-4 border-b border-border/10 bg-muted/20">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                                    <Clock className="w-7 h-7 text-indigo-600" />
                                </div>
                                <CardTitle className="text-xl font-bold">Ticket Workflow & SLA Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="text-left text-foreground/70 pt-6">
                                Robust ticket workflows with end-to-end SLA monitoring, ensuring timely resolutions and complete transparency.
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group">
                            <CardHeader className="text-left pb-4 border-b border-border/10 bg-muted/20">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                                    <BarChart className="w-7 h-7 text-emerald-600" />
                                </div>
                                <CardTitle className="text-xl font-bold">Admin Resolution Dashboard</CardTitle>
                            </CardHeader>
                            <CardContent className="text-left text-foreground/70 pt-6">
                                A dedicated control center for administrators to manage requests, analyze sentiment, and oversee platform performance.
                            </CardContent>
                        </Card>
                    </div>

                    {/* Advanced Features Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group">
                            <CardHeader className="text-left pb-4 border-b border-border/10 bg-muted/20">
                                <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all duration-300">
                                    <Globe className="w-7 h-7 text-orange-600" />
                                </div>
                                <CardTitle className="text-xl font-bold">Automated Notifications</CardTitle>
                            </CardHeader>
                            <CardContent className="text-left text-foreground/70 pt-6">
                                Stay informed at every step of your request with automated email and SMS alerts powered by AWS SES and SNS.
                            </CardContent>
                        </Card>

                        <Card className="bg-card border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group relative">
                            {/* "Advanced Add-on" Badge */}
                            <div className="absolute top-4 right-4 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">Advanced Add-on</div>
                            
                            <CardHeader className="text-left pb-4 border-b border-border/10 bg-muted/20">
                                <div className="w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                                    <Users className="w-7 h-7 text-purple-600" />
                                </div>
                                <CardTitle className="text-xl font-bold">Chatbot & Sentiment Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="text-left text-foreground/70 pt-6">
                                Intelligent chatbot integration to assist users instantly, complete with sentiment analysis on complaints to prioritize critical issues.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20 bg-muted/50 border-t border-border pointer-events-auto">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-6">Ready to transform your investment experience?</h2>
                    <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
                        Join millions of investors who trust KFintech for seamless, secure, and transparent financial operations.
                    </p>
                    <Link to="/register" className={cn(buttonVariants({ size: "lg" }), "h-14 px-10 text-lg shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl")}>
                        Create Your Account Now
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
