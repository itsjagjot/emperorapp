import React, { useState } from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption,
    IonSearchbar, IonRow, IonCol, IonItem, IonIcon,
    IonDatetimeButton, IonModal, IonDatetime, IonButtons, IonButton
} from '@ionic/react';
import { chevronDownOutline, searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../components/CommonHeader';
import './AccountSummary.css';

const AccountSummary: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Custom period');
    const today = new Date().toISOString().split('T')[0];

    return (
        <IonPage className="account-summary-page">
            <CommonHeader title="Account Summary" />
            <IonContent className="ion-padding compact-content">

                {/* 1. Period Selector */}
                <IonItem lines="none" className="slim-input">
                    <IonSelect
                        value={selectedPeriod}
                        interface="action-sheet"
                        onIonChange={e => setSelectedPeriod(e.detail.value)}
                        toggleIcon={chevronDownOutline}
                    >
                        <IonSelectOption value="This Week">This Week</IonSelectOption>
                        <IonSelectOption value="Previous Week">Previous Week</IonSelectOption>
                        <IonSelectOption value="Custom period">Custom period</IonSelectOption>
                    </IonSelect>
                </IonItem>

                {/* Date Picker Row (Future disabled & Pill shape) */}
                {selectedPeriod === 'Custom period' && (
                    <IonRow className="date-row-tight">
                        <IonCol size="6">
                            <div className="pill-date-container">
                                <IonDatetimeButton datetime="from" />
                            </div>
                        </IonCol>
                        <IonCol size="6">
                            <div className="pill-date-container">
                                <IonDatetimeButton datetime="to" />
                            </div>
                        </IonCol>
                    </IonRow>
                )}

                <IonModal keepContentsMounted={true}>
                    <IonDatetime
                        id="from"
                        presentation="date"
                        max={today}
                        showDefaultButtons={true}
                        doneText="Apply"
                        cancelText="Cancel"
                    ></IonDatetime>
                </IonModal>
                <IonModal keepContentsMounted={true}>
                    <IonDatetime
                        id="to"
                        presentation="date"
                        max={today}
                        showDefaultButtons={true}
                        doneText="Apply"
                        cancelText="Cancel"
                    ></IonDatetime>
                </IonModal>

                {/* 3. User Select + Search/Reset Icons Row */}
                <div className="action-row-compact">
                    <IonItem lines="none" className="slim-input user-flex">
                        <IonSelect placeholder="Select User" value="HRT90">
                            <IonSelectOption value="HRT90">HRT90</IonSelectOption>
                            <IonSelectOption value="Ks01">Ks01</IonSelectOption>
                        </IonSelect>
                    </IonItem>

                    {/* View/Search Icon Button */}
                    <div className="icon-btn-box view-bg">
                        <IonIcon icon={searchOutline} />
                    </div>

                    {/* Clear/Reset Icon Button */}
                    <div className="icon-btn-box reset-border">
                        <IonIcon icon={refreshOutline} />
                    </div>
                </div>

                {/* 4. Grey Search Bar */}
                <IonSearchbar
                    placeholder="Search exchange or script"
                    className="compact-grey-search"
                ></IonSearchbar>

                {/* 5. Opening Balance */}
                <div className="balance-strip-compact">
                    <span className="balance-label">Opening Balance</span>
                    <span className="balance-value">0.0</span>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default AccountSummary;