import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

export const useSession = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                setIsLoading(true);
                const res = await authApi.getMe();
                setUser(res.data.user);
                setError(null);
            } catch (err) {
                // Token expired or invalid
                localStorage.removeItem('finnovax_user');
                localStorage.removeItem('finnovax_access_token');
                localStorage.removeItem('finnovax_refresh_token');
                setUser(null);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem('finnovax_user');
        localStorage.removeItem('finnovax_access_token');
        localStorage.removeItem('finnovax_refresh_token');
        setUser(null);
    }, []);

    const updateSession = useCallback((userData) => {
        localStorage.setItem('finnovax_user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    return { user, isLoading, error, clearSession, updateSession };
};
