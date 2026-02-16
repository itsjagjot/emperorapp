import React, { useState } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonSegment, IonSegmentButton, IonLabel, IonSearchbar,
    IonIcon, IonButtons, IonButton
} from '@ionic/react';
import { optionsOutline, megaphoneOutline } from 'ionicons/icons';
import './Trade.css';

const Trade: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState('success');

    return (
        <IonPage>
            <IonHeader className="ion-no-border trade-header">
                <IonToolbar color="white">
                    <IonTitle className="trade-title">Trade</IonTitle>
                </IonToolbar>

                {/* Professional Marquee Section */}
                <div className="trade-ticker">
                    <IonIcon icon={megaphoneOutline} className="ticker-icon" />
                    <div className="marquee-wrapper">
                        <div className="marquee-content">
                            NCDEX - CASTOR COCUDAKL GUARGUM5 GL ... LIVE RATES UPDATING ...
                        </div>
                    </div>
                </div>

                {/* Tabs / Segments */}
                <IonToolbar className="segment-toolbar">
                    <IonSegment
                        value={selectedTab}
                        onIonChange={(e) => setSelectedTab(e.detail.value as string)}
                        mode="md"
                    >
                        <IonSegmentButton value="success">
                            <IonLabel>SUCCESS</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="pending">
                            <IonLabel>PENDING</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="deals">
                            <IonLabel>DEALS</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </IonToolbar>

                {/* Search & Filter Section */}
                <div className="search-filter-row">
                    <IonSearchbar
                        placeholder="Search"
                        mode="md"
                        className="trade-search"
                    />
                    <IonButton fill="clear" className="filter-btn">
                        <IonIcon slot="icon-only" icon={optionsOutline} />
                    </IonButton>
                </div>
            </IonHeader>

            <IonContent className="ion-padding trade-content">
                <div className="empty-state-wrapper">
                    <div className="no-data-illustration">
                        <img
                            src="assets/no-data.png" // Apni local image path use karein
                            alt="No Data"
                            className="empty-img"
                        />
                        <h3 className="empty-text">No record's found</h3>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Trade;