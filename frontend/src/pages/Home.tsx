import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Utensils, Search, TrendingUp, Flame } from 'lucide-react';
import api from '../config/api';

interface City { id: string; name: string; }
interface Restaurant {
    id: string; name: string; address: string; landmark: string;
    rating: number; deliveryTime?: number; costForTwo?: number;
}

const CITY_EMOJIS: Record<string, string> = {
    Mumbai: '🏙️', Bangalore: '🌿', Delhi: '🕌', Pune: '🏛️', Chennai: '🌊',
};

const Home = () => {
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedCityName, setSelectedCityName] = useState<string>('');
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const { data } = await api.get<City[]>('/cities');
                setCities(data);
            } catch (error) {
                console.error('Error fetching cities', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCities();
    }, []);

    useEffect(() => {
        if (!selectedCity) { setRestaurants([]); return; }
        const fetchRestaurants = async () => {
            setIsLoadingRestaurants(true);
            setRestaurants([]);
            try {
                const { data } = await api.get<Restaurant[]>(`/restaurants?cityId=${selectedCity}`);
                setRestaurants(data);
                setSearchResults([]);
                setSearchQuery('');
            } catch (error) {
                console.error('Error fetching restaurants', error);
            } finally {
                setIsLoadingRestaurants(false);
            }
        };
        fetchRestaurants();
    }, [selectedCity]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            const { data } = await api.get(`/search?q=${searchQuery}`);
            setSearchResults(data);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(e.target.value);
        const city = cities.find(c => c.id === e.target.value);
        setSelectedCityName(city?.name || '');
    };

    const ratingColor = (r: number) =>
        r >= 4.5 ? 'text-green-700 bg-green-100' : r >= 4 ? 'text-emerald-700 bg-emerald-100' : 'text-yellow-700 bg-yellow-100';

    return (
        <div className="max-w-5xl mx-auto" style={{ animation: 'fade-in 0.4s ease-out' }}>

            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl mb-8 p-8 md:p-12"
                style={{ background: 'linear-gradient(135deg, #e76f51 0%, #f4a261 60%, #e9c46a 100%)' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                        <Flame className="h-3 w-3" /> Hot deals today
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                        Hungry? We've got<br />
                        <span className="text-yellow-100">your cravings</span> covered 🍽️
                    </h1>
                    <p className="text-white/80 text-sm font-medium">
                        Choose your city and discover amazing restaurants near you.
                    </p>
                </div>
                <div className="absolute right-8 bottom-4 text-7xl opacity-20 float-anim">🍕</div>
            </div>

            {/* City Selector */}
            <div className="rounded-2xl p-6 mb-6 shadow-sm border border-white/70"
                style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                            style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}>
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Delivering to</p>
                            <p className="text-sm font-bold text-gray-800">
                                {selectedCityName || 'Select a city'}
                            </p>
                        </div>
                    </div>
                    <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 cursor-pointer"
                    >
                        <option value="">— Choose a city —</option>
                        {isLoading ? (
                            <option disabled>Loading cities...</option>
                        ) : (
                            cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {CITY_EMOJIS[city.name] || '📍'} {city.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search for food, restaurants..."
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white/90 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-3.5 rounded-2xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #e76f51, #f4a261)' }}
                >
                    <Search className="h-4 w-4" />
                    Search
                </button>
            </form>

            {/* Restaurants / Search Results */}
            {selectedCity && (
                <div style={{ animation: 'fade-in 0.4s ease-out' }}>
                    <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                        {searchResults.length > 0 ? (
                            <><TrendingUp className="h-5 w-5 text-primary-500" /> Search Results</>
                        ) : (
                            <><Utensils className="h-5 w-5 text-primary-500" /> Restaurants in {selectedCityName}</>
                        )}
                    </h3>

                    {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                            {searchResults.map((item: any) => (
                                <div key={item.id}
                                    className="p-4 rounded-2xl border border-primary-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                                    style={{ animation: 'scale-in 0.3s ease-out' }}>
                                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{item.restaurantName} · {item.cityName}</p>
                                </div>
                            ))}
                        </div>
                    ) : isLoadingRestaurants ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                    <div className="h-40 shimmer" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 shimmer rounded w-3/4" />
                                        <div className="h-3 shimmer rounded w-full" />
                                        <div className="h-3 shimmer rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : restaurants.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No restaurants yet</h3>
                            <p className="text-gray-500 text-sm">We're expanding to {selectedCityName} soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {restaurants.map((r, idx) => (
                                <Link
                                    to={`/restaurant/${r.id}`}
                                    key={r.id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                                    style={{ animation: `scale-in 0.3s ease-out ${idx * 0.08}s both` }}
                                >
                                    {/* Restaurant image placeholder with gradient */}
                                    <div className="h-40 relative overflow-hidden"
                                        style={{ background: `linear-gradient(135deg, hsl(${(idx * 47) % 360}, 40%, 88%), hsl(${(idx * 47 + 40) % 360}, 35%, 80%))` }}>
                                        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                                            {['🍕', '🍔', '🌮', '🍜', '🍱', '🥘'][idx % 6]}
                                        </div>
                                        {/* Rating badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md ${ratingColor(r.rating)}`}>
                                                <Star className="h-3 w-3 fill-current" /> {r.rating}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <h4 className="font-extrabold text-gray-900 text-base group-hover:text-primary-600 transition-colors duration-200 line-clamp-1">
                                            {r.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{r.address}</p>

                                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50 text-xs font-semibold text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-primary-400" />
                                                {r.deliveryTime || 30} min
                                            </span>
                                            <span className="text-gray-200">·</span>
                                            <span>₹{r.costForTwo || 500} for two</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Empty state — no city selected */}
            {!selectedCity && !isLoading && (
                <div className="text-center py-16" style={{ animation: 'fade-in 0.5s ease-out' }}>
                    <div className="text-7xl mb-5 float-anim">🌆</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Pick your city to get started</h3>
                    <p className="text-gray-400 text-sm">Great food is just a click away.</p>
                </div>
            )}
        </div>
    );
};

export default Home;
