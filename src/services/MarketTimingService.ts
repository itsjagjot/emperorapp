import { API_BASE_URL } from './config';

export interface MarketTiming {
    day_name?: string;
    start_time: string; // Format "HH:mm"
    end_time: string;   // Format "HH:mm"
    is_market_open: boolean;
    is_closed?: boolean;
    date: string;       // To track which day this config belongs to
}

const STORAGE_KEY = 'market_timing_data';
const ALL_TIMINGS_KEY = 'all_market_timings';

class MarketTimingService {
    private timing: MarketTiming | null = null;
    private allTimings: MarketTiming[] | null = null;

    /**
     * Get market timing for today.
     */
    async getTiming(): Promise<MarketTiming> {
        // Find today in allTimings if already loaded
        const todayName = new Date().toLocaleString('en-US', { weekday: 'long' });
        if (this.allTimings) {
            const todayTiming = this.allTimings.find(t => t.day_name === todayName);
            if (todayTiming) return todayTiming;
        }

        // If not loaded, fetch everything and return today
        const all = await this.getAllTimings();
        const todayTiming = all.find(t => t.day_name === todayName);
        return todayTiming || {
            start_time: '09:00', end_time: '23:55', is_market_open: true, date: new Date().toDateString()
        };
    }

    /**
     * Get all market timings (7 days)
     */
    async getAllTimings(): Promise<MarketTiming[]> {
        if (this.allTimings) return this.allTimings;

        const stored = localStorage.getItem(ALL_TIMINGS_KEY);
        if (stored) {
            this.allTimings = JSON.parse(stored);
        }

        return await this.fetchAllFromApi();
    }

    private isToday(dateString: string): boolean {
        const today = new Date().toDateString();
        return dateString === today;
    }

    private async fetchAllFromApi(): Promise<MarketTiming[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/market-timings`);
            if (!response.ok) throw new Error('Failed to fetch all market timings');
            const data = await response.json();

            const results = data.map((t: any) => ({
                day_name: t.day_name,
                start_time: t.open_time,
                end_time: t.close_time,
                is_closed: !!t.is_closed,
                is_market_open: !t.is_closed,
                date: new Date().toDateString()
            }));

            localStorage.setItem(ALL_TIMINGS_KEY, JSON.stringify(results));
            this.allTimings = results;
            return results;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    public timeToMinutes(timeStr: string): number {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    public isMarketOpen(): boolean {
        try {
            const todayName = new Date().toLocaleString('en-US', { weekday: 'long' });
            let timing: MarketTiming | undefined;

            if (this.allTimings) {
                timing = this.allTimings.find(t => t.day_name === todayName);
            } else {
                const stored = localStorage.getItem(ALL_TIMINGS_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    timing = parsed.find((t: any) => t.day_name === todayName);
                }
            }

            if (!timing) return true;
            if (timing.is_closed) return false;

            const now = new Date();
            const start = timing.start_time;
            const end = timing.end_time;
            if (!start || !end) return true;

            const currentMins = now.getHours() * 60 + now.getMinutes();
            const startMins = this.timeToMinutes(start);
            const endMins = this.timeToMinutes(end);

            if (startMins <= endMins) {
                return currentMins >= startMins && currentMins <= endMins;
            } else {
                return currentMins >= startMins || currentMins <= endMins;
            }
        } catch (e) {
            return true;
        }
    }

    public updateTiming(data: any) {
        // If we received bulk timings
        if (data.all_timings) {
            const results = data.all_timings.map((t: any) => ({
                day_name: t.day_name,
                start_time: t.start_time,
                end_time: t.end_time,
                is_closed: !!t.is_closed,
                is_market_open: !t.is_closed,
                date: new Date().toDateString()
            }));
            localStorage.setItem(ALL_TIMINGS_KEY, JSON.stringify(results));
            this.allTimings = results;
        } else if (data.timing && data.timing.day) {
            // Update single day if that's what we got
            if (!this.allTimings) {
                const stored = localStorage.getItem(ALL_TIMINGS_KEY);
                if (stored) this.allTimings = JSON.parse(stored);
            }

            if (this.allTimings) {
                const index = this.allTimings.findIndex(t => t.day_name === data.timing.day);
                if (index !== -1) {
                    this.allTimings[index] = {
                        ...this.allTimings[index],
                        start_time: data.timing.start_time,
                        end_time: data.timing.end_time,
                        is_closed: data.timing.is_closed,
                        is_market_open: data.timing.is_market_open
                    };
                    localStorage.setItem(ALL_TIMINGS_KEY, JSON.stringify(this.allTimings));
                }
            }
        }

        console.log('Real-time market timings updated via socket');
        window.dispatchEvent(new CustomEvent('market_timing_updated', { detail: data }));
    }
}

export const marketTimingService = new MarketTimingService();
