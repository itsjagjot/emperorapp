import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar, IonIcon
} from '@ionic/react';
import { searchOutline, refreshOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter'; // Path check kar lvo
import './RejectionLog.css';
import UserFilter from '../../../../components/UserFilter';

const RejectionLogHistory: React.FC = () => {
    const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
    return (
        <IonPage>
            <CommonHeader title="Rejection Log History" />
            <IonContent className="admin-bg">

                <div className="rejection-wrapper">

                    {/* Row 1: Exchange and Script */}
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

                    {/* Row 2: Date Filter (Custom Component) */}
                    <div className="full-width">
                        <DateFilter />
                    </div>

                    {/* Row 3: All User Select */}
                    <UserFilter
                        onUserChange={setSelectedUser}
                        includeSelf
                        label="Select User"
                    />

                    {/* Row 4: Action Buttons */}
                    <div className="filter-row">
                        <button className="btn-reset-full">
                            <IonIcon icon={refreshOutline} className="btn-icon-gap" />
                            Reset
                        </button>
                        <button className="btn-view-full">
                            <IonIcon icon={searchOutline} className="btn-icon-gap" />
                            View
                        </button>
                    </div>

                    {/* Row 5: Search Bar */}
                    <div className="search-container">
                        <IonSearchbar
                            placeholder="Search exchange or script"
                            className="pnl-searchbar"
                        />
                    </div>

                    {/* Table Section - Horizontal Scrollable */}
                    <div className="scrollable-table-container">
                        <div className="table-min-width">
                            <div className="table-header-row">
                                <div className="th-item desc-col">Script ↑</div>
                                <div className="th-item">User</div>
                                <div className="th-item">Qty</div>
                                <div className="th-item">Price</div>
                                <div className="th-item">Reason</div>
                                <div className="th-item">Time</div>
                            </div>

                            <div className="empty-state">
                                <p>No rejection logs found</p>
                            </div>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default RejectionLogHistory;