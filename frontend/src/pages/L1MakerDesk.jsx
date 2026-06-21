import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';

// Shared UI Components
const PriorityBadge = ({ priority }) => (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
        priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
    }`}>
        {priority || 'NORMAL'}
    </span>
);

const L1MakerDesk = () => {
    const [queue, setQueue] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [isOcrRunning, setIsOcrRunning] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);

    // Fetch the Queue
    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await apiClient.get('/dashboard/l1-queue');
                setQueue(response.data.data || []);
            } catch (error) {
                console.error("Queue Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQueue();
    }, []);

    // Time Formatting Utility
    const timeElapsed = (dateString) => {
        if (!dateString) return 'Just now';
        const mins = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    // AI OCR Simulation
    const handleRunOCR = () => {
        setIsOcrRunning(true);
        setOcrResult(null);
        // Simulate network delay to the Python Microservice
        setTimeout(() => {
            setIsOcrRunning(false);
            setOcrResult({
                matched: true,
                extracted: "FOLIO: 123456789\nNAME: JOHN DOE\nSTATUS: ACTIVE"
            });
        }, 2000);
    };

    // Escalate Action
    const handleEscalate = async () => {
        if (!selectedTicket) return;
        try {
            await apiClient.put(`/admin/escalate/${selectedTicket._id}`, { notes });
            setQueue(q => q.filter(t => t._id !== selectedTicket._id));
            setSelectedTicket(null);
            setNotes('');
            setOcrResult(null);
            alert("Ticket successfully escalated to L2 Checker.");
        } catch (error) {
            alert(`Escalation failed: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kfintech-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50 border-t border-gray-200">
            {/* Sidebar: L1 Queue */}
            <aside className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-black text-kfintech-primary tracking-tight">L1 Maker Queue</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">{queue.length} Pending Tickets</p>
                </div>
                
                <div className="overflow-y-auto flex-grow p-2 space-y-2">
                    {queue.length === 0 ? (
                        <div className="text-center p-8 text-gray-500 font-medium">Queue is empty</div>
                    ) : (
                        queue.map(ticket => (
                            <div 
                                key={ticket._id} 
                                onClick={() => { setSelectedTicket(ticket); setOcrResult(null); setNotes(''); }}
                                className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedTicket?._id === ticket._id ? 'bg-blue-50 border-kfintech-primary shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-xs text-gray-500 font-semibold">#{ticket._id.substring(18)}</span>
                                    <PriorityBadge priority={ticket.assignedPriority} />
                                </div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{ticket.complaintText}</p>
                                <div className="mt-3 flex justify-between items-center text-xs text-gray-400 font-semibold">
                                    <span className="uppercase">{ticket.status}</span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {timeElapsed(ticket.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Main Workspace */}
            <main className="w-2/3 flex flex-col h-full bg-gray-50">
                {selectedTicket ? (
                    <>
                        <div className="p-6 flex-grow overflow-y-auto">
                            {/* Ticket Header Details */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Ticket Processing Workspace</h3>
                                    <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-600 font-bold">ID: {selectedTicket._id}</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Investor Complaint String</h4>
                                    <p className="text-gray-800 text-md font-medium bg-gray-50 p-4 rounded border border-gray-100 leading-relaxed">
                                        {selectedTicket.complaintText}
                                    </p>
                                </div>
                            </div>

                            {/* Document Inspector & AI Module */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Secure Document Inspector</h4>
                                <div className="flex gap-6">
                                    
                                    {/* Simulated PDF Viewer */}
                                    <div className="w-1/2 bg-gray-100 rounded border border-gray-300 flex items-center justify-center p-8 relative overflow-hidden min-h-[300px]">
                                        {/* Watermark overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none transform -rotate-45">
                                            <span className="text-4xl font-black tracking-widest">KFINTECH CONFIDENTIAL</span>
                                        </div>
                                        <div className="text-center">
                                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm font-bold text-gray-500">investor_statement_q3.pdf</p>
                                            <p className="text-xs text-gray-400 mt-1">2.4 MB • Encrypted</p>
                                        </div>
                                    </div>

                                    {/* AI OCR Verification Panel */}
                                    <div className="w-1/2 flex flex-col">
                                        <div className="bg-blue-50/50 p-5 rounded border border-blue-100 flex-grow">
                                            <h5 className="font-extrabold text-kfintech-primary mb-2 flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                                EasyOCR Verification Engine
                                            </h5>
                                            <p className="text-sm text-gray-600 mb-4 font-medium leading-relaxed">
                                                Run Zero-Touch automated text extraction to verify the embedded account details against the CRM records.
                                            </p>
                                            
                                            <button 
                                                onClick={handleRunOCR}
                                                disabled={isOcrRunning}
                                                className={`w-full py-3 rounded text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all ${isOcrRunning ? 'bg-gray-400 cursor-wait' : 'bg-kfintech-primary hover:bg-blue-800 focus:ring-4 focus:ring-blue-200'}`}
                                            >
                                                {isOcrRunning ? 'Initializing Model Weights...' : 'Run AI Extraction'}
                                            </button>

                                            {/* AI Output Checklist */}
                                            {ocrResult && (
                                                <div className="mt-4 bg-white p-4 rounded border border-green-200 shadow-sm animate-fade-in">
                                                    <div className="flex items-center gap-2 text-green-700 font-bold mb-2 text-sm uppercase tracking-wider">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        Match Verified
                                                    </div>
                                                    <pre className="text-xs bg-gray-50 p-2 rounded text-gray-600 font-mono border border-gray-100">
                                                        {ocrResult.extracted}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Footer */}
                        <div className="bg-white border-t-2 border-gray-200 p-6 flex flex-col gap-4 shadow-lg z-20">
                            <textarea 
                                rows="2" 
                                placeholder="Enter Maker Notes or findings here before escalation..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded p-3 text-sm focus:ring-0 focus:border-kfintech-primary outline-none transition-colors"
                            />
                            <div className="flex justify-end gap-4">
                                <button className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-wider">
                                    Return to Queue
                                </button>
                                <button 
                                    onClick={handleEscalate}
                                    className="px-8 py-2.5 bg-kfintech-accent text-white text-sm font-bold rounded shadow-md hover:bg-orange-700 transition-all uppercase tracking-wider focus:ring-4 focus:ring-orange-200"
                                >
                                    Escalate to L2 Checker
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-20 h-20 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                        <h3 className="text-xl font-bold text-gray-500">No Ticket Selected</h3>
                        <p className="text-sm font-medium mt-1">Select a ticket from the queue to open the workspace.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default L1MakerDesk;
