import { API_BASE_URL } from './config';

export interface TradeOrder {
    id?: number;
    name: string;
    symbol: string;
    symbol_instrument?: string;
    symbol_expiry?: string;
    order_type: string;
    action: string;
    quantity: number;
    lot_size?: number;
    price: number;
    username: string;
    deals?: number;
    brokerage?: number;
    status?: string;
    square?: number;
    duration?: string;
    device?: string;
    order_time?: string;
    execution_time?: string;
}

class TradeService {
    private getExchange() {
        return localStorage.getItem('selectedExchange') || 'mcx';
    }

    private getHeaders() {
        const token = localStorage.getItem('accessToken'); // Matches authService
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async placeOrder(orderData: TradeOrder) {
        try {
            const exchange = this.getExchange();
            const response = await fetch(`${API_BASE_URL}/${exchange}/orders`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(orderData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to place order');
            }
            return data;
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    }

    async getOrders(status?: string) {
        try {
            const exchange = this.getExchange();
            const url = status
                ? `${API_BASE_URL}/${exchange}/orders?status=${status}`
                : `${API_BASE_URL}/${exchange}/orders`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getPositions() {
        try {
            const exchange = this.getExchange();
            const response = await fetch(`${API_BASE_URL}/${exchange}/orders/positions`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching positions:', error);
            throw error;
        }
    }
}

export default new TradeService();
