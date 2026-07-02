import React from 'react';
import LandingNavbar from '../components/common/LandingNavbar';
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-finnovax-primary/30">
            <LandingNavbar />
            
            <main className="pt-32 pb-24 px-6 relative">
                {/* Minimal Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-finnovax-primary/10 blur-[100px] pointer-events-none" />

                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="mb-12 border-b border-white/10 pb-8">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
                        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-8 text-gray-300 leading-relaxed font-light">
                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                            <p>
                                At FinnovaX, we collect information that you provide directly to us, such as when you create an account, update your profile, or submit a service request. This includes your name, email address, contact details, and any documents you upload through our portal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                            <p>
                                The information collected is strictly used to provide, maintain, and improve our services. Our AI-powered OCR tools process your documents securely to expedite verification, reducing manual processing times. We do not sell or share your personal data with third parties for marketing purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security (Zero Trust)</h2>
                            <p>
                                FinnovaX operates on a Zero Trust security model. All data transmitted between your browser and our servers is encrypted using industry-standard protocols. Access to your personal data is restricted by Role-Based Access Control (RBAC) ensuring only authorized personnel can view sensitive information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">4. Your Rights</h2>
                            <p>
                                You have the right to access, correct, or delete your personal data stored on the FinnovaX platform. If you wish to exercise these rights, you may do so directly through your account settings or by contacting our Data Protection Officer.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">5. Contact Us</h2>
                            <p>
                                If you have any questions or concerns regarding this Privacy Policy, please contact us at <a href="mailto:privacy@finnovax.com" className="text-finnovax-primary hover:underline">privacy@finnovax.com</a>.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
