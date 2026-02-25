import { API_BASE_URL } from './config';

export interface MarketTiming {
    start_time: string; // Format "HH:mm"
    end_time: string;   // Format "HH:mm"
    date: string;       // To track which day this config belongs to
}

const STORAGE_KEY = 'market_timing_data';

class MarketTimingService {
    private timing: MarketTiming | null = null;

    /**
     * Get market timing.
     * Checks local storage first. If expired or missing, fetches from API.
     */
    async getTiming(): Promise<MarketTiming> {
        // 1. Check Memory Cache
        if (this.timing && this.isToday(this.timing.date)) {
            return this.timing;
        }

        // 2. Check Local Storage
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsed: MarketTiming = JSON.parse(storedData);
            if (this.isToday(parsed.date)) {
                this.timing = parsed;
                return parsed;
            }
        }

        // 3. Fetch from API
        return await this.fetchFromApi();
    }

    private isToday(dateString: string): boolean {
        const today = new Date().toDateString();
        return dateString === today;
    }

    private async fetchFromApi(): Promise<MarketTiming> {
        try {
            const response = await fetch(`${API_BASE_URL}/market-timing`);
            if (!response.ok) {
                throw new Error('Failed to fetch market timing');
            }
            const data = await response.json();

            // Backend returns { start_time: "HH:mm", end_time: "HH:mm" }
            const timingResult: MarketTiming = {
                start_time: data.start_time,
                end_time: data.end_time,
                date: new Date().toDateString()
            };

            // Retrieve existing storage to prevent overwriting other keys if we change structure later
            // But here we own this key.
            localStorage.setItem(STORAGE_KEY, JSON.stringify(timingResult));
            this.timing = timingResult;

            console.log('Fetched and stored market timing:', timingResult);
            return timingResult;

        } catch (error) {
            console.error('Error fetching market timing:', error);
            // Fallback default
            return {
                start_time: '09:00',
                end_time: '15:30',
                date: new Date().toDateString()
            };
        }
    }

    /**
     * Helper to parse "HH:mm" to minutes from start of day for easy comparison
     */
    public timeToMinutes(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Synchronously check if the market is currently open based on localStorage data.
     */
    public isMarketOpen(): boolean {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (!storedData) return true; // Default to open if no timing found

            const parsed: MarketTiming = JSON.parse(storedData);
            if (!this.isToday(parsed.date)) {
                return true; // Default to open if timing is stale (or we could return false, but true is safer)
            }

            const now = new Date();
            const start = parsed.start_time;
            const end = parsed.end_time;

            if (!start || !end) return true;

            const currentMins = now.getHours() * 60 + now.getMinutes();
            const startMins = this.timeToMinutes(start);
            const endMins = this.timeToMinutes(end);

            if (startMins <= endMins) {
                return currentMins >= startMins && currentMins <= endMins;
            } else {
                // Crosses midnight (e.g. 09:00 to 02:00)
                return currentMins >= startMins || currentMins <= endMins;
            }
        } catch (e) {
            console.error('Error parsing market timing from localStorage:', e);
            return true;
        }
    }
}

export const marketTimingService = new MarketTimingService();
