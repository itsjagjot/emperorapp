import React, { useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonGrid, IonRow, IonCol, IonSearchbar, IonIcon, IonSelect, IonSelectOption
} from '@ionic/react';
import { refreshOutline, megaphoneOutline, chevronUpOutline } from 'ionicons/icons';
import './Position.css';

const Position: React.FC = () => {
    const [totalType, setTotalType] = useState('total');

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle className="main-title ion-text-center">Position</IonTitle>
                </IonToolbar>

                {/* Marquee Banner - Using CSS instead of <marquee> tag */}
                <div className="ticker-banner">
                    <IonIcon icon={megaphoneOutline} className="megaphone" />
                    <div className="marquee-wrapper">
                        <span className="marquee-text">NEW CONTRACT Open NCDEX - CASTOR COCUI</span>
                    </div>
                </div>
            </IonHeader>

            <IonContent className="ion-padding custom-content">
                {/* Summary Card */}
                <div className="summary-card">
                    <IonGrid className="ion-no-padding">
                        {/* Selector Row */}
                        <IonRow className="total-row ion-align-items-center">
                            <IonCol size="8" className="selector-col">
                                <IonSelect
                                    value={totalType}
                                    interface="popover"
                                    toggleIcon="swap-vertical"
                                    className="total-selector"
                                    onIonChange={e => setTotalType(e.detail.value)}
                                >
                                    <IonSelectOption value="total">Total</IonSelectOption>
                                    <IonSelectOption value="mtm">M2M Total</IonSelectOption>
                                    <IonSelectOption value="realised">Realised Total</IonSelectOption>
                                </IonSelect>
                            </IonCol>
                            <IonCol size="4" className="ion-text-end total-value">0</IonCol>
                        </IonRow>
                    </IonGrid>
                </div>

                {/* Search Bar Wrapper */}
                <div className="search-container">
                    <IonSearchbar
                        placeholder="Search"
                        className="custom-search"
                        searchIcon="search-outline"
                    ></IonSearchbar>
                    <IonIcon icon={refreshOutline} className="refresh-btn" />
                </div>

                {/* Empty State */}
                <div className="empty-state">
                    <img src="assets/no-positions.png" alt="No positions" className="empty-img" />
                    <h2 className="empty-title">No positions</h2>
                    <p className="empty-subtitle">Place an order from your quotes</p>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Position;