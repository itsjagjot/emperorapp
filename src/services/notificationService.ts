import { API_BASE_URL, DEFAULT_EXCHANGE } from './config';

export interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
    updated_at: string;
    is_read: number;
}

export const getNotifications = async (
    exchange: string = DEFAULT_EXCHANGE
): Promise<{ success: boolean; data: Notification[] }> => {
    const url = `${API_BASE_URL}/${exchange}/notifications`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return await response.json();
};

export const markNotificationRead = async (
    id: number,
    exchange: string = DEFAULT_EXCHANGE
): Promise<any> => {
    const url = `${API_BASE_URL}/${exchange}/notifications/${id}/read`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return await response.json();
};

export interface NotificationSettings {
    market_order: boolean;
    pending_order: boolean;
    execute_pending: boolean;
    delete_pending: boolean;
    trading_sound: boolean;
}

export const getNotificationSettings = async (
    exchange: string = DEFAULT_EXCHANGE
): Promise<{ success: boolean; data: NotificationSettings }> => {
    const url = `${API_BASE_URL}/${exchange}/notification-settings`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return await response.json();
};

export const updateNotificationSettings = async (
    settings: NotificationSettings,
    exchange: string = DEFAULT_EXCHANGE
): Promise<{ success: boolean; message: string; data: NotificationSettings }> => {
    const url = `${API_BASE_URL}/${exchange}/notification-settings`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'POST', // Note: Using POST for update/create as per Laravel route
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
    });

    return await response.json();
};
