import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonRefresher, IonRefresherContent, IonIcon, useIonToast
} from '@ionic/react';
import { notificationsOutline, checkmarkDoneOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import { getNotifications, markNotificationRead, Notification } from '../../../../services/notificationService';
import CommonHeader from '../../../../components/CommonHeader';
import Loader from '../../../../components/Loader/Loader';
import './Message.css';

const Message: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [present] = useIonToast();

    const loadNotifications = async (event?: CustomEvent) => {
        try {
            const result = await getNotifications();
            if (result.success) {
                setNotifications(result.data);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
            if (event) event.detail.complete();
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleRead = async (id: number) => {
        // Optimistically update UI
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: 1 } : n
        ));
        try {
            await markNotificationRead(id);
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    return (
        <IonPage>
            <CommonHeader title="Messages" backLink="/app/profile" />
            <IonContent className="notifications-content">
                <IonRefresher slot="fixed" onIonRefresh={loadNotifications}>
                    <IonRefresherContent />
                </IonRefresher>

                {loading && notifications.length === 0 ? (
                    <Loader />
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <IonIcon icon={notificationsOutline} />
                        <p>No messages yet</p>
                    </div>
                ) : (
                    <div className="notification-list">
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={`notification-card ${n.is_read ? 'read' : 'unread'}`}
                                onClick={() => !n.is_read && handleRead(n.id)}
                            >
                                <div className="card-header">
                                    <div className="icon-wrapper">
                                        <IonIcon icon={chatboxEllipsesOutline} />
                                    </div>
                                    <div className="title-row">
                                        <h3>{n.title}</h3>
                                        <span className="time">{new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {n.is_read ? (
                                        <IonIcon icon={checkmarkDoneOutline} className="status-icon read" />
                                    ) : (
                                        <div className="status-dot"></div>
                                    )}
                                </div>
                                <div className="card-body">
                                    <p>{n.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Message;