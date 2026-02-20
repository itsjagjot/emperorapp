import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonRefresher, IonRefresherContent, IonIcon
} from '@ionic/react';
import { notificationsOutline, checkmarkDoneOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import { getNotifications, markNotificationRead, Notification } from '../../services/notificationService';
import Loader from '../../components/Loader/Loader';
import './Notifications.css';

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

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
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/app/home" />
                    </IonButtons>
                    <IonTitle>Notifications</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="notifications-content">
                <IonRefresher slot="fixed" onIonRefresh={loadNotifications}>
                    <IonRefresherContent />
                </IonRefresher>

                {loading && notifications.length === 0 ? (
                    <Loader />
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <IonIcon icon={notificationsOutline} />
                        <p>No notifications yet</p>
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

export default Notifications;
