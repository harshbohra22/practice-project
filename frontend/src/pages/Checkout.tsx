import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, CheckCircle, ArrowLeft, ShoppingBag, Truck, Sparkles, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    if (cart.length === 0 && !orderPlaced) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4" style={{ animation: 'fade-in 0.4s ease-out' }}>
                <div className="text-7xl mb-5 float-anim">🛒</div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">Your cart is empty</h2>
                <p className="text-gray-500 text-sm mb-6">Add some delicious items and come back!</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 rounded-2xl font-bold text-white text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                >
                    Browse Restaurants
                </button>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="w-full max-w-md" style={{ animation: 'scale-in 0.4s ease-out' }}>
                    <div className="text-center p-10 rounded-3xl shadow-2xl border border-white/60"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                        {/* Success circle */}
                        <div className="relative w-24 h-24 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: '#22c55e' }} />
                            <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                <CheckCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed! 🎉</h2>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Your delicious food is being prepared and will be delivered shortly.
                        </p>
                        {/* ETA chip */}
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-8">
                            <Truck className="h-4 w-4" />
                            Estimated: 25–35 min
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                        >
                            Track My Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (!address.trim()) { alert('Please enter a delivery address'); return; }
        setIsProcessing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));
            const orderData = {
                user: { id: user?.id },
                totalPrice: cartTotal + 2.99,
                items: cart.map(item => ({
                    foodItem: { id: item.foodItem.id },
                    variant: item.selectedVariant ? { id: item.selectedVariant.id } : null,
                    quantity: item.quantity,
                    addons: item.selectedAddons.map(addon => ({ addon: { id: addon.id } }))
                }))
            };
            await api.post('/orders', orderData);
            clearCart();
            setOrderPlaced(true);
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto" style={{ animation: 'fade-in 0.4s ease-out' }}>
            {/* Header */}
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-500 transition-colors duration-200 mb-4 font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <h1 className="text-3xl font-black text-gray-900">Checkout</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column */}
                <div className="flex-1 space-y-5">
                    {/* Delivery Details */}
                    <div className="rounded-2xl p-6 shadow-sm border border-white/60"
                        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                        <h3 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                                <MapPin className="h-4 w-4 text-white" />
                            </div>
                            Delivery Details
                        </h3>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Full Address</label>
                        <textarea
                            rows={3}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g. 123 Main St, Apartment 4B, Near City Park"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-primary-400 focus:border-transparent outline-none resize-none transition-all duration-200 text-sm font-medium hover:bg-white"
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="rounded-2xl p-6 shadow-sm border border-white/60"
                        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                        <h3 className="font-extrabold text-gray-900 text-lg mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                                <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            Payment Method
                        </h3>
                        <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary-400 bg-primary-50/60 cursor-pointer">
                            <div className="w-5 h-5 rounded-full border-4 border-primary-500 bg-white shadow-sm" />
                            <div>
                                <p className="font-bold text-primary-900 text-sm">Cash on Delivery</p>
                                <p className="text-xs text-primary-600">Pay when your food arrives</p>
                            </div>
                            <span className="ml-auto text-lg">💵</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96">
                    <div className="rounded-2xl shadow-xl border border-white/60 overflow-hidden sticky top-24"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                        {/* Summary Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-primary-500" />
                            <h3 className="font-extrabold text-gray-900">Order Summary</h3>
                            <span className="ml-auto text-xs font-bold text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
                                {cart.reduce((s, i) => s + i.quantity, 0)} items
                            </span>
                        </div>

                        {/* Items */}
                        <div className="p-6 space-y-3 max-h-[280px] overflow-y-auto">
                            {cart.map((cartItem, idx) => (
                                <div key={idx} className="flex justify-between items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            <span className="text-primary-500">{cartItem.quantity}×</span> {cartItem.foodItem.name}
                                        </p>
                                        {(cartItem.selectedVariant || cartItem.selectedAddons.length > 0) && (
                                            <div className="text-xs text-gray-400 mt-0.5 pl-3 border-l-2 border-primary-100">
                                                {cartItem.selectedVariant && <span>{cartItem.selectedVariant.name}</span>}
                                                {cartItem.selectedAddons.map(a => <span key={a.id}> · {a.name}</span>)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                                        ₹{(cartItem.totalPrice * cartItem.quantity).toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Price breakdown */}
                        <div className="px-6 pb-2 space-y-2 border-t border-gray-100 pt-4">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Delivery fee</span>
                                <span className="font-semibold">₹2.99</span>
                            </div>
                            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span className="text-primary-600">₹{(cartTotal + 2.99).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <div className="p-6 pt-4">
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing || !address.trim()}
                                className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    <><Sparkles className="h-4 w-4" /> Place Order · ₹{(cartTotal + 2.99).toFixed(2)}</>
                                )}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-3">🔒 Secure checkout · Free cancellation within 1 min</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
