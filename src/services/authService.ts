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
            RoleName: string;
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
    exchange: string = DEFAULT_EXCHANGE
): Promise<LoginResponse> => {
    const url = `${API_BASE_URL}/${exchange}/auth/login`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
};
