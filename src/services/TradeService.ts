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
    brokerage_amount?: number;
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

    async getOrders(status?: string, filters?: { fromDate?: string | null, toDate?: string | null, exchange?: string | null, symbol?: string | null }) {
        try {
            const baseUrlExchange = this.getExchange();
            let url = `${API_BASE_URL}/${baseUrlExchange}/orders`;
            const params = new URLSearchParams();

            if (status) params.append('status', status);
            if (filters?.fromDate) params.append('from_date', filters.fromDate);
            if (filters?.toDate) params.append('to_date', filters.toDate);
            if (filters?.exchange) params.append('exchange_name', filters.exchange);
            if (filters?.symbol) params.append('symbol', filters.symbol);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

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

    async getUserwisePositions(filters?: { username?: string, symbol?: string, exchange_name?: string }) {
        try {
            const exchange = this.getExchange();
            const params = new URLSearchParams();
            if (filters?.username) params.append('username', filters.username);
            if (filters?.symbol) params.append('symbol', filters.symbol);
            if (filters?.exchange_name) params.append('exchange_name', filters.exchange_name);

            const queryString = params.toString();
            const url = `${API_BASE_URL}/${exchange}/orders/userwise-positions${queryString ? '?' + queryString : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching userwise positions:', error);
            throw error;
        }
    }

    async getAccountSummary() {
        try {
            const exchange = this.getExchange();
            const response = await fetch(`${API_BASE_URL}/${exchange}/orders/account-summary`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching account summary:', error);
            throw error;
        }
    }

    async squareOffAll() {
        try {
            const exchange = this.getExchange();
            const response = await fetch(`${API_BASE_URL}/${exchange}/orders/square-off`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to square off positions');
            }
            return data;
        } catch (error) {
            console.error('Error squaring off positions:', error);
            throw error;
        }
    }

    async cancelOrder(id: number) {
        try {
            const exchange = this.getExchange();
            const response = await fetch(`${API_BASE_URL}/${exchange}/orders/${id}/cancel`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel order');
            }
            return data;
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    }

    async cancelAllPending() {
        try {
            const exchange = this.getExchange();
            const response = await fetch(`${API_BASE_URL}/${exchange}/orders/cancel-all-pending`, {
                method: 'POST',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel pending orders');
            }
            return data;
        } catch (error) {
            console.error('Error canceling all pending orders:', error);
            throw error;
        }
    }

    async getPnLSummary(filters?: { username?: string }) {
        try {
            const exchange = this.getExchange();
            const params = new URLSearchParams();
            if (filters?.username) params.append('username', filters.username);

            const queryString = params.toString();
            const url = `${API_BASE_URL}/${exchange}/orders/pnl-summary${queryString ? '?' + queryString : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching PnL summary:', error);
            throw error;
        }
    }

    private lotSizeCache: { [key: string]: number } | null = null;

    async getLotSizeMap() {
        if (this.lotSizeCache) return this.lotSizeCache;
        try {
            const response = await fetch(`${API_BASE_URL}/lot-size-map`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            const data = await response.json();
            this.lotSizeCache = data;
            return data;
        } catch (error) {
            console.error('Error fetching lot size map:', error);
            return {};
        }
    }
}

export default new TradeService();
