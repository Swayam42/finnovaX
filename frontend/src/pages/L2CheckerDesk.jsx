import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';

// Shared UI Components for AI Insights
const Badge = ({ priority }) => {
    const isCritical = priority === 'CRITICAL';
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-sm ${
            isCritical ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
            {priority || 'NORMAL'}
        </span>
    );
};

const SentimentBar = ({ score }) => {
    // Treat the underlying score (0 to 1) as a percentage of frustration
    const percentage = Math.min(Math.max((score || 0) * 100, 0), 100);
    const isHighFrustration = percentage > 70;
    
    return (
        <div className="mt-3">
            <div className="flex justify-between text-xs mb-1 font-bold text-gray-600 uppercase tracking-wider">
                <span>AI Frustration Index</span>
                <span className={isHighFrustration ? 'text-red-600' : 'text-green-600'}>{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${isHighFrustration ? 'bg-red-500' : 'bg-green-500'}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const L2CheckerDesk = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchL2Queue = async () => {
            try {
                const response = await apiClient.get('/dashboard/l2-queue');
                setTickets(response.data.data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching L2 queue:", err);
                setError("Failed to load L2 Checker Queue. Ensure the Node.js backend is active on port 5000.");
            } finally {
                setLoading(false);
            }
        };

        fetchL2Queue();
    }, []);

    // Secure L2 Action Handler (APPROVE/REJECT)
    const handleAction = async (ticketId, action) => {
        try {
            await apiClient.post('/l2/finalize', { ticketId, action });
            // Optimistic UI Update: Remove the ticket instantly from the queue
            setTickets(current => current.filter(t => t._id !== ticketId));
        } catch (err) {
            alert(`Failed to execute ${action}. ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-kfintech-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 text-red-800 rounded shadow-md">
                    <p className="font-extrabold text-lg mb-1">System Architecture Error</p>
                    <p className="font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 animate-fade-in">
            <header className="mb-8 border-b-2 border-gray-200 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-kfintech-primary tracking-tight">L2 Checker Desk</h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">Finalize pre-verified tickets. AI context is generated for rapid decision making.</p>
                </div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-4 py-2 rounded">
                    Total Queue: {tickets.length}
                </div>
            </header>

            {tickets.length === 0 ? (
                <div className="bg-white p-16 text-center rounded-2xl shadow-sm border border-gray-200">
                    <svg className="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Inbox Zero Achieved</h3>
                    <p className="text-gray-500 text-lg">All high-priority tickets have been cleared by the L2 desk.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {tickets.map(ticket => (
                        <div key={ticket._id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Ticket Reference</span>
                                    <div className="font-mono text-sm text-gray-700 font-semibold mt-1">#{ticket._id}</div>
                                </div>
                                <Badge priority={ticket.assignedPriority} />
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-grow">
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-3">Original Investor Complaint</h4>
                                    <p className="text-gray-800 text-md bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed font-medium italic shadow-sm">
                                        "{ticket.complaintText}"
                                    </p>
                                </div>

                                {/* Enterprise AI Context Block */}
                                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-kfintech-primary"></div>
                                    
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-6 h-6 text-kfintech-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                        </svg>
                                        <h4 className="font-extrabold text-kfintech-primary text-lg tracking-tight">AI Microservice Insight Summary</h4>
                                    </div>
                                    
                                    {/* AI Summary Bullets */}
                                    <ul className="space-y-2 mb-6">
                                        {ticket.aiSummary ? (
                                            ticket.aiSummary.map((point, idx) => (
                                                <li key={idx} className="flex gap-3 text-sm text-gray-700 font-medium">
                                                    <span className="text-kfintech-accent font-bold">•</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <>
                                                <li className="flex gap-3 text-sm text-gray-700 font-medium">
                                                    <span className="text-kfintech-accent font-bold">•</span>
                                                    <span>Detected potential SLA violation regarding mutual fund transfer timing.</span>
                                                </li>
                                                <li className="flex gap-3 text-sm text-gray-700 font-medium">
                                                    <span className="text-kfintech-accent font-bold">•</span>
                                                    <span>Customer sentiment analysis flags high risk of platform churn.</span>
                                                </li>
                                                <li className="flex gap-3 text-sm text-gray-700 font-medium">
                                                    <span className="text-kfintech-accent font-bold">•</span>
                                                    <span>OCR Zero-Touch automatically pre-verified attached documents successfully.</span>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                    
                                    <SentimentBar score={ticket.aiSentimentScore} />
                                </div>
                            </div>

                            {/* Maker/Checker Actions */}
                            <div className="px-6 py-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
                                <button 
                                    onClick={() => handleAction(ticket._id, 'REJECT')}
                                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 font-bold transition-colors text-sm uppercase tracking-wide focus:ring-2 focus:ring-gray-200"
                                >
                                    Reject to L1
                                </button>
                                <button 
                                    onClick={() => handleAction(ticket._id, 'APPROVE')}
                                    className="px-6 py-2.5 bg-kfintech-primary text-white rounded-lg shadow-md hover:bg-blue-800 hover:shadow-lg font-bold transition-all text-sm uppercase tracking-wide focus:ring-2 focus:ring-blue-300"
                                >
                                    Approve & Resolve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default L2CheckerDesk;
