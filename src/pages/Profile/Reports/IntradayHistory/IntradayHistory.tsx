import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonIcon
} from '@ionic/react';
import { searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import './IntradayHistory.css';

const IntradayHistory: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Intraday History" />
            <IonContent className="admin-bg">

                {/* Filter Section */}
                <div className="intraday-filter-wrapper">

                    {/* Row 1: Exchange and Script */}
                    <div className="filter-row">
                        <div className="filter-item-half">
                            <IonSelect placeholder="Exchan..." interface="action-sheet" className="brand-select">
                                <IonSelectOption value="NSE">NSE</IonSelectOption>
                                <IonSelectOption value="MCX">MCX</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="filter-item-half">
                            <IonSelect placeholder="Select Script" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="ADANIENT">ADANIENT Feb 24</IonSelectOption>
                                <IonSelectOption value="RELIANCE">RELIANCE Feb 24</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 2: Minute Interval and Icons */}
                    <div className="filter-row">
                        <div className="dropdown-flex-grow">
                            <IonSelect placeholder="minute" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="1">minute</IonSelectOption>
                                <IonSelectOption value="2">2min</IonSelectOption>
                                <IonSelectOption value="5">5min</IonSelectOption>
                                <IonSelectOption value="10">10min</IonSelectOption>
                                <IonSelectOption value="15">15min</IonSelectOption>
                            </IonSelect>
                        </div>

                        <div className="icon-actions-group">
                            <div className="action-circle-btn search-bg">
                                <IonIcon icon={searchOutline} />
                            </div>
                            <div className="action-circle-btn reset-outline-btn">
                                <IonIcon icon={refreshOutline} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Content Area */}
                <div className="history-placeholder">
                    <p>Coming Soon...</p>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default IntradayHistory;