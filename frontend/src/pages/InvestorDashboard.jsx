import React, { useState, useRef } from 'react';
import apiClient from '../api/client';

const InvestorDashboard = () => {
    const [formData, setFormData] = useState({ title: '', category: 'Mutual Funds', description: '' });
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            // Aggregating form fields into the expected complaintText structure
            const complaintText = `[${formData.category}] ${formData.title} - ${formData.description}`;
            
            // Using FormData to support the EasyOCR document upload
            const payload = new FormData();
            payload.append('complaintText', complaintText);
            if (file) {
                payload.append('file', file);
            }

            // Submitting to the central API routing cluster
            await apiClient.post('/tickets', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setStatus({ 
                type: 'success', 
                message: 'Ticket successfully transmitted. It has been queued for immediate L1 Maker review.' 
            });
            
            // Reset Form
            setFormData({ title: '', category: 'Mutual Funds', description: '' });
            setFile(null);
        } catch (error) {
            console.error("Submission Error:", error);
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to lodge complaint. Please ensure the CRM backend is active.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 animate-fade-in max-w-4xl mx-auto">
            <header className="mb-8 border-b-2 border-gray-200 pb-4">
                <h1 className="text-4xl font-black text-kfintech-primary tracking-tight">Investor Service Portal</h1>
                <p className="text-gray-500 mt-2 text-lg font-medium">Lodge a secure support ticket or mutual fund complaint.</p>
            </header>

            {/* Tailwind Visual Feedback Alerts */}
            {status.message && (
                <div className={`mb-6 p-5 rounded-lg shadow-sm border-l-4 flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
                    {status.type === 'success' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <div>
                        <p className="font-extrabold text-sm uppercase tracking-wider">{status.type === 'success' ? 'Success' : 'Error'}</p>
                        <p className="font-medium">{status.message}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Title & Category Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-extrabold text-gray-500 mb-2 uppercase tracking-widest">Ticket Title</label>
                            <input 
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Brief summary of your issue"
                                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:ring-0 focus:border-kfintech-primary outline-none transition-colors shadow-sm bg-gray-50 focus:bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-extrabold text-gray-500 mb-2 uppercase tracking-widest">Category</label>
                            <select 
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:ring-0 focus:border-kfintech-primary outline-none transition-colors shadow-sm bg-gray-50 focus:bg-white cursor-pointer"
                            >
                                <option value="Mutual Funds">Mutual Funds</option>
                                <option value="Corporate Registry">Corporate Registry</option>
                                <option value="Pension Services">Pension Services</option>
                                <option value="Account Access">Account Access</option>
                            </select>
                        </div>
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label className="block text-xs font-extrabold text-gray-500 mb-2 uppercase tracking-widest">Detailed Description</label>
                        <textarea 
                            name="description"
                            required
                            rows="6"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Please provide as much detail as possible. Our AI engine will analyze this text to expedite your request..."
                            className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:ring-0 focus:border-kfintech-primary outline-none transition-colors shadow-sm resize-none bg-gray-50 focus:bg-white leading-relaxed"
                        ></textarea>
                    </div>

                    {/* Drag and Drop Document Upload */}
                    <div>
                        <label className="block text-xs font-extrabold text-gray-500 mb-2 uppercase tracking-widest">Supporting Documents (For OCR Verification)</label>
                        <div 
                            onDragOver={handleDragOver}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-kfintech-primary transition-all group bg-gray-50/50"
                        >
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={(e) => setFile(e.target.files[0])}
                                accept="image/jpeg, image/png, application/pdf"
                            />
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-gray-400 group-hover:text-kfintech-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            
                            {file ? (
                                <div className="text-center">
                                    <p className="text-kfintech-primary font-extrabold text-lg">{file.name}</p>
                                    <p className="text-gray-500 text-sm mt-1">Ready for upload</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-800 font-bold text-lg mb-1">Click to upload or drag and drop</p>
                                    <p className="text-sm text-gray-500 font-medium">JPEG, PNG, or PDF up to 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Action Footer */}
                <div className="bg-gray-50/80 p-6 border-t border-gray-100 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`px-10 py-4 bg-kfintech-primary text-white font-extrabold rounded-xl shadow-md transition-all uppercase tracking-widest text-sm ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-blue-800 hover:shadow-xl hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-300'}`}
                    >
                        {isSubmitting ? 'Processing AI Triage...' : 'Lodge Ticket Securely'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvestorDashboard;
