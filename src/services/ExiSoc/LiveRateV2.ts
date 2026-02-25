import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, API_BASE_URL } from '../config';
import { MarketTiming, marketTimingService } from '../MarketTimingService';

export interface LiveRateItem {
    // ... rest of interface
    bid: number;
    ask: number;
    high: number;
    low: number;
    open: number;
    close: number;
    change: number;
    change_percent: number;
    volume: number;
    oi: number;
    commodity: string;
    expiry?: string;
    instrument?: string;
}

class LiveRateV2Service {
    private socket: Socket | null = null;
    private callbacks: ((data: any) => void)[] = [];
    private rateStore: Map<string, LiveRateItem> = new Map();

    // Market Timing
    private timingConfig: MarketTiming | null = null;

    // Configuration for target commodities and their expiries with static fallbacks
    private commodityConfig: Record<string, {
        name: string,
        expiry: string,
        instrument: string,
        open: number,
        close: number,
        change: number,
        change_percent: number,
        volume: number,
        oi: number
    }> = {
            // "gold_next": {
            //     name: "GOLD", expiry: "02APR2026", instrument: "FUTCOM",
            //     open: 153551, close: 154760, change: -2891, change_percent: -1.87, volume: 1307, oi: 7577
            // },
            "gold_future": {
                name: "GOLD", expiry: "02APR2026", instrument: "FUTCOM",
                open: 151900, close: 152877, change: -2976, change_percent: -1.95, volume: 8183, oi: 42285,
            },
            // "silver_next": {
            //     name: "SILVER", expiry: "30APR2026", instrument: "FUTCOM",
            //     open: 235207, close: 239891, change: -9696, change_percent: -4.04, volume: 2260, oi: 5893
            // },
            "silver_future": {
                name: "SILVER", expiry: "05MAR2026", instrument: "FUTCOM",
                open: 245941, close: 250177, change: -9766, change_percent: -3.90, volume: 2343, oi: 6558
            },
        };

    constructor() {
        // Initialize timing
        this.initializeTiming();

        console.log('Initializing ExiSoc (V2) with URL:', SOCKET_URL);
        this.socket = io(SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to ExiSoc Socket:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('❌ Disconnected from ExiSoc Socket. Reason:', reason);
        });

        this.socket.on("future_rates", (res: any) => {
            if (res) this.handleIncomingData(res, 'future_rates');
        });

