import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import AppRoutes from './routes/AppRoutes';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode usually is system default, but we use variables.css to override with light mode default
 * and our custom colors.
 */
/* import '@ionic/react/css/palettes/dark.system.css'; */ /* Commenting out to ensure our light theme is default */

/* Theme variables */
import './theme/variables.css';
import { useEffect, useState } from 'react';
// import { liveRateService } from './services/LiveRate';
import { liveRateV2Service } from './services/ExiSoc/LiveRateV2';
import { useRateStore } from './store/useRateStore';
import SplashScreen from './components/SplashScreen/SplashScreen';

import { ToastProvider } from './components/Toast/Toast';

setupIonicReact();

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(() => {
    return sessionStorage.getItem('splashShown') !== 'true';
  });

  const setRates = useRateStore(state => state.setRates);

  useEffect(() => {
    if (!showSplash) {
      sessionStorage.setItem('splashShown', 'true');
    }
  }, [showSplash]);

  useEffect(() => {
    // Lock the admin menu on fresh app start (app reopened or cleared from recents)
    // localStorage.removeItem('menuUnlocked');
    // window.dispatchEvent(new Event('menuUnlockedChanged'));

    //   console.log('App initialized. Checking LiveRate service...');

    //   // Explicitly check connection logic
    //   if (liveRateService) {
    //     console.log('LiveRate service instance exists.');
    //     const socket = liveRateService.getSocket();
    //     console.log('Socket instance:', socket);
    //     if (socket?.connected) {
    //       console.log('Socket is already connected with ID:', socket.id);
    //     } else {
    //       console.log('Socket is NOT connected. Attempting manual connect...');
    //       socket?.connect();
    //     }
    //   }
    // }, []);
    // Global listener for live rates
    console.log('App initialized. Subscribing to LiveRateV2 service...');

    liveRateV2Service.onMarketData((data) => {
      if (Array.isArray(data)) {
        setRates(data);
      }
    });

    return () => {
      // Optional: clean up if App unmounts (rare in Ionic Apps)
      // liveRateV2Service.disconnect();
    };
  }, [setRates]);

  return (
    <IonApp>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <ToastProvider>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </ToastProvider>
    </IonApp>
  );
};

export default App;
