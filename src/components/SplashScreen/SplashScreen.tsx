import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
    onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [isFading, setIsFading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const hasStartedFadeOut = React.useRef(false);

    useEffect(() => {
        // Fallback timer: wait 3.5s then fade out
        const timer = setTimeout(() => {
            startFadeOut();
        }, 3500);

        return () => clearTimeout(timer);
    }, []);

    const startFadeOut = () => {
        if (!hasStartedFadeOut.current) {
            hasStartedFadeOut.current = true;
            setIsFading(true);
            setTimeout(() => {
                setIsVisible(false);
                if (onFinish) onFinish();
            }, 500); // 0.5s fade duration
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`splash-screen ${isFading ? 'fade-out' : ''}`}>
            <video
                className="splash-video"
                autoPlay
                muted
                playsInline
                onEnded={startFadeOut}
            >
                <source src="/splash.mp4" type="video/mp4" />
                <img src="/splash.gif" alt="Splash Screen" className="splash-video" />
            </video>
        </div>
    );
};

export default SplashScreen;
