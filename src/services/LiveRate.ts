import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, APP_MODE, API_BASE_URL } from './config';
import { MarketTiming, marketTimingService } from './MarketTimingService';

interface MarketDataPacket {
    instrument: string;
    commodity: string;
    expiry: string;
    open: string;
    low: string;
    ltp: string;
    high: string;
    close: string;
    change: string;
    change_percent: string;
    volume: string;
    oi: string;
}

interface MinuteCandle {
    symbol: string;
    instrument: string;
    expiry: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    date: string; // ISO string of the minute start
}

const DEV_DATA = [
    {
        "instrument": "FUTCOM",
        "commodity": "GOLD",
        "expiry": "05MAR2026",
        "open": "71300.00",
        "low": "71300.00",
        "ltp": "71450.00",
        "high": "71500.00",
        "close": "71400.00",
        "change": "50.00",
        "change_percent": "0.07",
        "volume": "1500",
        "oi": "2000"
    },
    {
        "instrument": "FUTCOM",
        "commodity": "SILVER",
        "expiry": "05MAR2026",
        "open": "83000.00",
        "low": "82900.00",
        "ltp": "83150.00",
        "high": "83200.00",
        "close": "83100.00",
        "change": "50.00",
        "change_percent": "0.06",
        "volume": "3500",
        "oi": "4000"
    },
    {
        "instrument": "FUTCOM",
        "commodity": "GOLDM",
        "expiry": "05MAR2026",
        "open": "153200.00",
        "low": "152092.00",
        "ltp": "152901.00",
        "high": "153680.00",
        "close": "153871.00",
        "change": "-970.00",
        "change_percent": "-0.63",
        "volume": "23475",
        "oi": "42567"
    },
    {
        "instrument": "FUTCOM",
        "commodity": "SILVERM",
        "expiry": "27FEB2026",
        "open": "240257.00",
        "low": "239005.00",
        "ltp": "242509.00",
        "high": "245600.00",
        "close": "249580.00",
        "change": "-7071.00",
        "change_percent": "-2.83",
        "volume": "19822",
        "oi": "10220"
    },
    {
        "instrument": "FUTCOM",
        "commodity": "COPPER",
        "expiry": "27FEB2026",
        "open": "1200.00",
        "low": "1193.10",
        "ltp": "1198.00",
        "high": "1207.00",
        "close": "1209.50",
        "change": "-11.50",
        "change_percent": "-0.95",
        "volume": "6883",
        "oi": "16204"
    },
    {
        "instrument": "FUTCOM",
        "commodity": "CRUDEOIL",
        "expiry": "19FEB2026",
        "open": "5705.00",
        "low": "5669.00",
        "ltp": "5775.00",
        "high": "5789.00",
        "close": "5723.00",
        "change": "52.00",
        "change_percent": "0.91",
        "volume": "12324",
        "oi": "7280"
    }
];

class LiveRateService {
    private socket: Socket | null = null;
    // Support multiple callbacks
    private callbacks: ((data: any) => void)[] = [];
    private devInterval: any = null;

    // Aggregation State
    private currentMinute: number = -1;
    private candles: Record<string, MinuteCandle> = {};

    // Market Timing
    private timingConfig: MarketTiming | null = null;

    constructor() {
        // Initialize timing
        this.initializeTiming();

        if (APP_MODE === 'prod') {
            console.log('Initializing LiveRate Service (PROD) with URL:', SOCKET_URL);
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to LiveRate Socket:', this.socket?.id);
                // Subscribe if needed
                this.socket?.emit('subscribe', 'market_data');
            });

