import { create } from 'zustand';
import { API_BASE_URL } from '../services/config';

interface MasterDataStore {
    masterData: any;
    isLoading: boolean;
    error: string | null;
    fetchMasterData: (forceRefresh?: boolean) => Promise<void>;
    getScriptSettings: (symbol: string) => { breakup_qty?: number, max_qty?: number } | null;
}

export const useMasterDataStore = create<MasterDataStore>((set, get) => ({
    masterData: null,
    isLoading: false,
    error: null,

    fetchMasterData: async (forceRefresh = false) => {
        const { masterData, isLoading } = get();
        if ((masterData || isLoading) && !forceRefresh) return; // Already fetched or fetching

        set({ isLoading: true, error: null });
        try {
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
            if (result && (result.Success || result.success)) {
                set({ masterData: result.Data || result.data, isLoading: false });
            } else {
                set({ error: 'Failed to fetch master data', isLoading: false });
            }
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    getScriptSettings: (symbol: string) => {
        const { masterData } = get();
        if (!masterData || !Array.isArray(masterData)) return null;

        for (const exchange of masterData) {
            if (exchange.groups && Array.isArray(exchange.groups)) {
                for (const group of exchange.groups) {
                    if (group.settings && Array.isArray(group.settings)) {
                        const setting = group.settings.find((s: any) => s.symbol === symbol);
                        if (setting) {
                            return {
                                breakup_qty: setting.breakup_qty,
                                max_qty: setting.max_qty
                            };
                        }
                    }
                }
            }
        }
        return null;
    }
}));

if (typeof window !== 'undefined') {
    window.addEventListener('master_data_updated', () => {
        useMasterDataStore.getState().fetchMasterData(true);
    });
}
