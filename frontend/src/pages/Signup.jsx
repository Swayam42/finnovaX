import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react';
import apiClient from '../api/client';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        countryCode: '+91',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            // Reusing existing registration API logic (if endpoint is hooked up)
            await apiClient.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.countryCode + ' ' + formData.phone,
                password: formData.password
            });
            
            setSuccess('Registration successful! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register account.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-kfintech-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-12 h-12 bg-kfintech-primary/15 border border-kfintech-primary/40 rounded-2xl mb-2 shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                    >
                        <Activity className="w-6 h-6 text-kfintech-primary" />
                    </motion.div>
                    <h1 className="text-2xl font-black text-white tracking-tight">KFintech Nexus</h1>
                    <p className="text-gray-500 mt-2 text-sm font-medium">Create Investor Account</p>
                </div>

                <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-kfintech-border/80">
                    <div className="mb-4">
                        <h2 className="text-xl font-extrabold text-white tracking-tight">Sign Up</h2>
                        <p className="text-gray-500 text-sm mt-1">Join the secure investor portal today.</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-medium flex items-center gap-3"
                            >
                                <span className="text-lg shrink-0">⚠️</span>
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/40 text-emerald-400 text-sm font-medium flex items-center gap-3"
                            >
                                <span className="text-lg shrink-0">✅</span>
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@kfintech.com"
                                    className="w-full bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">Phone Number</label>
                                <div className="flex">
                                    <select
                                        name="countryCode"
                                        value={formData.countryCode}
                                        onChange={handleChange}
                                        className="w-[100px] bg-kfintech-bg border border-kfintech-border border-r-0 rounded-l-xl px-3 py-3 text-white focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '1.5rem' }}
                                    >
                                        <option value="+91">+91 (IN)</option>
                                        <option value="+1">+1 (US)</option>
                                        <option value="+44">+44 (UK)</option>
                                        <option value="+61">+61 (AU)</option>
                                        <option value="+971">+971 (AE)</option>
                                        <option value="+65">+65 (SG)</option>
                                    </select>
                                    <input
                                        name="phone"
                                        type="text"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        className="w-full bg-kfintech-bg border border-kfintech-border rounded-r-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">Password</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all shadow-lg mt-4 ${
                                isLoading
                                    ? 'bg-kfintech-border text-gray-500 cursor-wait'
                                    : 'bg-kfintech-primary text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Register Account
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Encrypted & Secured by KFintech Nexus</span>
                    </div>
                </div>

                <div className="text-center mt-4 text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-kfintech-accent hover:text-emerald-400 hover:underline font-bold transition-colors">
                        Sign In Here
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
