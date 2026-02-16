import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import './OpenPositionUserwise.css';

const OpenPositionUserwise: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Userwise Open Position" />
            <IonContent className="admin-bg">

                <div className="userwise-wrapper">

                    {/* Row 1: Exchange and Script Select */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect placeholder="Exchange" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="NSE">NSE</IonSelectOption>
                                <IonSelectOption value="MCX">MCX</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect placeholder="Select Script" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="all">Select Script</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 2: User Select and Action Buttons */}
                    <div className="filter-row">
                        <div className="filter-card flex-grow">
                            <IonSelect value="HRT90" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="HRT90">HRT90</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="action-btns">
                            <button className="btn-view">View</button>
                            <button className="btn-reset">Reset</button>
                        </div>
                    </div>

                    {/* Row 3: Search Bar */}
                    <div className="search-container">
                        <IonSearchbar
                            placeholder="Search exchange or script"
                            className="pnl-searchbar"
                        />
                    </div>

                    {/* Table Section - Jive baki reports ch scrollable hai */}
                    {/* <div className="scrollable-table-container">
                        <div className="table-min-width">
                            <div className="table-header-row">
                                <div className="th-item desc-col">Script ↑</div>
                                <div className="th-item">User</div>
                                <div className="th-item">Qty</div>
                                <div className="th-item">Buy Avg</div>
                                <div className="th-item">Sell Avg</div>
                                <div className="th-item">LTP</div>
                                <div className="th-item">M2M</div>
                            </div>

                            <div className="empty-state">
                                <p>No open positions found</p>
                            </div>
                        </div>
                    </div> */}

                </div>
            </IonContent>
        </IonPage>
    );
};

export default OpenPositionUserwise;