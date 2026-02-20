import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonSearchbar
} from '@ionic/react';
import CommonHeader from '../../../../components/CommonHeader';
import DateFilter from '../../../../components/DateFilter';
import './ScriptPnL.css';

const ScriptPnL: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Script P&L Summary" />
            <IonContent className="admin-bg">

                <div className="script-pnl-wrapper">

                    {/* Filters Section */}
                    <DateFilter />

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

                    <div className="search-container">
                        <IonSearchbar placeholder="Search" className="pnl-searchbar" />
                    </div>

                    {/* Dark Summary Bar */}
                    <div className="script-total-bar">
                        <div className="total-item">
                            <span>P&L</span>
                            <span className="val-green">0.0</span>
                        </div>
                        <div className="total-item">
                            <span>Brokerage</span>
                            <span className="val-green">0.0</span>
                        </div>
                        <div className="total-item">
                            <span>Total</span>
                            <span className="val-green">0.0</span>
                        </div>
                    </div>

                    {/* Scrollable Table Section */}
                    <div className="scrollable-table-container">
                        <div className="table-min-width">
                            {/* Table Header */}
                            <div className="table-header-row">
                                <div className="th-item desc-col">Description ↑</div>
                                <div className="th-item">NetPL</div>
                                <div className="th-item">Profit & Loss</div>
                                <div className="th-item">Brk</div>
                                <div className="th-item">Total</div>
                                <div className="th-item">M2MPL</div>
                            </div>

                            {/* Dummy Data Row */}
                            <div className="table-data-row">
                                <div className="td-item desc-col">ADANIENT Feb 24</div>
                                <div className="td-item val-blue">0.00</div>
                                <div className="td-item val-blue">0.00</div>
                                <div className="td-item val-blue">0.00</div>
                                <div className="td-item val-blue">0.00</div>
                                <div className="td-item val-blue">0.00</div>
                            </div>
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default ScriptPnL;