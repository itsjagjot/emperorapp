import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar, IonIcon
} from '@ionic/react';
import { searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import './OpenPositionPercent.css';

const OpenPositionPercent: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="% Open Position" />
            <IonContent className="admin-bg">

                <div className="open-pos-wrapper">

                    {/* Row 1: Exchange and Script Select */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect placeholder="Exchange" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="MCX">MCX</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect placeholder="All Script" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="GOLD">GOLD</IonSelectOption>
                                <IonSelectOption value="SILVER">SILVER</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 2: User Select and Only Icon Buttons */}
                    <div className="filter-row">
                        <div className="filter-card flex-grow">
                            <IonSelect placeholder="All User" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="all">All User</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="action-btns-only">
                            {/* Search Icon Button */}
                            <button className="btn-icon-square view-bg">
                                <IonIcon icon={searchOutline} />
                            </button>
                            {/* Reset Icon Button */}
                            <button className="btn-icon-square reset-border">
                                <IonIcon icon={refreshOutline} />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="search-container">
                        <IonSearchbar
                            placeholder="Search exchange or script"
                            className="pnl-searchbar"
                        />
                    </div>

                    {/* Scrollable Table Section */}
                    <div className="scrollable-table-container">
                        <div className="table-min-width">
                            <div className="table-header-row">
                                <div className="th-item desc-col">Script ↑</div>
                                <div className="th-item">Total Qty</div>
                                <div className="th-item">Buy Qty</div>
                                <div className="th-item">Sell Qty</div>
                                <div className="th-item">% Age</div>
                            </div>
                            <div className="empty-state">
                                <p>No data available</p>
                            </div>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default OpenPositionPercent;