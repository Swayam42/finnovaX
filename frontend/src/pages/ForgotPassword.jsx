import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, Lock, ShieldCheck, CheckCircle2, ArrowRight, Activity, Eye, EyeOff } from 'lucide-react';
import apiClient from '../api/client';

const ForgotPassword = () => {
    const navigate = useNavigate();
    
    // Steps: 'request_otp' -> 'verify_otp' -> 'reset_password' -> 'success'
    const [step, setStep] = useState('request_otp');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [channels, setChannels] = useState(null);

    // Form Data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/forgot-password', { email });
            if (res.data.channels) {
                setChannels(res.data.channels);
                setStep('verify_otp');
            } else {
                // If endpoint returns a generic message (to prevent user enumeration)
                setStep('verify_otp');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/verify-reset-otp', { email, otp });
            setResetToken(res.data.resetToken);
            setStep('reset_password');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post('/auth/reset-password', { resetToken, newPassword });
            setStep('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex items-center justify-center w-12 h-12 bg-kfintech-primary/15 border border-kfintech-primary/40 rounded-2xl mb-4 shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                    >
                        {step === 'success' ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <KeyRound className="w-6 h-6 text-kfintech-primary" />}
                    </motion.div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Account Recovery</h1>
                    <p className="text-gray-500 mt-2 text-sm font-medium">
                        {step === 'request_otp' && "Enter your email to receive an OTP."}
                        {step === 'verify_otp' && "Enter the 6-digit OTP sent to you."}
                        {step === 'reset_password' && "Create a strong new password."}
                        {step === 'success' && "Password successfully reset."}
                    </p>
                </div>

                <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-kfintech-border/80">
                    <AnimatePresence mode="wait">
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
                    </AnimatePresence>

                    {/* Step 1: Request OTP */}
                    {step === 'request_otp' && (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@kfintech.com"
                                    className="w-full bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg mt-2 ${
                                    isLoading ? 'bg-kfintech-border text-gray-500 cursor-wait' : 'bg-kfintech-primary text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                }`}
                            >
                                {isLoading ? 'Sending...' : 'Send Recovery OTP'} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 'verify_otp' && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            {channels && (
                                <div className="p-4 rounded-xl bg-kfintech-bg border border-kfintech-border mb-4 text-sm text-gray-300">
                                    <p className="mb-2">OTP sent to your registered channels:</p>
                                    <div className="flex flex-col gap-1.5">
                                        {channels.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> {channels.email}</div>}
                                        {channels.phone && <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> {channels.phone}</div>}
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">6-Digit OTP</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="••••••"
                                    className="w-full text-center tracking-[0.5em] font-mono text-xl bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all shadow-inner"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg mt-2 ${
                                    isLoading ? 'bg-kfintech-border text-gray-500 cursor-wait' : 'bg-kfintech-primary text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                }`}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'} <ShieldCheck className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset_password' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold text-kfintech-primary mb-2 uppercase tracking-widest">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-kfintech-bg border border-kfintech-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-kfintech-primary/50 focus:border-kfintech-primary outline-none transition-all text-sm shadow-inner"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg mt-2 ${
                                    isLoading ? 'bg-kfintech-border text-gray-500 cursor-wait' : 'bg-kfintech-primary text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                                }`}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'} <Lock className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* Step 4: Success */}
                    {step === 'success' && (
                        <div className="text-center py-6">
                            <p className="text-emerald-400 font-semibold mb-2">Success!</p>
                            <p className="text-sm text-gray-400">Your password has been reset.</p>
                            <p className="text-xs text-gray-500 mt-4">Redirecting to login...</p>
                        </div>
                    )}
                </div>

                <div className="text-center mt-6 text-sm text-gray-400">
                    Remember your password?{' '}
                    <Link to="/login" className="text-kfintech-accent hover:text-emerald-400 hover:underline font-bold transition-colors">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
