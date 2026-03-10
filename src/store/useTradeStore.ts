import { create } from 'zustand';
import TradeService, { TradeOrder } from '../services/TradeService';

interface TradeState {
    trades: TradeOrder[];
    loading: boolean;
    lastFetched: number | null;
    fetchTrades: (filters?: any) => Promise<void>;
    setTrades: (trades: TradeOrder[]) => void;
}

export const useTradeStore = create<TradeState>((set, get) => ({
    trades: [],
    loading: false,
    lastFetched: null,

    fetchTrades: async (filters?: any) => {
        set({ loading: true });
        try {
            // Fetch all orders without status to get everything (Success, Pending, etc.)
            const data = await TradeService.getOrders(undefined, filters);
            const allTrades = Array.isArray(data) ? data : [];
            set({
                trades: allTrades,
                loading: false,
                lastFetched: Date.now()
            });
        } catch (error) {
            console.error('Failed to fetch trades in store', error);
            set({ loading: false });
        }
    },

    setTrades: (trades: TradeOrder[]) => set({ trades }),
}));
