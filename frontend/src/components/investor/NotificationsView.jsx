import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Clock, AlertCircle, XCircle, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '../../api/client';
import { Button } from "@/components/ui/button";

const getIcon = (type) => {
    switch (type) {
        case 'TICKET_RESOLVED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'DOCUMENT_REJECTED': return <XCircle className="w-5 h-5 text-red-500" />;
        case 'STATUS_CHANGED': return <Clock className="w-5 h-5 text-blue-500" />;
        case 'SLA_WARNING': return <AlertCircle className="w-5 h-5 text-amber-500" />;
        default: return <Bell className="w-5 h-5 text-zinc-500" />;
    }
};

const getBgColor = (type) => {
    switch (type) {
        case 'TICKET_RESOLVED': return 'bg-emerald-50/50';
        case 'DOCUMENT_REJECTED': return 'bg-red-50/50';
        case 'STATUS_CHANGED': return 'bg-blue-50/50';
        case 'SLA_WARNING': return 'bg-amber-50/50';
        default: return 'bg-zinc-50/50';
    }
};

const NotificationsView = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/notifications?_t=${Date.now()}`);
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleDelete = async (id) => {
        try {
            await apiClient.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all notifications?")) return;
        try {
            await apiClient.delete('/notifications');
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications', error);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900">Your Notifications</h2>
                    <p className="text-sm text-zinc-500">Stay updated on your ticket journey</p>
                </div>
                {notifications.length > 0 && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClearAll}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-zinc-100">
                        <AnimatePresence>
                            {notifications.map(notif => (
                                <motion.div 
                                    key={notif._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-4 flex gap-4 items-start group transition-colors hover:bg-zinc-50 ${!notif.readAt ? getBgColor(notif.type) : 'bg-white'}`}
                                >
                                    <div className="mt-1 shrink-0 p-2 bg-white rounded-full shadow-sm border border-zinc-100">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <h4 className={`text-sm font-semibold text-zinc-900 truncate ${!notif.readAt ? 'font-bold' : ''}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[10px] font-medium text-zinc-400 shrink-0 uppercase tracking-wider">
                                                {format(new Date(notif.createdAt), 'MMM dd, HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-600 leading-relaxed">
                                            {notif.message}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDelete(notif._id)}
                                            className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                            title="Delete Notification"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500">
                        <div className="h-16 w-16 bg-zinc-50 rounded-full border border-zinc-200 flex items-center justify-center mb-4">
                            <Bell className="h-8 w-8 text-zinc-300" />
                        </div>
                        <p className="font-medium text-zinc-600">No notifications yet</p>
                        <p className="text-sm text-zinc-400 mt-1">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;
