import { createContext, useContext, useState, type ReactNode } from 'react';
import api from '../config/api';

interface User {
    id: string;
    phoneOrEmail: string;
    role: 'CUSTOMER' | 'ADMIN';
}

interface AuthContextType {
    user: User | null;
    requestOtp: (identifier: string) => Promise<void>;
    verifyOtp: (identifier: string, otp: string) => Promise<void>;
    loginAdmin: (username: string, passwordHash: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });

    const requestOtp = async (identifier: string) => {
        try {
            await api.post(`/auth/customer/get_otp?phoneOrEmail=${identifier}`);
        } catch (error) {
            console.error('Request OTP Failed', error);
            throw error;
        }
    };

    const verifyOtp = async (identifier: string, otp: string) => {
        try {
            const response = await api.post(`/auth/customer/verify_otp?phoneOrEmail=${identifier}&otp=${otp}`);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Verify OTP Failed', error);
            throw error;
        }
    };

    const loginAdmin = async (username: string, passwordHash: string) => {
        try {
            const response = await api.post(`/auth/admin/login?username=${username}&passwordHash=${passwordHash}`);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Admin Login Failed', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, requestOtp, verifyOtp, loginAdmin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
