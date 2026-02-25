import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, MapPin, Store, ShoppingBag, Utensils } from 'lucide-react';
import api from '../../config/api';

interface City {
    id: string;
    name: string;
}

interface Restaurant {
    id: string;
    name: string;
    address: string;
    landmark: string;
    rating: number;
    city: City; // Or just cityId depending on backend response, assuming City object for now
}

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'CITIES' | 'RESTAURANTS' | 'ORDERS' | 'FOOD_ITEMS'>('CITIES');

    // City State
    const [cities, setCities] = useState<City[]>([]);
    const [newCityName, setNewCityName] = useState('');

    // Restaurant State
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedCityForRestaurants, setSelectedCityForRestaurants] = useState<string>('');
    const [newRestName, setNewRestName] = useState('');
    const [newRestAddress, setNewRestAddress] = useState('');
    const [newRestRating, setNewRestRating] = useState('4.0');

    // Food Item State
    const [foodItems, setFoodItems] = useState<any[]>([]);
    const [selectedRestaurantForItems, setSelectedRestaurantForItems] = useState<string>('');
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemType, setNewItemType] = useState('VEG');
    const [isLoadingItems, setIsLoadingItems] = useState(false);

    // Order State
    const [orders, setOrders] = useState<any[]>([]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (activeTab === 'RESTAURANTS' && selectedCityForRestaurants) {
            fetchRestaurants(selectedCityForRestaurants);
        } else if (activeTab === 'ORDERS') {
            fetchOrders();
        } else if (activeTab === 'FOOD_ITEMS' && selectedRestaurantForItems) {
            fetchFoodItems(selectedRestaurantForItems);
        }
    }, [activeTab, selectedCityForRestaurants, selectedRestaurantForItems]);

    const fetchCities = async () => {
        try {
            const { data } = await api.get<City[]>('/cities');
            setCities(data);
            if (data.length > 0 && !selectedCityForRestaurants) {
                setSelectedCityForRestaurants(data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch cities', error);
        }
    };

    const fetchRestaurants = async (cityId: string) => {
        try {
            const { data } = await api.get<Restaurant[]>(`/restaurants?cityId=${cityId}`);
            setRestaurants(data);
        } catch (error) {
            console.error('Failed to fetch restaurants', error);
        }
    };

    const fetchOrders = async () => {
        setIsOrdersLoading(true);
        try {
            const { data } = await api.get<any[]>('/orders');
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setIsOrdersLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/orders/${orderId}/status?status=${status}`);
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order status', error);
            alert('Failed to update status');
        }
    };

    const fetchFoodItems = async (restaurantId: string) => {
        setIsLoadingItems(true);
        try {
            const { data } = await api.get<any[]>(`/items?restaurantId=${restaurantId}`);
            setFoodItems(data);
        } catch (error) {
            console.error('Failed to fetch food items', error);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const handleAddFoodItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim() || !newItemPrice || !selectedRestaurantForItems) return;
        try {
            await api.post('/items', {
                name: newItemName,
                price: parseFloat(newItemPrice),
                itemType: newItemType,
                restaurant: { id: selectedRestaurantForItems }
            });
            setNewItemName('');
            setNewItemPrice('');
            fetchFoodItems(selectedRestaurantForItems);
            alert('Item added successfully!');
        } catch (error) {
            console.error('Failed to add item', error);
            alert('Failed to add item.');
        }
    };

    const handleDeleteFoodItem = async (id: string) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await api.delete(`/items/${id}`);
            fetchFoodItems(selectedRestaurantForItems);
        } catch (error) {
            console.error('Failed to delete item', error);
            alert('Failed to delete item.');
        }
    };

    const handleAddCity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCityName.trim()) return;
        try {
            await api.post('/cities', { name: newCityName });
            setNewCityName('');
            fetchCities();
        } catch (error) {
            console.error('Failed to add city', error);
            alert('Failed to add city.');
        }
    };

    const handleDeleteCity = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this city?')) return;
        try {
            await api.delete(`/cities/${id}`);
            fetchCities();
        } catch (error) {
            console.error('Failed to delete city', error);
            alert('Failed to delete city. It might have associated restaurants.');
        }
    };

    const handleDeleteRestaurant = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
        try {
            await api.delete(`/restaurants/${id}`);
            fetchRestaurants(selectedCityForRestaurants);
        } catch (error) {
            console.error('Failed to delete restaurant', error);
            alert('Failed to delete restaurant.');
        }
    };

    const handleAddRestaurant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRestName.trim() || !selectedCityForRestaurants) return;
        try {
            await api.post('/restaurants', {
                name: newRestName,
                address: newRestAddress,
                rating: parseFloat(newRestRating) || 4.0,
                city: { id: selectedCityForRestaurants }
            });
            setNewRestName('');
            setNewRestAddress('');
            setNewRestRating('4.0');
            fetchRestaurants(selectedCityForRestaurants);
            alert('Restaurant added successfully!');
        } catch (error) {
            console.error('Failed to add restaurant', error);
            alert('Failed to add restaurant.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">

            {/* Sidebar / Tabs */}
            <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Admin Panel</h2>
                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveTab('CITIES')}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'CITIES' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <MapPin size={18} className="mr-3" /> Cities
                    </button>
                    <button
                        onClick={() => setActiveTab('RESTAURANTS')}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'RESTAURANTS' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Store size={18} className="mr-3" /> Restaurants
                    </button>
                    <button
                        onClick={() => setActiveTab('ORDERS')}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'ORDERS' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <ShoppingBag size={18} className="mr-3" /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('FOOD_ITEMS')}
                        className={`w-full flex items-center px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'FOOD_ITEMS' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Utensils size={18} className="mr-3" /> Menu Items
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {activeTab === 'CITIES' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Cities</h2>

                        {/* Add City Form */}
                        <form onSubmit={handleAddCity} className="flex gap-3 mb-8">
                            <input
                                type="text"
                                value={newCityName}
                                onChange={(e) => setNewCityName(e.target.value)}
                                placeholder="Enter new city name..."
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                            />
                            <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors flex items-center">
                                <Plus size={18} className="mr-1" /> Add
                            </button>
                        </form>

                        {/* City List */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                            {cities.map(city => (
                                <div key={city.id} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-white transition-colors">
                                    <span className="font-medium text-gray-800">{city.name}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteCity(city.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {cities.length === 0 && <div className="p-8 text-center text-gray-500">No cities added yet.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'RESTAURANTS' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Manage Restaurants</h2>
                        </div>

                        {/* Add Restaurant Form */}
                        <form onSubmit={handleAddRestaurant} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                                <input required value={newRestName} onChange={e => setNewRestName(e.target.value)} type="text" placeholder="e.g. Pizza Hut" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input value={newRestAddress} onChange={e => setNewRestAddress(e.target.value)} type="text" placeholder="Full Address" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                    <input value={newRestRating} onChange={e => setNewRestRating(e.target.value)} type="number" step="0.1" max="5" min="1" placeholder="4.5" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold transition-colors">
                                Save Restaurant
                            </button>
                        </form>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select City</label>
                            <select
                                value={selectedCityForRestaurants}
                                onChange={e => setSelectedCityForRestaurants(e.target.value)}
                                className="w-full md:w-1/2 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Restaurant List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {restaurants.map(r => (
                                <div key={r.id} className="border border-gray-200 p-4 rounded-xl flex items-start justify-between bg-white hover:border-primary-200 transition-colors">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{r.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.address}</p>
                                        <div className="text-xs bg-green-50 text-green-700 inline-block px-2 py-1 rounded mt-2 font-medium">
                                            Rating: {r.rating}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => {
                                                setSelectedRestaurantForItems(r.id);
                                                setActiveTab('FOOD_ITEMS');
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Utensils size={16} /> <span className="text-xs font-medium">Menu</span>
                                        </button>
                                        <button className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteRestaurant(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {restaurants.length === 0 && <div className="col-span-full py-8 text-center text-gray-500">No restaurants found for this city.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'ORDERS' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h2>
                        {isOrdersLoading ? (
                            <p>Loading orders...</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                                        <div>
                                            <p className="font-bold text-gray-900">Order #{order.id.split('-')[0].toUpperCase()}</p>
                                            <p className="text-sm text-gray-500">User: {order.user?.phoneOrEmail}</p>
                                            <p className="text-sm font-medium">Total: ${order.totalPrice.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">Placed: {new Date(order.placedAt).toLocaleString()}</p>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className="text-sm border border-gray-200 rounded-lg p-1 outline-none focus:ring-1 focus:ring-primary-500"
                                            >
                                                <option value="PLACED">Placed</option>
                                                <option value="PREPARING">Preparing</option>
                                                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-center text-gray-500 py-8">No orders found.</p>}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'FOOD_ITEMS' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Menu Items</h2>

                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Restaurant</label>
                            <select
                                value={selectedRestaurantForItems}
                                onChange={e => setSelectedRestaurantForItems(e.target.value)}
                                className="w-full md:w-1/2 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 mb-6"
                            >
                                <option value="">-- Choose a Restaurant --</option>
                                {restaurants.map(res => <option key={res.id} value={res.id}>{res.name}</option>)}
                            </select>

                            {selectedRestaurantForItems && (
                                <form onSubmit={handleAddFoodItem} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 py-4 border-t border-gray-200">
                                    <input required value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Item Name" className="px-4 py-2 border border-gray-200 rounded-lg" />
                                    <input required type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Price" className="px-4 py-2 border border-gray-200 rounded-lg" />
                                    <select value={newItemType} onChange={e => setNewItemType(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg whitespace-nowrap">
                                        <option value="NO_ADDON_NO_VARIANT">NO ADDON / NO VARIANT</option>
                                        <option value="ADDON_NO_VARIANT">ADDON ONLY</option>
                                        <option value="VARIANT_NO_ADDON">VARIANT ONLY</option>
                                        <option value="VARIANT_AND_ADDON">BOTH ADDON & VARIANT</option>
                                    </select>
                                    <button type="submit" className="md:col-span-3 bg-gray-800 text-white py-2 rounded-lg font-bold hover:bg-gray-900">Add Item</button>
                                </form>
                            )}
                        </div>

                        {selectedRestaurantForItems && (
                            <div className="space-y-3">
                                {isLoadingItems ? <p>Loading items...</p> : foodItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-500">${item.price.toFixed(2)} • {item.itemType}</p>
                                        </div>
                                        <button onClick={() => handleDeleteFoodItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {!isLoadingItems && foodItems.length === 0 && <p className="text-center text-gray-500 py-4">No items found for this restaurant.</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
