import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar, IonIcon
} from '@ionic/react';
import { searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './DeleteTrade.css';

const DeleteTrade: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Delete Trades" />
            <IonContent className="admin-bg">

                <div className="delete-trades-wrapper">

                    {/* Row 1: Exchange and Script */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect placeholder="Exchange" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="NSE">NSE</IonSelectOption>
                                <IonSelectOption value="MCX">MCX</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect placeholder="Select Script" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="all">All Script</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 2: Delete Status and User */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect placeholder="Select Status" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="delete_admin">Delete by admin</IonSelectOption>
                                <IonSelectOption value="cancel_admin">Canceled by admin</IonSelectOption>
                                <IonSelectOption value="cancel_user">Canceled by user</IonSelectOption>
                                <IonSelectOption value="expired">Expired</IonSelectOption>
                                <IonSelectOption value="modified">Modified</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect placeholder="All User" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="all">All User</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 3: Date Filter (Custom Component) */}
                    <div className="full-width">
                        <DateFilter />
                    </div>

                    {/* Row 4: Action Buttons (View/Clear) */}
                    <div className="filter-row">
                        <button className="btn-view-full">
                            <IonIcon icon={searchOutline} className="btn-icon-gap" />
                            View
                        </button>
                        <button className="btn-reset-full">
                            <IonIcon icon={refreshOutline} className="btn-icon-gap" />
                            Clear
                        </button>
                    </div>

                    {/* Row 5: Search Bar */}
                    <div className="search-container">
                        <IonSearchbar
                            placeholder="Search exchange or script"
                            className="pnl-searchbar"
                        />
                    </div>

                    {/* Table Section */}
                    <div className="scrollable-table-container">
                        <div className="table-min-width">
                            <div className="table-header-row">
                                <div className="th-item desc-col">Script ↑</div>
                                <div className="th-item">User</div>
                                <div className="th-item">Qty</div>
                                <div className="th-item">Price</div>
                                <div className="th-item">Status</div>
                                <div className="th-item">Time</div>
                            </div>
                            <div className="empty-state">
                                <p>No trades found</p>
                            </div>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default DeleteTrade;