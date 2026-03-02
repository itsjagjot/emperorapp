// API Configuration
// Backend is running on php artisan serve (default port 8000)
export const API_BASE_URL = 'https://emperorshots.live/api';
// export const API_BASE_URL = 'http://127.0.0.1:9510/api';

// Socket.io Configuration
// export const SOCKET_URL = 'http://localhost:8787';
// export const SOCKET_URL = 'https://emperorshots.live/socket.io';
export const SOCKET_URL = 'https://emperorshots.live';
// export const SOCKET_URL = 'https://endlessly-outgoing-cowbird.ngrok-free.app';

// Default exchange for API routes
export const DEFAULT_EXCHANGE = 'EMPEROR';

// App Mode: 'dev' or 'prod'
export const APP_MODE: 'dev' | 'prod' = 'prod';

// Market Data Display Strategy: 'ALL' or 'FCFS' (First Come First Served)
export const SHOW_STRATEGY: 'ALL' | 'FCFS' = 'FCFS';

// Invite Links for sharing (Fallbacks)
export const ANDROID_INVITE_LINK = 'https://play.google.com/store/apps/details?id=your.package.id';
export const IOS_INVITE_LINK = 'https://apps.apple.com/app/your-app-id';
