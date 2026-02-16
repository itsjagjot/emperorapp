import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';

class LiveRateService {
    private socket: Socket | null = null;
    private marketDataCallback: ((data: any) => void) | null = null;

    constructor() {
        console.log('Initializing LiveRate Service with URL:', SOCKET_URL);
        this.socket = io(SOCKET_URL, {
            // transports: ['websocket'], // Allow polling fallback
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
    }

    public onMarketData(callback: (data: any) => void) {
        this.marketDataCallback = callback;
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export const liveRateService = new LiveRateService();
