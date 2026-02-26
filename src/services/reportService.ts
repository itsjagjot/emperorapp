import { API_BASE_URL, DEFAULT_EXCHANGE } from './config';

class ReportService {
    private getHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async getPnLSummary(exchange: string = DEFAULT_EXCHANGE, username?: string) {
        try {
            let url = `${API_BASE_URL}/${exchange}/orders/pnl-summary`;
            if (username && username !== 'all') {
                url += `?username=${encodeURIComponent(username)}`;
            }
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch PnL summary');
            return await response.json();
        } catch (error) {
            console.error('Error fetching PnL summary:', error);
            throw error;
        }
    }
}

export default new ReportService();
