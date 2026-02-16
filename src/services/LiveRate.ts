import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, APP_MODE } from './config';

const DEV_DATA = [
    {
        "instrument": "FUTCOM",
        "commodity": "GOLD",
        "expiry": "02APR2026",
        "open": "154999.00",
        "low": "153925.00",
        "ltp": "154724.00",
        "high": "155550.00",
        "close": "155895.00",
        "change": "-1171.00",
        "change_percent": "-0.75",
        "volume": "3533",
        "oi": "7522"
    },
    {
        "instrument": "FUTCOM",
        "commodity": "SILVER",
        "expiry": "05MAR2026",
        "open": "238489.00",
        "low": "235208.00",
        "ltp": "239200.00",
        "high": "241452.00",
        "close": "244360.00",
        "change": "-5160.00",
        "change_percent": "-2.11",
        "volume": "5576",
        "oi": "5684"
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
    private marketDataCallback: ((data: any) => void) | null = null;
    private devInterval: any = null;

    constructor() {
        if (APP_MODE === 'prod') {
            console.log('Initializing LiveRate Service (PROD) with URL:', SOCKET_URL);
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            this.socket.on('connect', () => {
                console.log('✅ Connected to LiveRate Socket:', this.socket?.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.warn('❌ Disconnected from LiveRate Socket. Reason:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('⚠️ LiveRate Socket Connection Error:', error.message);
            });

            // Listen for market data
            this.socket.on('market_data', (data: any) => {
                console.log('Live Rates:', data);
                if (this.marketDataCallback) {
                    this.marketDataCallback(data);
                }
            });
        } else {
            console.log('Initializing LiveRate Service (DEV) with static data');
            // Simulate socket behavior with static data
            this.devInterval = setInterval(() => {
                if (this.marketDataCallback) {
                    // console.log('Emitting static DEV data');
                    this.marketDataCallback(DEV_DATA);
                }
            }, 1000); // Send data every second to keep UI alive
        }
    }

    public onMarketData(callback: (data: any) => void) {
        this.marketDataCallback = callback;
        // Immediate call in dev mode to avoid waiting for the first interval
        if (APP_MODE === 'dev') {
            callback(DEV_DATA);
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
}

export const liveRateService = new LiveRateService();
