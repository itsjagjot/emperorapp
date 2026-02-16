import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/react';
import { searchOutline, refreshOutline, statsChartOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import './PnL.css';

const PnL: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Profit & Loss" />
            <IonContent className="admin-bg">

                {/* 1. Top Filters */}
                <div className="pnl-filter-container">
                    <div className="dropdown-flex-grow custom-input-box">
                        <IonSelect
                            placeholder="All User"
                            interface="action-sheet"
                            className="brand-green-select"
                        >
                            <IonSelectOption value="all">All User</IonSelectOption>
                            <IonSelectOption value="ks01">Ks01</IonSelectOption>
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

                {/* 2. Dark Summary Header Strip */}
                <div className="pnl-summary-header">
                    <IonIcon icon={statsChartOutline} className="header-icon" />
                    <span>Profit & Loss Summary</span>
                </div>

                {/* 3. PnL Data Table */}
                <div className="pnl-table-container">
                    {/* Table Headings */}
                    <IonGrid className="pnl-grid header-grid">
                        <IonRow>
                            <IonCol size="4">Username</IonCol>
                            <IonCol size="3" className="ion-text-right">Realised P&L</IonCol>
                            <IonCol size="2.5" className="ion-text-right">M2MPL</IonCol>
                            <IonCol size="2.5" className="ion-text-right">Total</IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Table Rows */}
                    <div className="pnl-rows-scroll">
                        <IonGrid className="pnl-grid data-row total-row">
                            <IonRow>
                                <IonCol size="4" className="user-link">TOTAL</IonCol>
                                <IonCol size="3" className="ion-text-right val">0</IonCol>
                                <IonCol size="2.5" className="ion-text-right val">0</IonCol>
                                <IonCol size="2.5" className="ion-text-right val">0</IonCol>
                            </IonRow>
                        </IonGrid>

                        <IonGrid className="pnl-grid data-row admin-row">
                            <IonRow>
                                <IonCol size="4" className="user-link">ADMIN</IonCol>
                                <IonCol size="3" className="ion-text-right val">0</IonCol>
                                <IonCol size="2.5" className="ion-text-right val">0</IonCol>
                                <IonCol size="2.5" className="ion-text-right val">0</IonCol>
                            </IonRow>
                        </IonGrid>

                        <IonGrid className="pnl-grid data-row">
                            <IonRow>
                                <IonCol size="4" className="user-link">Ks01</IonCol>
                                <IonCol size="3" className="ion-text-right val">0</IonCol>
                                <IonCol size="2.5" className="ion-text-right val">0</IonCol>
                                <IonCol size="2.5" className="ion-text-right val">0</IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default PnL;