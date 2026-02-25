import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Mail, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { requestOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleGetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;
        setIsLoading(true);
        try {
            await requestOtp(identifier);
            setStep(2);
        } catch (error) {
            console.error(error);
            alert('Failed to send OTP. Please check server connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) return;
        setIsLoading(true);
        try {
            await verifyOtp(identifier, otp);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md" style={{ animation: 'slide-up 0.5s ease-out both' }}>
                {/* Card */}
                <div className="rounded-3xl p-8 shadow-2xl border border-white/60"
                    style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

                    {/* Logo / Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4"
                            style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                            <ChefHat className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Welcome to{' '}
                            <span style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                FoodDash
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-2">
                            {step === 1 ? 'Enter your phone or email to continue' : 'Check your console for the OTP code'}
                        </p>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-500' : 'bg-gray-100'}`} />
                        <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-100'}`} />
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleGetOtp} className="space-y-4">
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Phone or Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm font-medium"
                                        placeholder="e.g. user@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Get OTP
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Enter OTP
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm font-medium tracking-[0.25em] text-center"
                                        placeholder="• • • • • •"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5 text-center">Check your backend console for OTP: <span className="font-bold text-primary-500">123456</span></p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verify & Login
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-sm text-gray-400 hover:text-gray-700 transition-colors duration-200 py-2 font-medium"
                            >
                                ← Change number/email
                            </button>
                        </form>
                    )}
                </div>

                {/* Tagline */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    🍔 Delicious food, delivered fast · FoodDash © 2025
                </p>
            </div>
        </div>
    );
};

export default Login;
