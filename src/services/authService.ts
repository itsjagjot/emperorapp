import { API_BASE_URL, DEFAULT_EXCHANGE } from './config';

export interface LoginResponse {
    success: boolean;
    message: string;
    errors: any;
    data?: {
        accessToken: string;
        user: {
            UserId: number;
            Username: string;
            FullName: string;
            UserRoleName: string;
            [key: string]: any;
        };
    };
}

/**
 * Login API call
 * Endpoint: POST /api/{exchange}/auth/login
 * Body: { username, password }
 */
export const loginUser = async (
    username: string,
    password: string,
    exchange: string = DEFAULT_EXCHANGE,
    serverId: number | null = null
): Promise<LoginResponse> => {
    const url = `${API_BASE_URL}/${exchange}/auth/login`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password, server_id: serverId }),
    });

    const data = await response.json();
    return data;
};

/**
 * Fetch Servers based on search query (min 3 characters)
 */
export const fetchServers = async (query: string): Promise<any[]> => {
    try {
        const url = `${API_BASE_URL}/servers/search?q=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching servers:', error);
    }
    return [];
};

/**
 * Change Password API call
 */
export const changePassword = async (
    passwords: { current_password: string; new_password: string; confirm_password: string },
    exchange: string = DEFAULT_EXCHANGE
): Promise<any> => {
    const url = `${API_BASE_URL}/${exchange}/auth/change-password`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwords),
    });

    const data = await response.json();
    return data;
};

/**
 * Get Login History API call
 */
export const getLoginHistory = async (
    page: number = 1,
    pageSize: number = 10,
    startDate?: string,
    endDate?: string,
    exchange: string = DEFAULT_EXCHANGE
): Promise<any> => {
    let url = `${API_BASE_URL}/${exchange}/auth/login-history?page=${page}&pageSize=${pageSize}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    return data;
};

/**
 * Get User Quantities
 */
export const getQuantities = async (
    exchange: string = DEFAULT_EXCHANGE
): Promise<any> => {
    const url = `${API_BASE_URL}/${exchange}/auth/quantities`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    return await response.json();
};

/**
 * Update User Quantities
 */
export const setQuantities = async (
    quantities: number[],
    exchange: string = DEFAULT_EXCHANGE
): Promise<any> => {
    const url = `${API_BASE_URL}/${exchange}/auth/quantities`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantities }),
    });

    return await response.json();
};

/**
 * Logout User
 * Clears authentication data from localStorage and revokes token on server
 */
export const logoutUser = async (exchange: string = DEFAULT_EXCHANGE) => {
    const url = `${API_BASE_URL}/${exchange}/auth/logout`;
    const token = localStorage.getItem('accessToken');

    if (token) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error during logout API call:', error);
        }
    }

    const savedSymbols = localStorage.getItem('selected_symbols');

    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('menuUnlocked');
    localStorage.removeItem('market_timing_data');
    localStorage.clear();

    if (savedSymbols) {
        localStorage.setItem('selected_symbols', savedSymbols);
    }
};