        // Start fluctuation simulator to keep UI alive
        setInterval(() => {
            this.simulateFluctuation();
        }, 1000); // Increased interval to 3 seconds
    }

    private async initializeTiming() {
        this.timingConfig = await marketTimingService.getTiming();
        console.log('LiveRateV2 using market timing:', this.timingConfig);
    }


    private simulateFluctuation() {
        if (this.rateStore.size === 0) {
            // If no data yet, initialize with config defaults
            Object.entries(this.commodityConfig).forEach(([key, config]) => {
                this.rateStore.set(config.name, {
                    commodity: config.name,
                    expiry: config.expiry,
                    instrument: config.instrument,
                    bid: config.open,
                    ask: config.close,
                    high: config.open,
                    low: config.open,
                    open: config.open,
                    close: config.close,
                    change: config.change,
                    change_percent: config.change_percent,
                    volume: config.volume,
                    oi: config.oi
                });
            });
        }

        this.rateStore.forEach((item, key) => {
            // Add a small random jitter (+/- 0.01% to 0.02%)
            const jitter = (Math.random() - 0.5) * 5; // +/- 2.5 pips
            item.bid = +(item.bid + jitter).toFixed(2);
            item.ask = +(item.ask + jitter).toFixed(2);

            // Keep high/low updated
            if (item.bid > item.high) item.high = item.bid;
            if (item.bid < item.low) item.low = item.bid;
        });

        if (this.callbacks.length > 0) {
            const results = Array.from(this.rateStore.values()).map(item => ({
                instrument: item.instrument || 'FUTCOM',
                commodity: item.commodity,
                expiry: item.expiry,
                ltp: item.bid.toString(),
                close: item.close.toString(),
                high: item.high.toString(),
                low: item.low.toString(),
                open: item.open.toString(),
                change: item.change.toString(),
                change_percent: item.change_percent.toString(),
                volume: item.volume.toString(),
                oi: item.oi.toString(),
                bid: item.bid,
                ask: item.ask
            }));
            this.notifyListeners(results);
            this.processIntradayData(results);
        }
    }

    private notifyListeners(data: any) {
        this.callbacks.forEach(cb => {
            try {
                cb(data);
            } catch (e) {
                console.error('Error in listener:', e);
            }
        });
    }

    private handleIncomingData(data: any, type: string) {
        // console.log(`Incoming ${type} data:`, data);
        const apiData = data?.rates ?? {};

        const safe = (newVal: any, oldVal: any) => {
            if (typeof newVal === 'object' && newVal !== null) {
                return safe(newVal.bid || newVal.rate || newVal.value || newVal.ltp, oldVal);
            }
            return (newVal !== undefined && newVal !== null && !isNaN(+newVal)) ? +newVal : (oldVal ?? 0);
        };

        let hasUpdates = false;
        Object.entries(this.commodityConfig).forEach(([apiKey, config]) => {
            const incoming = apiData[apiKey];
            if (incoming !== undefined) {
                const displayName = config.name;
                const prev = this.rateStore.get(displayName);

                const isObject = typeof incoming === 'object' && incoming !== null;

                const item: LiveRateItem = {
                    commodity: displayName,
                    expiry: config.expiry,
                    bid: isObject ? safe(incoming.bid || incoming.ltp, prev?.bid || config.open) : safe(incoming, prev?.bid || config.open),
                    ask: isObject ? safe(incoming.ask || incoming.close, prev?.ask || config.close) : safe(incoming, prev?.ask || config.close),
                    high: isObject ? safe(incoming.high, prev?.high || config.open) : safe(incoming, prev?.high || config.open),
                    low: isObject ? safe(incoming.low, prev?.low || config.open) : safe(incoming, prev?.low || config.open),
                    open: isObject ? safe(incoming.open, prev?.open || config.open) : config.open,
                    close: isObject ? safe(incoming.close || incoming.ask, prev?.close || config.close) : config.close,
                    change: isObject ? safe(incoming.change, prev?.change || config.change) : config.change,
                    change_percent: isObject ? safe(incoming.change_percent, prev?.change_percent || config.change_percent) : config.change_percent,
                    volume: isObject ? safe(incoming.volume || incoming.vol, prev?.volume || config.volume) : config.volume,
                    oi: isObject ? safe(incoming.oi, prev?.oi || config.oi) : config.oi
                };

                this.rateStore.set(displayName, item);
                hasUpdates = true;
            }
        });

        if (hasUpdates && this.callbacks.length > 0) {
            const results = Array.from(this.rateStore.values()).map(item => ({
                instrument: 'FUTCOM',
                commodity: item.commodity,
                expiry: item.expiry,
                ltp: item.bid.toString(),
                close: item.close.toString(),
                high: item.high.toString(),
                low: item.low.toString(),
                open: item.open.toString(),
                change: item.change.toString(),
                change_percent: item.change_percent.toString(),
                volume: item.volume.toString(),
                oi: item.oi.toString(),
                bid: item.bid,
                ask: item.ask
            }));
            this.notifyListeners(results);
            this.processIntradayData(results);
        }
    }

    public onMarketData(callback: (data: any) => void) {
        this.callbacks.push(callback);
        if (this.rateStore.size > 0) {
            callback(Array.from(this.rateStore.values()));
        }
    }


    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    // --- Intraday Aggregation Logic ---

    private currentMinute: number = -1;
    private candles: Record<string, {
        symbol: string;
        instrument: string;
        expiry: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
        date: string;
    }> = {};

    private processIntradayData(data: any[]) {
        if (!Array.isArray(data)) return;

        const now = new Date();
        const currentMinute = now.getMinutes();
        const currentHour = now.getHours();
        const currentTimeMinutes = currentHour * 60 + currentMinute;

        // Use MarketTimingService
        const startMinutes = this.timingConfig ? marketTimingService.timeToMinutes(this.timingConfig.start_time) : 540; // Default 04:00
        const endMinutes = this.timingConfig ? marketTimingService.timeToMinutes(this.timingConfig.end_time) : 930; // Default 15:30

        const isMarketOpen = currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;

        if (!isMarketOpen) {
            // Respect dynamic timing config if loaded
            if (this.timingConfig) return;

            // Fallback hard check if config not yet loaded (though init calls it proactively)
            if (currentHour >= 16 || (currentHour === 15 && currentMinute > 30) || currentHour < 4) {
                // return; 
            }
        }

        // Detect new minute
        if (this.currentMinute !== -1 && this.currentMinute !== currentMinute) {
            this.flushCandles();
            this.candles = {}; // Reset for new minute
        }
        this.currentMinute = currentMinute;

        data.forEach((packet: any) => {
            const symbol = packet.commodity;
            if (!symbol) return;

            const ltp = parseFloat(packet.ltp || packet.bid); // specific to V2 structure
            if (isNaN(ltp)) return;

            if (!this.candles[symbol]) {
                this.candles[symbol] = {
                    symbol: symbol,
                    instrument: packet.instrument || 'FUTCOM',
                    expiry: packet.expiry || 'NEAR',
                    open: ltp,
                    high: ltp,
                    low: ltp,
                    close: ltp,
                    volume: 0,
                    date: now.toISOString()
                };
            } else {
                const candle = this.candles[symbol];
                if (ltp > candle.high) candle.high = ltp;
                if (ltp < candle.low) candle.low = ltp;
                candle.close = ltp;
            }
        });
    }

    private async flushCandles() {
        const candlesToSend = Object.values(this.candles);
        if (candlesToSend.length === 0) return;

        console.log(`[V2] Sending ${candlesToSend.length} candles to backend at`, new Date().toLocaleTimeString());

        for (const candle of candlesToSend) {
            const dateObj = new Date(candle.date);
            dateObj.setSeconds(0);

            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = '00';

            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            const payload = {
                symbol: candle.symbol,
                instrument: candle.instrument,
                expiry: candle.expiry,
                date: formattedDate,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume,
                change: 0
            };

            try {
                await fetch(`${API_BASE_URL}/market-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error('[V2] Failed to store intraday data for', candle.symbol, error);
            }
        }
    }
}

export const liveRateV2Service = new LiveRateV2Service();
