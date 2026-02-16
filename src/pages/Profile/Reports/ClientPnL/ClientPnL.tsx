import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter'; // Path check kar lvo
import './ClientPnL.css';

const ClientPnL: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Client P&L Summary" />
            <IonContent className="admin-bg">

                <div className="client-pnl-wrapper">

                    {/* Row 1: Time Period Filter (Using your DateFilter) */}
                    <div className="full-width">
                        <DateFilter />
                    </div>

                    {/* Row 2: Exchange and Script - Matching image_605608 */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect placeholder="Exchange" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="NSE">NSE</IonSelectOption>
                                <IonSelectOption value="MCX">MCX</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect placeholder="All Script" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="all">All Script</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {/* Row 3: User Select and Action Buttons - Matching image_605608 */}
                    <div className="filter-row">
                        <div className="filter-card flex-grow">
                            <IonSelect placeholder="All User" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="all">All User</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="action-btns">
                            <button className="btn-view">View</button>
                            <button className="btn-reset">Reset</button>
                        </div>
                    </div>

                    {/* Row 4: Search Bar */}
                    <div className="search-container">
                        <IonSearchbar
                            placeholder="Search by username"
                            className="pnl-searchbar"
                            inputMode="search"
                        />
                    </div>

                </div>

                {/* Content Area */}
                <div className="empty-state">
                    <p>Coming Soon...</p>
                </div>

            </IonContent>
        </IonPage>
    );
};

export default ClientPnL;