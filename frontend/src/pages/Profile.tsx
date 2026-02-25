import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrderNotifications } from '../hooks/useOrderNotifications';
import { Package, User, Clock, Bell, Truck, LogOut, ChevronRight, X } from 'lucide-react';
import api from '../config/api';

interface Order {
    id: string; totalPrice: number;
    status: 'PLACED' | 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    PLACED: { label: 'Placed', color: 'text-blue-700', bg: 'bg-blue-50', icon: '📋' },
    PENDING: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-50', icon: '⏳' },
    ACCEPTED: { label: 'Accepted', color: 'text-indigo-700', bg: 'bg-indigo-50', icon: '✅' },
    PREPARING: { label: 'Preparing', color: 'text-orange-700', bg: 'bg-orange-50', icon: '👨‍🍳' },
    READY: { label: 'Ready', color: 'text-teal-700', bg: 'bg-teal-50', icon: '✨' },
    OUT_FOR_DELIVERY: { label: 'On the way', color: 'text-cyan-700', bg: 'bg-cyan-50', icon: '🛵' },
    DELIVERED: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50', icon: '🎉' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', icon: '❌' },
};

const Profile = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<string | null>(null);

    const fetchOrders = async () => {
        if (!user) return;
        setIsLoading(true);
        setOrders([]);
        try {
            const { data } = await api.get<Order[]>(`/orders/user/${user.id}`);
            const sorted = data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            setOrders(sorted);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [user]);

    useOrderNotifications((update) => {
        setNotification(`Order ${update.orderId.slice(0, 8).toUpperCase()} → ${update.status}`);
        fetchOrders();
        setTimeout(() => setNotification(null), 5000);
    });

    if (!user) return <div className="text-center py-20 text-gray-500">Please log in to view your profile.</div>;

    return (
        <div className="max-w-4xl mx-auto" style={{ animation: 'fade-in 0.4s ease-out' }}>
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-bold max-w-xs"
                    style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)', animation: 'slide-down 0.3s ease-out' }}>
                    <Bell className="h-5 w-5 animate-bounce flex-shrink-0" />
                    <span>{notification}</span>
                    <button onClick={() => setNotification(null)} className="ml-auto text-white/70 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <div className="w-full md:w-72">
                    <div className="rounded-2xl p-6 shadow-sm border border-white/60 sticky top-24"
                        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl mb-4"
                                style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                                {user.phoneOrEmail.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="font-extrabold text-gray-900 text-lg leading-tight max-w-[180px] truncate">
                                {user.phoneOrEmail}
                            </h2>
                            <span className="mt-1.5 inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary-50 text-primary-600">
                                {user.role}
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <p className="text-2xl font-black text-primary-500">{orders.length}</p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Orders</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <p className="text-2xl font-black text-green-500">
                                    {orders.filter(o => o.status === 'DELIVERED').length}
                                </p>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Delivered</p>
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 border border-red-100"
                        >
                            <LogOut className="h-4 w-4" /> Log Out
                        </button>
                    </div>
                </div>

                {/* Orders */}
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2">
                        <Clock className="h-6 w-6 text-primary-500" /> Order History
                    </h2>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl shimmer" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 shimmer rounded w-1/3" />
                                            <div className="h-3 shimmer rounded w-1/2" />
                                        </div>
                                        <div className="h-6 w-20 shimmer rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-6xl mb-4 float-anim">📦</div>
                            <h3 className="text-lg font-extrabold text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-400 text-sm">Your order history will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order, idx) => {
                                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PLACED;
                                return (
                                    <div key={order.id}
                                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                        style={{ animation: `slide-up 0.3s ease-out ${idx * 0.07}s both` }}>
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gray-50">
                                                {cfg.icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                                        <p className="font-extrabold text-gray-900 text-lg">₹{order.totalPrice.toFixed(2)}</p>
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {order.status === 'PLACED' && (
                                                            <CancelButton order={order} onSuccess={fetchOrders} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

const CancelButton = ({ order, onSuccess }: { order: Order; onSuccess: () => void }) => {
    const [isCancelling, setIsCancelling] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const placedAt = new Date(order.createdAt).getTime();
            return Math.max(0, 60000 - (Date.now() - placedAt));
        };
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);
            if (left <= 0) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [order.createdAt]);

    const handleCancel = async () => {
        if (!window.confirm('Cancel this order?')) return;
        setIsCancelling(true);
        try {
            await api.post(`/orders/${order.id}/cancel`);
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    if (timeLeft <= 0) return null;

    return (
        <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-bold transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
            <X className="h-3 w-3" />
            {isCancelling ? 'Cancelling...' : `Cancel (${Math.ceil(timeLeft / 1000)}s)`}
        </button>
    );
};
