import { API_BASE_URL } from './config';

/**
 * Get allowed exchanges for the logged in user
 */
export const getAllowedExchanges = async () => {
    const url = `${API_BASE_URL}/User/exchanges/allowed`;
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
 * Get script settings for a specific exchange
 */
export const getScriptSettings = async (exchange: string) => {
    const url = `${API_BASE_URL}/User/exchanges/script-settings?exchange=${exchange}`;
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

let masterDataCache: any = null;

/**
 * Get master data (Exchanges, Groups, Settings)
 * Caches the result to avoid redundant API calls
 */
export const getMasterData = async (forceRefresh = false) => {
    if (masterDataCache && !forceRefresh) {
        return { Success: true, Data: masterDataCache };
    }

    const url = `${API_BASE_URL}/User/exchanges/master-data`;
    const token = localStorage.getItem('accessToken');

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();
    if (result && result.Success) {
        masterDataCache = result.Data;
    }
    return result;
};

/**
 * Clear master data cache
 */
export const clearMasterDataCache = () => {
    masterDataCache = null;
};
