import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Variant { id: string; name: string; priceModifier: number; }
interface Addon { id: string; name: string; price: number; }
interface FoodItem {
    id: string;
    name: string;
    price: number;
    itemType: 'NO_ADDON_NO_VARIANT' | 'ADDON_NO_VARIANT' | 'VARIANT_NO_ADDON' | 'VARIANT_AND_ADDON';
}

export interface CartItem {
    foodItem: FoodItem;
    quantity: number;
    selectedVariant?: Variant;
    selectedAddons: Addon[];
    totalPrice: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const { user } = useAuth();

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Clear cart on logout
    useEffect(() => {
        if (!user) {
            setCart([]);
            localStorage.removeItem('cart');
        }
    }, [user]);

    const addToCart = (newItem: CartItem) => {
        setCart(prev => {
            // Check if exact same config already exists
            const existingIndex = prev.findIndex(item =>
                item.foodItem.id === newItem.foodItem.id &&
                item.selectedVariant?.id === newItem.selectedVariant?.id &&
                JSON.stringify(item.selectedAddons.map(a => a.id).sort()) === JSON.stringify(newItem.selectedAddons.map(a => a.id).sort())
            );

            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += newItem.quantity;
                return updated;
            }
            return [...prev, newItem];
        });
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
