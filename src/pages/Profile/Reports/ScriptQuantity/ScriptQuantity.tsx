import React from 'react';
import {
    IonContent, IonPage, IonSelect, IonSelectOption, IonIcon
} from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import CommonHeader from '../../../../components/CommonHeader';
import './ScriptQuantity.css';

const ScriptQuantity: React.FC = () => {
    return (
        <IonPage>
            <CommonHeader title="Script Quantity" />
            <IonContent className="admin-bg">

                <div className="script-qty-wrapper">

                    {/* Row 1: Exchange and User Dropdowns */}
                    <div className="filter-row">
                        <div className="filter-card half-width">
                            <IonSelect value="NSE" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="NSE">NSE</IonSelectOption>
                                <IonSelectOption value="MCX">MCX</IonSelectOption>
                            </IonSelect>
                        </div>
                        <div className="filter-card half-width">
                            <IonSelect value="Ks01" interface="action-sheet" className="brand-select">
                                <IonSelectOption value="Ks01">Ks01</IonSelectOption>
                            </IonSelect>
                        </div>
                    </div>

                    {/* View Button - Full Width */}
                    <button className="btn-view-full-large">
                        View
                    </button>

                    {/* Group Name Info Bar */}
                    <div className="info-bar">
                        <span className="info-label">Group Name :</span>
                        <span className="info-value">NSE default</span>
                    </div>

                    {/* Table Section */}
                    <div className="qty-table-container">
                        <div className="qty-table-header">
                            <div className="qty-th symbol-col">Symbol ↑</div>
                            <div className="qty-th">Breakup Qty ↑</div>
                            <div className="qty-th">Max Qty ↑</div>
                        </div>

                        <div className="qty-table-body">
                            {/* Example Rows based on image */}
                            {[
                                { name: '360ONE', breakup: '250.0', max: '250.0' },
                                { name: 'ABB', breakup: '500.0', max: '500.0' },
                                { name: 'ABCAPITAL', breakup: '2000.0', max: '2000.0' },
                                { name: 'ADANIENSOL', breakup: '500.0', max: '500.0' },
                                { name: 'ADANIENT', breakup: '500.0', max: '500.0' },
                                { name: 'ADANIGREEN', breakup: '500.0', max: '750.0' },
                            ].map((item, index) => (
                                <div className={`qty-tr ${index % 2 !== 0 ? 'alt-row' : ''}`} key={index}>
                                    <div className="qty-td symbol-col">{item.name}</div>
                                    <div className="qty-td">{item.breakup}</div>
                                    <div className="qty-td">{item.max}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </IonContent>
        </IonPage>
    );
};

export default ScriptQuantity;