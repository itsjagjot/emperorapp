import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { megaphoneOutline } from 'ionicons/icons';
import { getTickerMessages, Notification } from '../../services/notificationService';
import './TickerBanner.css';

const TickerBanner: React.FC = () => {
    const [messages, setMessages] = useState<Notification[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchMessages = async () => {
            try {
                const response = await getTickerMessages();
                if (response.success && mounted) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error('Error fetching ticker messages:', error);
            }
        };

        fetchMessages();

        // Optionally refresh every few minutes
        const interval = setInterval(fetchMessages, 5 * 60 * 1000); // 5 mins

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, []);

    if (messages.length === 0) {
        return null;
    }

    const marqueeText = messages
        .map(m => `${m.title.toUpperCase()} ${m.message}`)
        .join(' | ');

    return (
        <div className="ticker-banner">
            <IonIcon icon={megaphoneOutline} className="megaphone" />
            <div className="marquee-wrapper">
                <span className="marquee-text">{marqueeText}</span>
            </div>
        </div>
    );
};

export default TickerBanner;
