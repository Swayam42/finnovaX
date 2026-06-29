import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { User, Lock, FileText, Download, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const INDIAN_BANKS = [
    "HDFC Bank", "State Bank of India (SBI)", "ICICI Bank", "Axis Bank", 
    "Kotak Mahindra Bank", "IndusInd Bank", "Punjab National Bank (PNB)", 
    "Bank of Baroda", "Canara Bank", "Union Bank of India"
];

const Profile = () => {
    const { user, updateSession } = useAuth();
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        dob: user?.dob ? user.dob.split('T')[0] : '',
        phoneNumber: user?.phoneNumber || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        bankName: user?.bankAccount?.bankName || '',
        accountNumber: user?.bankAccount?.accountNumber || '',
        ifscCode: user?.bankAccount?.ifsc || ''
    });
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        setProfileMessage({ type: '', text: '' });
        try {
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('dob', profileData.dob);
            formData.append('phoneNumber', profileData.phoneNumber);
            formData.append('address', JSON.stringify({ 
                street: profileData.street, 
                city: profileData.city, 
                state: profileData.state 
            }));
            formData.append('bankAccount', JSON.stringify({
                bankName: profileData.bankName,
                accountNumber: profileData.accountNumber,
                ifsc: profileData.ifscCode
            }));
            
            const res = await apiClient.put('/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            let messageText = res.data.message || 'Profile updated successfully!';
            setProfileMessage({ type: 'success', text: messageText });

            if (res.data.user) {
                if (typeof updateSession === 'function') {
                    updateSession(res.data.user);
                } else {
                    window.location.reload(); 
                }
            }
        } catch (error) {
            setProfileMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoadingProfile(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Profile Settings</h1>
                <p className="text-sm text-zinc-500 mt-1">Manage your personal information, security, and KYC documents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-zinc-200 shadow-sm bg-white">
                        <CardHeader className="border-b border-zinc-100 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-zinc-500" /> Personal Information
                            </CardTitle>
                            <CardDescription>Update your contact and address details.</CardDescription>
                        </CardHeader>
                        
                        <form onSubmit={handleProfileUpdate}>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input 
                                            type="text" 
                                            value={profileData.name} 
                                            onChange={e => setProfileData({...profileData, name: e.target.value})}
                                            required
                                            className="bg-white border-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input 
                                            type="email" 
                                            value={user?.email || ''} 
                                            disabled
                                            className="bg-zinc-50 text-zinc-500 border-zinc-200"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input 
                                            type="tel" 
                                            required
                                            value={profileData.phoneNumber} 
                                            onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})}
                                            className="bg-white border-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <Input 
                                            type="date" 
                                            required
                                            value={profileData.dob} 
                                            onChange={e => setProfileData({...profileData, dob: e.target.value})}
                                            className="bg-white border-zinc-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-zinc-500" /> Address Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Street Address</Label>
                                            <Input 
                                                type="text" 
                                                required
                                                value={profileData.street} 
                                                onChange={e => setProfileData({...profileData, street: e.target.value})}
                                                className="bg-white border-zinc-200"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>City</Label>
                                                <Input 
                                                    type="text" 
                                                    required
                                                    value={profileData.city} 
                                                    onChange={e => setProfileData({...profileData, city: e.target.value})}
                                                    className="bg-white border-zinc-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>State</Label>
                                                <Input 
                                                    type="text" 
                                                    required
                                                    value={profileData.state} 
                                                    onChange={e => setProfileData({...profileData, state: e.target.value})}
                                                    className="bg-white border-zinc-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-zinc-100">
                                    <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-zinc-500" /> Bank Details
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Bank Name</Label>
                                            <Select value={profileData.bankName} onValueChange={(val) => setProfileData({...profileData, bankName: val})} required>
                                                <SelectTrigger className="w-full bg-white border-zinc-200">
                                                    <SelectValue placeholder="Select Bank" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {INDIAN_BANKS.map((b) => (
                                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Account Number</Label>
                                            <Input 
                                                type="text" 
                                                required
                                                value={profileData.accountNumber} 
                                                onChange={e => setProfileData({...profileData, accountNumber: e.target.value})}
                                                className="bg-white border-zinc-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-w-xs">
                                        <Label>IFSC Code</Label>
                                        <Input 
                                            type="text" 
                                            required
                                            value={profileData.ifscCode} 
                                            onChange={e => setProfileData({...profileData, ifscCode: e.target.value})}
                                            className="bg-white border-zinc-200 uppercase"
                                            maxLength={11}
                                        />
                                    </div>
                                </div>

                                
                                {profileMessage.text && (
                                    <Alert variant={profileMessage.type === 'error' ? 'destructive' : 'default'} className={profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''}>
                                        <AlertDescription>{profileMessage.text}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                            <CardFooter className="bg-zinc-50 border-t border-zinc-100 py-4 flex justify-end">
                                <Button type="submit" disabled={loadingProfile} className="bg-zinc-900 text-white hover:bg-zinc-800">
                                    {loadingProfile ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-zinc-200 shadow-sm bg-white">
                        <CardHeader className="pb-3 border-b border-zinc-100">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Lock className="w-4 h-4 text-zinc-500" /> Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-zinc-900">Password</p>
                                <p className="text-xs text-zinc-500">Last changed 3 months ago</p>
                            </div>
                            <Button variant="outline" className="w-full text-zinc-600" onClick={() => navigate('/forgot-password')}>Change Password</Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default Profile;
