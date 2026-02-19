import React, { useEffect, useState } from 'react';
import {
    IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle
} from '@ionic/react';
import { useLocation, useParams } from 'react-router-dom';
import TradeService, { TradeOrder } from '../../services/TradeService';
import './OrderDetails.css';

const OrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation<{ trade: TradeOrder }>();
    const [trade, setTrade] = useState<TradeOrder | null>(location.state?.trade || null);

    const formatDate = (dateStr: any) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border order-details-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/app/trade" />
                    </IonButtons>
                    <IonTitle>Order Details</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="order-details-content">
                <div className="details-container">
                    <div className="table-wrapper">
                        <table className="details-table">
                            <thead>
                                <tr>
                                    <th>Sr.</th>
                                    <th>Symbol</th>
                                    <th>Type</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Execution Time</th>
                                    <th>Duration</th>
                                    <th>Deal (P&L)</th>
                                    <th>Status</th>
                                    <th>Square</th>
                                    <th>Device</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trade && (
                                    <tr>
                                        <td>1</td>
                                        <td>{trade.symbol}</td>
                                        <td>
                                            <span className={`type-badge ${trade.action.toLowerCase()}`}>
                                                {trade.action.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{Number(trade.quantity).toFixed(1)}</td>
                                        <td>{Number(trade.price).toFixed(1)}</td>
                                        <td>{formatDate(trade.execution_time)}</td>
                                        <td>{trade.duration || '-'}</td>
                                        <td>
                                            <span className={`deal-val ${Number(trade.deals) >= 0 ? 'up' : 'down'}`}>
                                                {Number(trade.deals).toFixed(1)}
                                            </span>
                                        </td>
                                        <td>{trade.status}</td>
                                        <td>{trade.square ?? 0}</td>
                                        <td>{trade.device || 'Mobile'}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!trade && (
                        <div className="no-trade">
                            <p>Loading trade details...</p>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default OrderDetails;
