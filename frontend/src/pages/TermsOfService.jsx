import React from 'react';
import LandingNavbar from '../components/common/LandingNavbar';
import Footer from '../components/common/Footer';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-kfintech-primary/30">
            <LandingNavbar />
            
            <main className="pt-32 pb-24 px-6 relative">
                {/* Minimal Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="mb-12 border-b border-white/10 pb-8">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
                        <p className="text-gray-400">Effective Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-8 text-gray-300 leading-relaxed font-light">
                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the FinnovaX Portal, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the platform or use any of our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                            <p>
                                FinnovaX provides an enterprise-grade digital portal for managing service requests, processing documents using AI, and real-time SLA tracking. Our services are subject to continuous improvement and may change without prior notice to ensure optimal performance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                            <p>
                                You are responsible for maintaining the confidentiality of your account credentials. You agree to use the FinnovaX platform strictly for lawful purposes and in accordance with all applicable local and international regulations. You must not upload any malicious code or attempt to bypass our Zero Trust security protocols.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
                            <p>
                                The FinnovaX name, branding, platform code, algorithms, and design are the exclusive property of our company. You may not copy, modify, distribute, or reverse-engineer any part of the portal without explicit written consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
                            <p>
                                FinnovaX shall not be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services, including but not limited to data loss or delays in SLA resolutions caused by external factors.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsOfService;
