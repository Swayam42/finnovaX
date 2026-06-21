import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import L2CheckerDesk from './pages/L2CheckerDesk';
import InvestorDashboard from './pages/InvestorDashboard';
import L1MakerDesk from './pages/L1MakerDesk';
import Navbar from './components/Navbar';

// Protected Route Guard Wrapper
const ProtectedRoute = ({ children, requiredRole, userRole }) => {
    if (!userRole) return <Navigate to="/login" replace />;
    
    if (requiredRole && userRole !== requiredRole) {
        return (
            <div className="p-8 text-red-600 text-xl font-bold flex items-center justify-center min-h-[50vh]">
                Access Denied. Insufficient RBAC Permissions for this Dashboard.
            </div>
        );
    }
    
    return children;
};

function App() {
    // Centralized Mock Authentication State for easy testing
    const [role, setRole] = useState('ADMIN_L1'); // Default to L1 to view the new feature

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-kfintech-bg font-sans flex flex-col">
                {/* Global KFintech Navigation Bar */}
                <Navbar currentRole={role} setRole={setRole} />

                <main className="container mx-auto max-w-7xl flex-grow mt-6">
                    <Routes>
                        <Route path="/investor" element={
                            <ProtectedRoute userRole={role} requiredRole="INVESTOR">
                                <InvestorDashboard />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/l1-maker" element={
                            <ProtectedRoute userRole={role} requiredRole="ADMIN_L1">
                                <L1MakerDesk />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/l2-checker" element={
                            <ProtectedRoute userRole={role} requiredRole="ADMIN_L2">
                                {/* Fully wired, production-ready L2 Component */}
                                <L2CheckerDesk />
                            </ProtectedRoute>
                        } />

                        {/* Smart fallback routing based on current role */}
                        <Route path="*" element={
                            <Navigate to={role === 'INVESTOR' ? '/investor' : role === 'ADMIN_L1' ? '/l1-maker' : '/l2-checker'} replace />
                        } />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
