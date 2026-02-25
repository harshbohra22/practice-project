import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LogOut, User, Store, ShoppingBag, ChefHat } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const location = useLocation();

    return (
        <nav className="sticky top-0 z-50 border-b border-white/40"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link
                        to={user?.role === 'ADMIN' ? '/admin' : '/'}
                        className="flex items-center space-x-2.5 group"
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200"
                            style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                            <ChefHat className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-extrabold text-xl tracking-tight"
                            style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                            FoodDash
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                {/* User pill */}
                                <Link
                                    to="/profile"
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === '/profile'
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        {user.phoneOrEmail.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden sm:block max-w-[120px] truncate">{user.phoneOrEmail}</span>
                                </Link>

                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                    {user.role}
                                </span>

                                {/* Cart icon */}
                                {user.role === 'CUSTOMER' && (
                                    <Link
                                        to="/checkout"
                                        className="relative p-2 rounded-xl text-gray-500 hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
                                    >
                                        <ShoppingBag className="h-5 w-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg"
                                                style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {/* Logout */}
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:block">Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
