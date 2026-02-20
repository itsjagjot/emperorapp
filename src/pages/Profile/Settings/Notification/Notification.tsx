import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonToggle, IonList, IonItem, IonLabel,
    useIonToast, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle
} from '@ionic/react';
import './Notification.css';
import CommonHeader from '../../../../components/CommonHeader';
import { getNotificationSettings, updateNotificationSettings } from '../../../../services/notificationService';

const Notification: React.FC = () => {
    const [present] = useIonToast();
    const [settings, setSettings] = useState({
        marketOrder: false,
        pendingOrder: false,
        executePending: false,
        deletePending: false,
        tradingSound: false,
    });

    const loadSettings = async () => {
        try {
            const result = await getNotificationSettings();
            if (result.success && result.data) {
                setSettings({
                    marketOrder: result.data.market_order,
                    pendingOrder: result.data.pending_order,
                    executePending: result.data.execute_pending,
                    deletePending: result.data.delete_pending,
                    tradingSound: result.data.trading_sound
                });
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleUpdate = async () => {
        try {
            const apiSettings = {
                market_order: settings.marketOrder,
                pending_order: settings.pendingOrder,
                execute_pending: settings.executePending,
                delete_pending: settings.deletePending,
                trading_sound: settings.tradingSound
            };

            const result = await updateNotificationSettings(apiSettings);
            if (result.success) {
                present({ message: 'Settings updated!', duration: 1500, color: 'success', position: 'bottom' });
            } else {
                present({ message: 'Failed to update settings', duration: 1500, color: 'danger', position: 'bottom' });
            }
        } catch (error) {
            console.error('Failed to update settings', error);
            present({ message: 'Error updating settings', duration: 1500, color: 'danger', position: 'bottom' });
        }
    };

    return (
        <IonPage>
            <CommonHeader title="Notification Settings" backLink="/app/profile" />

            <IonContent className="notif-bg">
                <div className="notif-wrapper">
                    <IonList lines="full" className="clean-list">

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Market Order</IonLabel>
                            <IonToggle
                                slot="end"
                                color={settings.marketOrder ? "success" : "default"}
                                checked={settings.marketOrder}
                                onIonChange={e => setSettings({ ...settings, marketOrder: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Pending Order</IonLabel>
                            <IonToggle
                                slot="end"
                                color={settings.pendingOrder ? "success" : "default"}
                                checked={settings.pendingOrder}
                                onIonChange={e => setSettings({ ...settings, pendingOrder: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Execute Pending Order</IonLabel>
                            <IonToggle
                                slot="end"
                                color={settings.executePending ? "success" : "default"}
                                checked={settings.executePending}
                                onIonChange={e => setSettings({ ...settings, executePending: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Delete Pending Order</IonLabel>
                            <IonToggle
                                slot="end"
                                color={settings.deletePending ? "success" : "default"}
                                checked={settings.deletePending}
                                onIonChange={e => setSettings({ ...settings, deletePending: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Trading Sound</IonLabel>
                            <IonToggle
                                slot="end"
                                color={settings.tradingSound ? "success" : "default"}
                                checked={settings.tradingSound}
                                onIonChange={e => setSettings({ ...settings, tradingSound: e.detail.checked })}
                            />
                        </IonItem>

                    </IonList>

                    <div className="btn-area">
                        <button className="update-btn-pro" onClick={handleUpdate}>
                            Update
                        </button>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Notification;