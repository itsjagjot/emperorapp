import { create } from 'zustand';

interface RateData {
    instrument: string;
    commodity: string;
    expiry: string;
    ltp: string;
    close: string;
    high: string;
    low: string;
    open: string;
    change: string;
    change_percent: string;
    volume: string;
    oi: string;
    bid: number;
    ask: number;
}

interface RateStore {
    rates: RateData[];
    setRates: (rates: RateData[]) => void;
}

export const useRateStore = create<RateStore>((set) => ({
    rates: [],
    setRates: (rates) => set({ rates }),
}));
