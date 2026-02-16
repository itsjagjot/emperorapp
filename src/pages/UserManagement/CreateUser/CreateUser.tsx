import React from 'react';
import {
    IonContent, IonPage, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
    IonToggle, IonCheckbox, IonButton, IonIcon, IonList
} from '@ionic/react';
import {
    personCircleOutline, personOutline, lockClosedOutline, globeOutline,
    settingsOutline, addCircleOutline, keyOutline, trendingUpOutline,
    shieldCheckmarkOutline, chevronDownOutline
} from 'ionicons/icons';
import CommonHeader from '../../../components/CommonHeader';
import './CreateUser.css';

const CreateUser: React.FC = () => {
    const exchanges = [
        { name: 'MCX', turnover: true, lot: false, group: 'MCX 2 LOT' },
        { name: 'NSE', turnover: true, lot: false, group: 'NSE defc' },
        { name: 'SGX', turnover: true, lot: false, group: 'sgx 500' },
        { name: 'OTHERS', turnover: true, lot: false, group: 'OTHERS' },
        { name: 'MINI', turnover: true, lot: false, group: 'MINI - 2' },
        { name: 'CDS', turnover: true, lot: false, group: 'Default' },
        { name: 'CALLPUT', turnover: false, lot: true, group: 'CALLPUT' },
    ];

    return (
        <IonPage className="create-user-page">
            <CommonHeader title="Create New User" />
            <IonContent className="ion-padding emperor-bg">

                {/* --- User Identity (Current Design) --- */}
                <div className="modern-card">
                    <div className="card-accent-bar"></div>
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={shieldCheckmarkOutline} className="accent-icon" />
                            <h3>User Identity</h3>
                        </div>
                        <IonItem lines="none" className="modern-toggle-item">
                            <IonCheckbox slot="start" mode="md" />
                            <IonLabel>Enable Account Creation</IonLabel>
                        </IonItem>
                        <div className="custom-dropdown">
                            <IonSelect value="SuperAdmin" interface="popover">
                                <IonSelectOption value="SuperAdmin">SuperAdmin (Master)</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="info-tag">
                            <IonIcon icon={personOutline} />
                            <span>User Type: <strong>Client</strong></span>
                        </div>
                    </div>
                </div>

                {/* --- Profile Details (Current Design) --- */}
                <div className="modern-card">
                    <div className="card-accent-bar gold"></div>
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={personCircleOutline} className="accent-icon" />
                            <h3>Profile Details</h3>
                        </div>
                        <div className="floating-input"><IonInput label="Full Name*" labelPlacement="stacked" placeholder="John Doe" fill="outline" /></div>
                        <div className="floating-input"><IonInput label="Username*" labelPlacement="stacked" placeholder="@username" fill="outline" /></div>
                        <div className="input-row">
                            <div className="floating-input"><IonInput type="password" label="Password*" labelPlacement="stacked" value="********" fill="outline" /></div>
                            <div className="floating-input"><IonInput label="Credit*" labelPlacement="stacked" placeholder="0.00" fill="outline" type="number" /></div>
                        </div>
                    </div>
                </div>

                {/* --- Exchange Access (Fixed Table Layout) --- */}
                <div className="modern-card">
                    <div className="card-accent-bar"></div>
                    <div className="card-inner no-padding-sides">
                        <div className="card-top padded-header">
                            <IonIcon icon={globeOutline} className="accent-icon" />
                            <h3>Exchange Allow</h3>
                        </div>

                        <div className="exchange-table">
                            <div className="table-header">
                                <span className="col-ex">Exchange</span>
                                <span className="col-br">Brokerage</span>
                                <span className="col-gr">Group</span>
                            </div>
                            <div className="table-subheader">
                                <span></span>
                                <span>Turnover</span>
                                <span>Lot</span>
                                <span>Assign Group</span>
                            </div>

                            {exchanges.map((ex, i) => (
                                <div className="table-row" key={i}>
                                    <div className="col-ex cell">
                                        <IonCheckbox mode="md" />
                                        <span className="ex-text">{ex.name}</span>
                                    </div>
                                    <div className="col-br cell dual-check">
                                        <IonCheckbox mode="md" checked={ex.turnover} />
                                    </div>
                                    <div className="col-br cell dual-check">
                                        <IonCheckbox mode="md" checked={ex.lot} />
                                    </div>
                                    <div className="col-gr cell">
                                        <IonSelect interface="popover" value={ex.group} toggleIcon={chevronDownOutline}>
                                            <IonSelectOption value={ex.group}>{ex.group}</IonSelectOption>
                                        </IonSelect>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- High Low Section --- */}
                <div className="modern-card">
                    <div className="card-accent-bar gold"></div>
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={trendingUpOutline} className="accent-icon" />
                            <h3>High Low Between Trade Limit</h3>
                        </div>
                        <div className="select-all-box">
                            <IonCheckbox mode="md" />
                            <IonLabel>Select All Exchanges</IonLabel>
                        </div>
                    </div>
                </div>

                {/* --- Account Settings (Current Design) --- */}
                <div className="modern-card">
                    <div className="card-inner">
                        <div className="card-top">
                            <IonIcon icon={settingsOutline} className="accent-icon" />
                            <h3>Account Settings</h3>
                        </div>
                        <IonList lines="none" className="minimal-list">
                            <IonItem>
                                <IonIcon icon={addCircleOutline} slot="start" />
                                <IonLabel>Grant Master Access</IonLabel>
                                <IonToggle slot="end" mode="ios" />
                            </IonItem>
                            <IonItem>
                                <IonIcon icon={keyOutline} slot="start" />
                                <IonLabel>Force Password Reset</IonLabel>
                                <IonToggle slot="end" mode="ios" checked={true} />
                            </IonItem>
                        </IonList>
                    </div>
                </div>

                <div className="btn-container">
                    <IonButton expand="block" className="emperor-btn-luxury">CONFIRM & CREATE USER</IonButton>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default CreateUser;