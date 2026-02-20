import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonSegment, IonSegmentButton, IonLabel, IonSearchbar,
    IonIcon, IonButtons, IonButton, IonList, IonItem, IonModal,
    useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
    optionsOutline, megaphoneOutline, briefcaseOutline,
    personOutline, timeOutline, chevronDownOutline, documentTextOutline
} from 'ionicons/icons';
import './Trade.css';
import CommonHeader from '../../components/CommonHeader';
import TradeService, { TradeOrder } from '../../services/TradeService';
import Loader from '../../components/Loader/Loader';

const Trade: React.FC = () => {
    const history = useHistory();
    const [selectedTab, setSelectedTab] = useState('success');
    const [trades, setTrades] = useState<TradeOrder[]>([]);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<TradeOrder | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchTrades = async () => {
        setLoading(true);
        try {
            // Mapping UI tabs to backend statuses
            const statusMap: any = {
                success: 'Success',
                pending: 'Pending',
                deals: 'Success' // Deals are also executed trades
            };
            const data = await TradeService.getOrders(statusMap[selectedTab]);
            setTrades(data);
        } catch (error) {
            console.error('Failed to fetch trades', error);
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        fetchTrades();
    });

    useEffect(() => {
        fetchTrades();
    }, [selectedTab]);

    const handleTradeClick = (trade: TradeOrder) => {
        setSelectedTrade(trade);
        setShowDetail(true);
    };

    const handleDurationClick = (e: React.MouseEvent, trade: TradeOrder) => {
        e.stopPropagation();
        history.push({
            pathname: `/app/trade/details/${trade.id}`,
            state: { trade }
        });
    };

    const formatDate = (dateStr: any) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    };

    return (
        <IonPage>
            <CommonHeader
                title="Trade"
                backLink="back()"
                actionIcon={documentTextOutline}
                onAction={() => history.push('/app/reports/generate-bill')}
            />

            {/* <div className="trade-ticker">
                <IonIcon icon={megaphoneOutline} className="ticker-icon" />
                <div className="marquee-wrapper">
                    <div className="marquee-content">
                        NCDEX - CASTOR COCUDAKL GUARGUM5 GL ... LIVE RATES UPDATING ...
                    </div>
                </div>
            </div> */}

            <IonToolbar className="segment-toolbar">
                <IonSegment
                    value={selectedTab}
                    onIonChange={(e) => setSelectedTab(e.detail.value as string)}
                    mode="md"
                >
                    <IonSegmentButton value="success">
                        <IonLabel>SUCCESS</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="pending">
                        <IonLabel>PENDING</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="deals">
                        <IonLabel>DEALS</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
            </IonToolbar>

            <div className="search-filter-row">
                <IonSearchbar
                    placeholder="Search"
                    mode="md"
                    className="trade-search"
                />
                <IonButton fill="clear" className="filter-btn">
                    <IonIcon slot="icon-only" icon={optionsOutline} />
                </IonButton>
            </div>

            <IonContent className="trade-content">
                {loading ? (
                    <Loader />
                ) : trades.length > 0 ? (
                    <IonList className="trade-list">
                        {trades.map((trade) => (
                            <div key={trade.id} className="trade-card" onClick={() => handleTradeClick(trade)}>
                                <div className="card-row top">
                                    <span className="symbol-name">{trade.name}</span>
                                    <span className={`price-val ${trade.action.toLowerCase()}`}>
                                        {Number(trade.price).toFixed(1)}
                                    </span>
                                </div>
                                <div className="card-row middle">
                                    <div className="action-qty">
                                        <span className={`action-badge ${trade.action.toLowerCase() == 'buy' ? 'high' : 'low'}`}>{trade.action.toUpperCase()}</span>
                                        <div className="qty-info">
                                            <IonIcon icon={briefcaseOutline} />
                                            <span>{Number(trade.quantity).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <span className="trade-timestamp">{formatDate(trade.order_time)}</span>
                                </div>
                                <div className="card-row bottom">
                                    <div className="user-info">
                                        <IonIcon icon={personOutline} />
                                        <span>{trade.username}</span>
                                    </div>
                                    <div className="duration-info" onClick={(e) => handleDurationClick(e, trade)}>
                                        <IonIcon icon={briefcaseOutline} />
                                        <span>{trade.duration || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </IonList>
                ) : (
                    <div className="empty-state-wrapper">
                        <div className="no-data-illustration">
                            <img src="assets/no-data.png" alt="No Data" className="empty-img" onError={(e: any) => e.target.style.display = 'none'} />
                            <h3 className="empty-text">No record's found</h3>
                        </div>
                    </div>
                )}

                {/* Trade Detail Modal */}
                <IonModal
                    isOpen={showDetail}
                    onDidDismiss={() => setShowDetail(false)}
                    initialBreakpoint={0.5}
                    breakpoints={[0, 0.5, 0.8]}
                    className="trade-detail-modal"
                >
                    <div className="modal-handle"></div>
                    <IonContent className="ion-padding">
                        {selectedTrade && (
                            <div className="detail-wrapper">
                                <div className="detail-header">
                                    <div className="header-main">
                                        <h3>{selectedTrade.name}</h3>
                                        <div className={`price-badge ${selectedTrade.action.toLowerCase()}`}>
                                            {Number(selectedTrade.price).toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="header-sub">
                                        <span className={`action-tag ${selectedTrade.action.toLowerCase()}`}>{selectedTrade.action}</span>
                                        <div className="qty-tag">
                                            <IonIcon icon={briefcaseOutline} />
                                            <span>{Number(selectedTrade.quantity).toFixed(1)}</span>
                                        </div>
                                        <div className="duration-tag">
                                            <IonIcon icon={briefcaseOutline} />
                                            <span>{selectedTrade.duration || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-info-row grey-bg">
                                    <div className="info-item">
                                        <IonIcon icon={personOutline} />
                                        <span>{selectedTrade.username}</span>
                                    </div>
                                    <div className="info-item">
                                        <IonIcon icon={timeOutline} />
                                        <span>{formatDate(selectedTrade.order_time)}</span>
                                    </div>
                                </div>

                                <div className="detail-table">
                                    <div className="table-row"><span>UserName</span><strong>{selectedTrade.username}</strong></div>
                                    <div className="table-row"><span>OrderTime</span><strong>{formatDate(selectedTrade.order_time)}</strong></div>
                                    <div className="table-row"><span>Symbol</span><strong>{selectedTrade.symbol}</strong></div>
                                    <div className="table-row"><span>Order Type</span><strong>{selectedTrade.order_type}</strong></div>
                                    <div className="table-row"><span>Deals</span><strong>{Number(selectedTrade.deals).toFixed(1)}</strong></div>
                                    <div className="table-row"><span>Quantity</span><strong>{Number(selectedTrade.quantity).toFixed(1)}</strong></div>
                                    <div className="table-row"><span>Price</span><strong>{Number(selectedTrade.price).toFixed(1)}</strong></div>
                                    <div className="table-row"><span>Brk</span><strong>{Number(selectedTrade.brokerage).toFixed(3)}</strong></div>
                                </div>
                            </div>
                        )}
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default Trade;