            this.socket.on('disconnect', (reason) => {
                console.warn('❌ Disconnected from LiveRate Socket. Reason:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('⚠️ LiveRate Socket Connection Error:', error.message);
            });

            // Listen for market data
            this.socket.on('market_data', (data: any) => {
                // console.log('Live Rates:', data); 
                this.notifyListeners(data);
                this.processIntradayData(data);
            });

            this.socket.on('rates', (data: any) => {
                // Handle alternate event name if any
                this.notifyListeners(data);
                this.processIntradayData(data);
            });

        } else {
            console.log('Initializing LiveRate Service (DEV) with static data');
            // Simulate socket behavior with static data
            this.devInterval = setInterval(() => {
                // Simulate price movement for testing aggregation
                const simulatedData = DEV_DATA.map(d => ({
                    ...d,
                    ltp: (parseFloat(d.ltp) + (Math.random() * 10 - 5)).toFixed(2)
                }));
                this.notifyListeners(simulatedData);
                this.processIntradayData(simulatedData);
            }, 1000);
        }
    }

    private async initializeTiming() {
        this.timingConfig = await marketTimingService.getTiming();
        console.log('LiveRate using market timing:', this.timingConfig);
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

    public onMarketData(callback: (data: any) => void) {
        this.callbacks.push(callback);
        // Immediate call in dev mode to avoid waiting
        if (APP_MODE === 'dev') {
            // callback(DEV_DATA);
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        if (this.devInterval) {
            clearInterval(this.devInterval);
        }
    }

    // --- Intraday Aggregation Logic ---

    private processIntradayData(data: any) {
        if (!Array.isArray(data)) return;

        const now = new Date();
        const currentMinute = now.getMinutes();
        const currentHour = now.getHours();
        const currentTimeMinutes = currentHour * 60 + currentMinute;

        const startMinutes = this.timingConfig ? marketTimingService.timeToMinutes(this.timingConfig.start_time) : 240; // Default 04:00
        const endMinutes = this.timingConfig ? marketTimingService.timeToMinutes(this.timingConfig.end_time) : 930; // Default 15:30

        const isMarketOpen = currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;

        // console.log('Market Status:', isMarketOpen, currentTimeMinutes, startMinutes, endMinutes);

        if (!isMarketOpen) {
            // Uncomment to strictly enforce market hours
            // return;
            // User requested strict rule previously, but also asked for 4AM test.
            // If timingConfig is loaded, we respect it.
            if (this.timingConfig) return;
        }

        // Detect new minute
        if (this.currentMinute !== -1 && this.currentMinute !== currentMinute) {
            this.flushCandles();
            this.candles = {}; // Reset for new minute
        }
        this.currentMinute = currentMinute;

        data.forEach((packet: MarketDataPacket) => {
            const symbol = packet.commodity;
            if (!symbol) return;
            // Only tracking specific scripts? User mentioned "Script ch Commodity de names aun ge like GOLD, SILVER"
            // Let's track everything we receive for now.

            const ltp = parseFloat(packet.ltp);

            if (!this.candles[symbol]) {
                // Initialize candle for this minute
                // Open for this minute is the first LTP we see? 
                // Ideally Open should be the first tick.
                this.candles[symbol] = {
                    symbol: symbol,
                    instrument: packet.instrument || 'COMMODITY',
                    expiry: packet.expiry || 'NEAR',
                    open: ltp,
                    high: ltp,
                    low: ltp,
                    close: ltp,
                    volume: 0, // Ignoring volume delta for now
                    date: now.toISOString() // Or format to MySQL format
                };
            } else {
                // Update Candle
                const candle = this.candles[symbol];
                if (ltp > candle.high) candle.high = ltp;
                if (ltp < candle.low) candle.low = ltp;
                candle.close = ltp;
                // Volume logic currently omitted as packet volume is cumulative
            }
        });
    }

    private async flushCandles() {
        // Send all collected candles to backend
        const candlesToSend = Object.values(this.candles);
        if (candlesToSend.length === 0) return;

        console.log(`Sending ${candlesToSend.length} candles to backend at`, new Date().toLocaleTimeString());

        // We can send individually or in batch. 
        // Backend API currently accepts single store: POST /market-data
        // Let's loop and send. For efficiency, batch endpoint is better but user asked for "api hit kre ga".

        for (const candle of candlesToSend) {
            // Format Date for MySQL: YYYY-MM-DD HH:MM:SS
            const dateObj = new Date(candle.date);
            // Adjust to seconds=0 for clean minute mark
            dateObj.setSeconds(0);

            // Format manually to local time string that backend expects? 
            // Or ISO. Laravel 'date' validation is 'required|date_format:Y-m-d H:i:s' usually expects local time if not specified.
            // Let's send generic "YYYY-MM-DD HH:mm:ss"

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
                change: 0 // We don't track change relative to prev candle here easily
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
                console.error('Failed to store intraday data for', candle.symbol, error);
            }
        }
    }
}

export const liveRateService = new LiveRateService();
