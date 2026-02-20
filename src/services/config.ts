// API Configuration
// Backend is running on php artisan serve (default port 8000)
export const API_BASE_URL = 'https://emperortrade.infotechablesolutions.in/api';

// Socket.io Configuration
// export const SOCKET_URL = 'http://localhost:8787';
export const SOCKET_URL = 'https://socket.swamijewellers.com';
// export const SOCKET_URL = 'https://endlessly-outgoing-cowbird.ngrok-free.app';

// Default exchange for API routes
export const DEFAULT_EXCHANGE = 'EMPEROR';

// App Mode: 'dev' or 'prod'
export const APP_MODE: 'dev' | 'prod' = 'prod';

// Market Data Display Strategy: 'ALL' or 'FCFS' (First Come First Served)
export const SHOW_STRATEGY: 'ALL' | 'FCFS' = 'FCFS';
