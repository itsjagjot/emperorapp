import React, { useState } from 'react';
import {
    IonContent, IonPage, IonToggle, IonList, IonItem, IonLabel,
    useIonToast, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle
} from '@ionic/react';
import './Notification.css';

const Notification: React.FC = () => {
    const [present] = useIonToast();
    const [settings, setSettings] = useState({
        marketOrder: false,
        pendingOrder: false,
        executePending: false,
        deletePending: false,
        tradingSound: true
    });

    const handleUpdate = () => {
        present({ message: 'Settings updated!', duration: 1500, color: 'dark', position: 'bottom' });
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="notif-toolbar">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/app/profile" text="" />
                    </IonButtons>
                    <IonTitle>Notification Settings</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="notif-bg">
                <div className="notif-wrapper">
                    <IonList lines="full" className="clean-list">

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Market Order</IonLabel>
                            <IonToggle
                                slot="end"
                                checked={settings.marketOrder}
                                onIonChange={e => setSettings({ ...settings, marketOrder: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Pending Order</IonLabel>
                            <IonToggle
                                slot="end"
                                checked={settings.pendingOrder}
                                onIonChange={e => setSettings({ ...settings, pendingOrder: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Execute Pending Order</IonLabel>
                            <IonToggle
                                slot="end"
                                checked={settings.executePending}
                                onIonChange={e => setSettings({ ...settings, executePending: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Delete Pending Order</IonLabel>
                            <IonToggle
                                slot="end"
                                checked={settings.deletePending}
                                onIonChange={e => setSettings({ ...settings, deletePending: e.detail.checked })}
                            />
                        </IonItem>

                        <IonItem className="notif-row">
                            <IonLabel className="setting-label">Trading Sound</IonLabel>
                            <IonToggle
                                slot="end"
                                color="success"
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