import React, { useState } from 'react';
import {
    IonContent, IonPage, IonIcon, IonSelect,
    IonSelectOption, IonDatetime, IonModal
} from '@ionic/react';
import {
    timeOutline, locationOutline, desktopOutline,
    searchOutline, fingerPrintOutline, calendarOutline, chevronBackOutline
} from 'ionicons/icons';
import './LoginHistory.css';
import CommonHeader from '../../../components/CommonHeader';
import DateFilter from '../../../components/DateFilter';

const LoginHistory: React.FC = () => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('this_week');
    const [dateRange, setDateRange] = useState({ start: '02-02-2026', end: '08-02-2026' });

    const handlePeriodChange = (e: any) => {
        const val = e.detail.value;
        setSelectedPeriod(val);
        if (val === 'custom') {
            setShowDatePicker(true);
        }
    };

    return (
        <IonPage className="login-history-page">
            <CommonHeader title="Login History" />

            <IonContent className="premium-bg ion-padding">

                {/* 1. Modern Time Period Selector */}
                <div className="filter-card-container">
                    <DateFilter />
                </div>

                {/* 2. Search Bar */}
                <div className="lh-search-wrapper">
                    <div className="search-inner">
                        <IonIcon icon={searchOutline} />
                        <input type="text" placeholder="Search by user or device..." />
                    </div>
                </div>

                {/* 3. Action Buttons Row */}
                <div className="action-row">
                    <button className="btn-secondary">Reset</button>
                    <button className="btn-primary">View</button>
                </div>

                {/* 4. History List */}
                <div className="history-timeline">
                    {[1, 2].map((_, i) => (
                        <div className="history-premium-card" key={i}>
                            <div className="card-header">
                                <div className="user-profile">
                                    <div className="avatar-circle">H</div>
                                    <div className="user-name-info">
                                        <h4>HRT90</h4>
                                        <span className="role-tag">MASTER</span>
                                    </div>
                                </div>
                                <div className="timestamp-info">
                                    <p className="main-date">05 Feb 2026</p>
                                    <span className="main-time">01:01 PM</span>
                                </div>
                            </div>

                            <div className="card-divider-dash"></div>

                            <div className="card-body">
                                <div className="info-row">
                                    <IonIcon icon={locationOutline} />
                                    <span>Ludhiana, Punjab</span>
                                </div>
                                <div className="info-row">
                                    <IonIcon icon={desktopOutline} />
                                    <span>Android 14</span>
                                </div>

                                {/* Device ID Box */}
                                <div className="id-badge-container">
                                    <IonIcon icon={fingerPrintOutline} />
                                    <span>ID: 94fcf104d8d2e216</span>
                                </div>

                                <div className="status-container">
                                    <span className="status-pill-success">SUCCESS</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Custom Date Modal */}
                <IonModal isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)} className="custom-date-modal">
                    <div className="modal-content-wrapper">
                        <IonDatetime presentation="date" multiple={false} />
                        <div className="modal-footer">
                            <button onClick={() => setShowDatePicker(false)}>Cancel</button>
                            <button className="apply-btn" onClick={() => setShowDatePicker(false)}>Apply</button>
                        </div>
                    </div>
                </IonModal>

            </IonContent>
        </IonPage>
    );
};

export default LoginHistory;