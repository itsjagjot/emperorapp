import React, { useState, useEffect } from 'react';
import {
    IonContent, IonPage, IonLabel, IonSearchbar,
    IonIcon, IonButton, IonList, IonToolbar, IonSegment, IonSegmentButton,
    IonModal, useIonAlert, useIonToast, IonFooter
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import CommonHeader from '../../components/CommonHeader';
import TradeService, { TradeOrder } from '../../services/TradeService';
import Loader from '../../components/Loader/Loader';
import FilterModal from '../../components/FilterModal/FilterModal';
import {
    optionsOutline, briefcaseOutline,
    personOutline, timeOutline, documentTextOutline
} from 'ionicons/icons';
import './Trade.css';

// Detail View Component
const DetailModal: React.FC<{
    isOpen: boolean,
    trade: TradeOrder | null,
    onClose: () => void,
    formatDate: (d: any) => string,
    onCancel: (tradeId: number) => void
}> = ({ isOpen, trade, onClose, formatDate, onCancel }) => {
    if (!trade) return null;
    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            initialBreakpoint={0.5}
            breakpoints={[0, 0.5, 0.8]}
            className="trade-detail-modal"
        >
            <IonContent className="ion-padding">
                <div className="detail-wrapper">
                    <div className="detail-header">
                        <div className="header-main">
                            <h3>{trade.name}</h3>
                            <div className={`price-badge ${(trade.action || '').toLowerCase()}`}>
                                {Number(trade.price).toFixed(1)}
                            </div>
                        </div>
                        <div className="header-sub">
                            <span className={`action-tag ${(trade.action || '').toLowerCase()}`}>{trade.action}</span>
                            <div className="qty-tag">
                                <IonIcon icon={briefcaseOutline} />
                                <span>{Number(trade.quantity).toFixed(1)}</span>
                            </div>
                            <div className="duration-tag">
                                <IonIcon icon={briefcaseOutline} />
                                <span>{trade.duration || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-info-row grey-bg">
                        <div className="info-item">
                            <IonIcon icon={personOutline} />
                            <span>{trade.username}</span>
                        </div>
                        <div className="info-item">
                            <IonIcon icon={timeOutline} />
                            <span>{formatDate(trade.order_time)}</span>
                        </div>
                    </div>

                    <div className="detail-table">
                        <div className="table-row"><span>UserName</span><strong>{trade.username}</strong></div>
                        <div className="table-row"><span>OrderTime</span><strong>{formatDate(trade.order_time)}</strong></div>
                        <div className="table-row"><span>Symbol</span><strong>{trade.symbol}</strong></div>
                        <div className="table-row"><span>Order Type</span><strong>{trade.order_type}</strong></div>
                        <div className="table-row"><span>Deals</span><strong>{Number(trade.deals).toFixed(1)}</strong></div>
                        <div className="table-row"><span>Quantity</span><strong>{Number(trade.quantity).toFixed(1)}</strong></div>
                        <div className="table-row"><span>Price</span><strong>{Number(trade.price).toFixed(1)}</strong></div>
                        <div className="table-row"><span>Brk</span><strong>{Number(trade.brokerage).toFixed(3)}</strong></div>
                    </div>

                    {trade.status === 'Pending' && (
                        <div style={{ padding: '16px 0 0 0', textAlign: 'center' }}>
                            <IonButton
                                color="danger"
                                onClick={() => onCancel(trade.id!)}
                                style={{ margin: 0, '--border-radius': '20px', fontSize: '13px' }}
                            >
                                Cancel Order
                            </IonButton>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonModal>
    );
};

const Trade: React.FC = () => {
    const history = useHistory();
    const [selectedTab, setSelectedTab] = useState('success');
    const [trades, setTrades] = useState<TradeOrder[]>([]);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<TradeOrder | null>(null);
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();

    // Filter persistence
    const todayObj = new Date();
    const today = todayObj.toISOString().split('T')[0];
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(todayObj.getDate() - 14);
    const minDate = fifteenDaysAgo.toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        fromDate: minDate,
        toDate: today,
        exchange: '',
        symbol: ''
    });

    const fetchTrades = async () => {
        setLoading(true);
        try {
            const statusMap: any = {
                success: 'Success',
                pending: 'Pending',
                deals: 'Success'
            };

            const data = await TradeService.getOrders(statusMap[selectedTab], {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                exchange: filters.exchange,
                symbol: filters.symbol
            });
            setTrades(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch trades', error);
            setTrades([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [filters, selectedTab]);

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

    const handleCancelOrder = (tradeId: number) => {
        presentAlert({
            header: 'Cancel Order',
            message: 'Are you sure you want to cancel this order?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                },
                {
                    text: 'Yes, Cancel',
                    handler: async () => {
                        setLoading(true);
                        try {
                            await TradeService.cancelOrder(tradeId);
                            presentToast({
                                message: 'Order cancelled successfully',
                                duration: 2000,
                                color: 'success'
                            });
                            setShowDetail(false);
                            fetchTrades();
                        } catch (error: any) {
                            presentToast({
                                message: error.message || 'Failed to cancel order',
                                duration: 3000,
                                color: 'danger'
                            });
                            setLoading(false);
                        }
                    },
                },
            ],
        });
    };

    const handleCancelAllPending = () => {
        presentAlert({
            header: 'Cancel All Pending Orders',
            message: 'Are you sure you want to cancel all pending orders?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel',
                },
                {
                    text: 'Yes, Cancel All',
                    handler: async () => {
                        setLoading(true);
                        try {
                            await TradeService.cancelAllPending();
                            presentToast({
                                message: 'All pending orders cancelled successfully',
                                duration: 2000,
                                color: 'success'
                            });
                            fetchTrades();
                        } catch (error: any) {
                            presentToast({
                                message: error.message || 'Failed to cancel orders',
                                duration: 3000,
                                color: 'danger'
                            });
                            setLoading(false);
                        }
                    },
                },
            ],
        });
    };

    const formatDate = (dateStr: any) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    };

    const applyFilters = (newFilters: any) => {
        setFilters(newFilters);
        setShowFilter(false);
    };

    const resetFilters = () => {
        setFilters({
            fromDate: minDate,
            toDate: today,
            exchange: '',
            symbol: ''
        });
        setShowFilter(false);
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
                <IonButton fill="clear" className="trade-filter-btn" onClick={() => setShowFilter(true)}>
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
                                    <span className={`price-val ${(trade.action || '').toLowerCase()}`}>
                                        {Number(trade.price).toFixed(1)}
                                    </span>
                                </div>
                                <div className="card-row middle">
                                    <div className="action-qty">
                                        <span className={`action-badge ${(trade.action || '').toLowerCase() == 'buy' ? 'high' : 'low'}`}>{trade.action.toUpperCase()}</span>
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

                <DetailModal
                    isOpen={showDetail}
                    trade={selectedTrade}
                    onClose={() => setShowDetail(false)}
                    formatDate={formatDate}
                    onCancel={handleCancelOrder}
                />

                <FilterModal
                    isOpen={showFilter}
                    onClose={() => setShowFilter(false)}
                    onApply={applyFilters}
                    onReset={resetFilters}
                    showDateFilter={true}
                    showExchangeFilter={true}
                    showScriptFilter={true}
                    initialFilters={filters}
                />
            </IonContent>

            {/* Cancel All Pending Button */}
            {selectedTab === 'pending' && trades.length > 0 && (
                <IonFooter className="ion-no-border">
                    <IonToolbar style={{ padding: '8px 16px', '--background': 'var(--ion-background-color, #f4f5f8)', textAlign: 'center' }}>
                        <IonButton
                            color="danger"
                            onClick={handleCancelAllPending}
                            style={{ margin: 0, '--border-radius': '20px', fontSize: '13px' }}
                        >
                            Cancel All Pending Orders
                        </IonButton>
                    </IonToolbar>
                </IonFooter>
            )}
        </IonPage>
    );
};

export default Trade;
