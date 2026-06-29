import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background py-16 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between border-b border-border pb-8">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
                    </div>
                    <Link to="/" className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-2")}>
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
                
                <div className="prose prose-invert max-w-none text-foreground/80 space-y-6">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    
                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Introduction</h2>
                    <p>Welcome to KFintech Nexus. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. The Data We Collect About You</h2>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier, title, date of birth and gender.</li>
                        <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                        <li><strong>Financial Data</strong> includes bank account and payment card details.</li>
                        <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. How We Use Your Personal Data</h2>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal or regulatory obligation.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Data Security</h2>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

                    <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Contact Us</h2>
                    <p>If you have any questions about this privacy policy or our privacy practices, please contact us at compliance@kfintech.com.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
