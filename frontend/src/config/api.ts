import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://fooddash-api.onrender.com/api',
    timeout: 30000, // 30 second timeout for Render free tier cold-starts
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
