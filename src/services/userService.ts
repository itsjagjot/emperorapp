import { API_BASE_URL } from './config';

class UserService {
    private getHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async getAccessibleUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/User/accessible`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch accessible users');
            return await response.json();
        } catch (error) {
            console.error('Error fetching accessible users:', error);
            throw error;
        }
    }
}

export default new UserService();
