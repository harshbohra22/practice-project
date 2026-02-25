import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2, ChefHat, Sparkles, X } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface Variant { id: string; name: string; priceModifier: number; }
interface Addon { id: string; name: string; price: number; }
interface FoodItem {
    id: string; name: string; price: number;
    itemType: 'NO_ADDON_NO_VARIANT' | 'ADDON_NO_VARIANT' | 'VARIANT_NO_ADDON' | 'VARIANT_AND_ADDON';
}

const FOOD_EMOJIS = ['🍕', '🍔', '🌮', '🍜', '🍱', '🥘', '🍛', '🍣', '🌯', '🫔', '🥗', '🍖'];

const RestaurantMenu = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, addToCart, removeFromCart, cartTotal } = useCart();

    const [items, setItems] = useState<FoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItemConfig, setSelectedItemConfig] = useState<FoodItem | null>(null);
    const [availableVariants, setAvailableVariants] = useState<Variant[]>([]);
    const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
    const [chosenVariant, setChosenVariant] = useState<Variant | undefined>();
    const [chosenAddons, setChosenAddons] = useState<Addon[]>([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const { data } = await api.get<FoodItem[]>(`/items?restaurantId=${id}`);
                setItems(data);
            } catch (error) {
                console.error('Error fetching menu', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchMenu();
    }, [id]);

    const openConfigModal = async (item: FoodItem) => {
        setSelectedItemConfig(item);
        setChosenVariant(undefined);
        setChosenAddons([]);
        if (item.itemType.includes('VARIANT')) {
            const { data } = await api.get<Variant[]>(`/items/${item.id}/variants`);
            setAvailableVariants(data);
            if (data.length > 0) setChosenVariant(data[0]);
        }
        if (item.itemType.includes('ADDON')) {
            const { data } = await api.get<Addon[]>(`/items/${item.id}/addons`);
            setAvailableAddons(data);
        }
    };

    const handleAddToCart = (item: FoodItem) => {
        if (item.itemType !== 'NO_ADDON_NO_VARIANT') { openConfigModal(item); return; }
        addConfiguredItemToCart(item, undefined, []);
    };

    const addConfiguredItemToCart = (item: FoodItem, variant?: Variant, addons: Addon[] = []) => {
        let itemTotal = item.price;
        if (variant) itemTotal += variant.priceModifier;
        addons.forEach(a => itemTotal += a.price);
        addToCart({ foodItem: item, quantity: 1, selectedVariant: variant, selectedAddons: addons, totalPrice: itemTotal });
        setSelectedItemConfig(null);
    };

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

    const modalTotal = selectedItemConfig
        ? selectedItemConfig.price + (chosenVariant?.priceModifier || 0) + chosenAddons.reduce((s, a) => s + a.price, 0)
        : 0;

    return (
        <div className="max-w-6xl mx-auto" style={{ animation: 'fade-in 0.4s ease-out' }}>
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-500 transition-colors duration-200 mb-5 font-medium"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Restaurants
            </button>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Menu */}
                <div className="flex-1">
                    {/* Restaurant hero */}
                    <div className="rounded-2xl p-6 mb-6 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #e76f51 0%, #f4a261 100%)' }}>
                        <div className="absolute inset-0 opacity-10 float-anim"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 30%, white 2px, transparent 2px)', backgroundSize: '50px 50px' }} />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                                🏪
                            </div>
                            <div>
                                <p className="text-white/70 text-xs font-semibold tracking-wide uppercase">Full Menu</p>
                                <h1 className="text-2xl font-black text-white">Our Delicious Dishes</h1>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-4">
                                    <div className="w-16 h-16 rounded-xl shimmer flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 shimmer rounded w-2/3" />
                                        <div className="h-3 shimmer rounded w-1/3" />
                                    </div>
                                    <div className="w-10 h-10 shimmer rounded-xl" />
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Menu coming soon</h3>
                            <p className="text-gray-400 text-sm">This restaurant hasn't added items yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
                                    style={{ animation: `slide-up 0.3s ease-out ${idx * 0.06}s both` }}
                                >
                                    {/* Food emoji placeholder */}
                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl group-hover:scale-110 transition-transform duration-200"
                                        style={{ background: `hsl(${(idx * 53) % 360}, 30%, 92%)` }}>
                                        {FOOD_EMOJIS[idx % FOOD_EMOJIS.length]}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-primary-600 font-bold text-sm mt-0.5">₹{item.price.toFixed(0)}</p>
                                        {item.itemType !== 'NO_ADDON_NO_VARIANT' && (
                                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-500 mt-1">
                                                Customizable ✨
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-600 hover:text-white hover:shadow-md transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                                        style={{
                                            background: 'var(--hover-bg, #fff7f5)',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #e76f51, #f4a261)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = '#fff7f5')}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Sidebar */}
                <div className="w-full lg:w-96">
                    <div className="rounded-2xl shadow-xl border border-white/60 overflow-hidden sticky top-24"
                        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                        {/* Cart header */}
                        <div className="px-6 py-4 flex items-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                            <ShoppingBag className="h-5 w-5 text-white" />
                            <h2 className="font-extrabold text-white">Your Cart</h2>
                            {cartCount > 0 && (
                                <span className="ml-auto bg-white text-primary-600 text-xs font-black px-2 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </div>

                        {/* Items */}
                        {cart.length === 0 ? (
                            <div className="text-center py-12 px-6">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                                <p className="text-gray-400 text-sm font-medium">Add items to start your order</p>
                            </div>
                        ) : (
                            <div className="max-h-72 overflow-y-auto">
                                {cart.map((cartItem, idx) => (
                                    <div key={idx} className="px-5 py-4 border-b border-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{cartItem.foodItem.name}</p>
                                                {(cartItem.selectedVariant || cartItem.selectedAddons.length > 0) && (
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        {cartItem.selectedVariant && <span>{cartItem.selectedVariant.name}</span>}
                                                        {cartItem.selectedAddons.map(a => <span key={a.id}> · {a.name}</span>)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                                <span className="text-sm font-bold text-gray-900">₹{(cartItem.totalPrice * cartItem.quantity).toFixed(0)}</span>
                                                <button
                                                    onClick={() => removeFromCart(idx)}
                                                    className="text-red-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Total + Go to Checkout */}
                        {cart.length > 0 && (
                            <div className="p-5 bg-gray-50/50">
                                <div className="flex justify-between items-center font-black text-gray-900 mb-4">
                                    <span>Subtotal</span>
                                    <span className="text-primary-600">₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                    style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Go to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Configuration Modal */}
            {selectedItemConfig && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    style={{ animation: 'fade-in 0.2s ease-out' }}
                    onClick={e => e.target === e.currentTarget && setSelectedItemConfig(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl"
                        style={{ animation: 'scale-in 0.25s ease-out' }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900">{selectedItemConfig.name}</h3>
                                <p className="text-sm text-gray-400 mt-0.5">Base price: ₹{selectedItemConfig.price.toFixed(0)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedItemConfig(null)}
                                className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Variants */}
                        {availableVariants.length > 0 && (
                            <div className="mb-5">
                                <h4 className="text-sm font-extrabold text-gray-700 mb-3 uppercase tracking-wide">
                                    Choose Size
                                </h4>
                                <div className="space-y-2">
                                    {availableVariants.map(v => (
                                        <label
                                            key={v.id}
                                            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${chosenVariant?.id === v.id
                                                    ? 'border-primary-400 bg-primary-50'
                                                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="variant"
                                                className="mr-3 accent-current"
                                                checked={chosenVariant?.id === v.id}
                                                onChange={() => setChosenVariant(v)}
                                            />
                                            <span className="flex-1 text-sm font-semibold text-gray-800">{v.name}</span>
                                            <span className="text-sm font-bold text-primary-500">+₹{v.priceModifier.toFixed(0)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Addons */}
                        {availableAddons.length > 0 && (
                            <div className="mb-5">
                                <h4 className="text-sm font-extrabold text-gray-700 mb-3 uppercase tracking-wide">
                                    Add Extras
                                </h4>
                                <div className="space-y-2">
                                    {availableAddons.map(a => (
                                        <label
                                            key={a.id}
                                            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-150 ${chosenAddons.some(add => add.id === a.id)
                                                    ? 'border-primary-400 bg-primary-50'
                                                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="mr-3 rounded accent-current"
                                                checked={chosenAddons.some(add => add.id === a.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setChosenAddons(prev => [...prev, a]);
                                                    else setChosenAddons(prev => prev.filter(add => add.id !== a.id));
                                                }}
                                            />
                                            <span className="flex-1 text-sm font-semibold text-gray-800">{a.name}</span>
                                            <span className="text-sm font-bold text-primary-500">+₹{a.price.toFixed(0)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedItemConfig(null)}
                                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => addConfiguredItemToCart(selectedItemConfig!, chosenVariant, chosenAddons)}
                                className="flex-1 py-3 rounded-2xl font-black text-white text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                            >
                                Add · ₹{modalTotal.toFixed(0)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantMenu;
