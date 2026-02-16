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
import { useEffect } from 'react';
import { liveRateService } from './services/LiveRate';

setupIonicReact();

const App: React.FC = () => {

  useEffect(() => {
    // Service is initialized on import, but we can reference it here to ensure it's kept alive or for future logic.
    console.log('App initialized. Checking LiveRate service...');

    // Explicitly check connection logic
    if (liveRateService) {
      console.log('LiveRate service instance exists.');
      const socket = liveRateService.getSocket();
      console.log('Socket instance:', socket);
      if (socket?.connected) {
        console.log('Socket is already connected with ID:', socket.id);
      } else {
        console.log('Socket is NOT connected. Attempting manual connect...');
        socket?.connect();
      }
    }
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <AppRoutes />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
