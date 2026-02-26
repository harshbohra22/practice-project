import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Mail, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'IDENTIFIER' | 'OTP'>('IDENTIFIER');
    const [loading, setLoading] = useState(false);

    const { requestOtp, verifyOtp, loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;
        setLoading(true);
        try {
            await requestOtp(identifier);
            setStep('OTP');
        } catch (error) {
            alert('Failed to send OTP. Please check server connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyOtp(identifier, otp);
            navigate('/');
        } catch (error) {
            alert('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || !password.trim()) return;
        setLoading(true);
        try {
            await loginAdmin(identifier, password);
            navigate('/admin');
        } catch (error) {
            alert('Invalid Admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-primary-100/50 border border-primary-50 p-8 relative overflow-hidden">
                {/* Background Sparkles */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Sparkles className="w-24 h-24 text-primary-500 animate-pulse" />
                </div>

                <div className="relative">
                    <div className="flex justify-center mb-8">
                        <div className="bg-primary-500 p-4 rounded-2xl shadow-lg shadow-primary-200">
                            <ChefHat className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                            Welcome to <span className="text-primary-600">FoodDash</span>
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {isAdmin ? 'Admin Portal Access' : 'Enter your phone or email to continue'}
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        <button
                            onClick={() => { setIsAdmin(false); setStep('IDENTIFIER'); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isAdmin ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Customer
                        </button>
                        <button
                            onClick={() => setIsAdmin(true)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isAdmin ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Admin
                        </button>
                    </div>

                    {!isAdmin ? (
                        /* Customer Flow */
                        <form onSubmit={step === 'IDENTIFIER' ? handleRequestOtp : handleVerifyOtp} className="space-y-6">
                            {step === 'IDENTIFIER' ? (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium"
                                            placeholder="Phone or Email"
                                        />
                                    </div>
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? 'Sending OTP...' : (
                                            <>
                                                Get OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium tracking-[0.5em] text-center"
                                            placeholder="••••••"
                                            maxLength={6}
                                        />
                                    </div>
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary-200 transition-all active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Login Now'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('IDENTIFIER')}
                                        className="w-full text-gray-400 font-bold py-2 text-sm hover:text-gray-600 transition-colors"
                                    >
                                        Change Phone/Email
                                    </button>
                                </div>
                            )}
                        </form>
                    ) : (
                        /* Admin Flow */
                        <form onSubmit={handleAdminLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium"
                                        placeholder="Admin Email"
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                    </div>
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium"
                                        placeholder="Enter Password"
                                    />
                                </div>
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? 'Authenticating...' : 'Login as Admin'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
