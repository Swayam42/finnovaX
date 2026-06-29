import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between border-b border-border pb-8">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
                    </div>
                    <Link to="/" className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-2")}>
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
                
                <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Agreement to Terms</h2>
                    <p>By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Use of Services</h2>
                    <p>You agree to use our services only for lawful purposes and in accordance with these Terms. You are responsible for all of your activity in connection with the Services.</p>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. User Accounts</h2>
                    <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Intellectual Property</h2>
                    <p>The Service and its original content, features and functionality are and will remain the exclusive property of KFintech and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries.</p>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Limitation of Liability</h2>
                    <p>In no event shall KFintech, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
                    
                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">6. Changes</h2>
                    <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
