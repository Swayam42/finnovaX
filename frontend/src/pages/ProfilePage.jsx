import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 8) {
            setStatus({ type: 'error', message: 'New password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            await apiClient.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            setStatus({ type: 'success', message: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to update password' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div>
                <div>
                    <h1>My Profile</h1>
                    <p>Manage your account settings and security preferences.</p>
                </div>
            </div>

            <div>
                {/* Profile Details Card */}
                <div>
                    <div>
                        <div>
                            <User  />
                        </div>
                        <div>
                            <h2>Account Details</h2>
                            <p>Your personal information</p>
                        </div>
                    </div>

                    <div>
                        <div>
                            <label>Full Name</label>
                            <div>
                                {user?.name}
                            </div>
                        </div>
                        <div>
                            <label>Email Address</label>
                            <div>
                                {user?.email}
                            </div>
                        </div>
                        <div>
                            <label>Account Role</label>
                            <div>
                                {user?.role}
                            </div>
                        </div>
                        <div>
                            <label>KYC Status</label>
                            <div>
                                <Shield  />
                                <span>Pending Update</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Change Card */}
                <div>
                    <div>
                        <div>
                            <Key  />
                        </div>
                        <div>
                            <h2>Security</h2>
                            <p>Update password</p>
                        </div>
                    </div>

                    <div>
                        <p style={{marginTop: '1rem', color: '#666'}}>To update your password, please use the secure password reset flow.</p>
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            style={{marginTop: '1rem', padding: '0.5rem 1rem', background: '#000', color: '#fff', borderRadius: '4px'}}>
                            Reset Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
