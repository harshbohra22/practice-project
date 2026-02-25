import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface OrderUpdate {
    orderId: string;
    status: string;
}

export const useOrderNotifications = (onUpdate: (update: OrderUpdate) => void) => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Note: In a real production app with auth headers, 
        // EventSource might need a polyfill (like event-source-polyfill) to pass native headers.
        // For simplicity here, we use the standard EventSource.
        const eventSource = new EventSource(`http://localhost:8080/api/notifications/subscribe/${user.id}`);

        eventSource.addEventListener('ORDER_UPDATE', (event) => {
            const data = JSON.parse(event.data);
            onUpdate(data);
        });

        eventSource.addEventListener('INIT', (event) => {
            console.log('SSE Initialized:', event.data);
        });

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            // eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [user, onUpdate]);
};
