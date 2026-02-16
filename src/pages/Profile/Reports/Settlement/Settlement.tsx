import React, { useState } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonRadioGroup, IonRadio, IonLabel, IonItem, IonIcon
} from '@ionic/react';
import { downloadOutline, trendingUpOutline, trendingDownOutline, statsChartOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './Settlement.css';

const SettlementsReport: React.FC = () => {
    const [withOpening, setWithOpening] = useState('no');

    return (
        <IonPage>
            <CommonHeader title="Settlement Report" />
            <IonContent className="admin-bg">

                <div className="settlement-wrapper">

                    {/* Row 1: Date Filter */}
                    <DateFilter />

                    {/* Row 2: Select User */}
                    <div className="filter-card full-width">
                        <IonSelect placeholder="Select User" interface="action-sheet" className="brand-select">
                            <IonSelectOption value="all">All User</IonSelectOption>
                        </IonSelect>
                    </div>

                    {/* Row 3: With Opening Radio Buttons */}
                    <div className="opening-section">
                        <p className="section-label">With Opening:</p>
                        <IonRadioGroup value={withOpening} onIonChange={e => setWithOpening(e.detail.value)}>
                            <div className="radio-flex">
                                <div className="radio-item">
                                    <IonRadio value="yes" mode="md" />
                                    <IonLabel>Yes</IonLabel>
                                </div>
                                <div className="radio-item">
                                    <IonRadio value="no" mode="md" />
                                    <IonLabel>No</IonLabel>
                                </div>
                            </div>
                        </IonRadioGroup>
                    </div>

                    {/* Row 4: Action Buttons (Side by Side) */}
                    <div className="filter-row">
                        <button className="btn-reset-full">Reset</button>
                        <button className="btn-view-full">View</button>
                    </div>

                    {/* Status Bars Section */}
                    <div className="status-bars-container">
                        <button className="status-bar download-bar">
                            <div className="bar-left">
                                <IonIcon icon={downloadOutline} />
                                <span>Download Report</span>
                            </div>
                            <IonIcon icon={downloadOutline} className="end-icon" />
                        </button>

                        <div className="status-bar summary-bar">
                            <div className="bar-left">
                                <IonIcon icon={statsChartOutline} />
                                <span>Total Profit & Loss</span>
                            </div>
                            <span className="count-badge">0</span>
                        </div>

                        <div className="status-bar profit-bar">
                            <div className="bar-left">
                                <IonIcon icon={trendingUpOutline} />
                                <span>PROFIT</span>
                            </div>
                            <IonIcon icon={trendingUpOutline} className="arrow-icon" />
                        </div>

                        <div className="status-bar loss-bar">
                            <div className="bar-left">
                                <IonIcon icon={trendingDownOutline} />
                                <span>LOSS</span>
                            </div>
                            <IonIcon icon={trendingDownOutline} className="arrow-icon" />
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default SettlementsReport;