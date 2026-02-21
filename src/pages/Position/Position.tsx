import React, { useState, useEffect } from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
    IonGrid, IonRow, IonCol, IonSearchbar, IonIcon,
    useIonViewWillEnter
} from '@ionic/react';
import {
    refreshOutline, megaphoneOutline, chevronUpOutline,
    chevronDownOutline, ellipsisVerticalOutline, briefcaseOutline
} from 'ionicons/icons';
import './Position.css';
import TradeService from '../../services/TradeService';
import { liveRateV2Service } from '../../services/ExiSoc/LiveRateV2';
import OrderSheet from '../Quotes/OrderSheet/OrderSheet';
import CommonHeader from '../../components/CommonHeader';
import Loader from '../../components/Loader/Loader';

interface PositionData {
    name: string;
    symbol: string;
    expiry?: string;
    action: string;
    quantity: number;
    lot_size: number;
    atp: number;
    cmp?: number;
    pnl?: number;
}

const Position: React.FC = () => {
    const [positions, setPositions] = useState<PositionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [summary, setSummary] = useState({
        total: 0,
        m2m: 0,
        realised: 0,
        credit: 200000,
        equity: 200000,
        marginUsed: 100000,
        freeMargin: 100000
    });

    const [liveRates, setLiveRates] = useState<any[]>([]);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const response = await TradeService.getPositions();
            if (response && response.positions && Array.isArray(response.positions)) {
                setPositions(response.positions);
                if (response.summary) {
                    setSummary(prev => ({
                        ...prev,
                        realised: response.summary.realised_pnl || 0,
                        credit: response.summary.credit || prev.credit
                    }));
                }
            } else if (Array.isArray(response)) {
                setPositions(response);
            } else {
                console.error('Unexpected positions response format:', response);
                setPositions([]);
            }
        } catch (error) {
            console.error('Error fetching positions', error);
            setPositions([]);
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        fetchPositions();
    });

    useEffect(() => {
        liveRateV2Service.onMarketData((rates: any[]) => {
            if (Array.isArray(rates)) {
                setLiveRates(rates);
            }
        });
    }, []);

    // Calculate P&L whenever rates or positions change
    useEffect(() => {
        if (!Array.isArray(positions)) return;

        // We always want to recalculate based on current state, even if positions is empty (to reset values)
        let totalM2M = 0;
        let totalMarginUsed = 0;

        positions.forEach(pos => {
            const rate = liveRates.find(r => r.commodity == pos.symbol);
            const posQty = Number(pos.quantity) || 0;
            const posLotSize = Number(pos.lot_size) || 0;
            const posAtp = Number(pos.atp) || 0;

            if (rate) {
                // If user BOUGHT (Long), they will SELL to close. CMP = BID (Sell Price)
                // If user SOLD (Short), they will BUY to close. CMP = ASK (Buy Price)
                const cmp = pos.action === 'Buy' ? parseFloat(rate.bid) : parseFloat(rate.ask);
                if (!isNaN(cmp)) {
                    const Buydiff = Math.round(cmp - posAtp);
                    const SellDiff = Math.round(posAtp - cmp);
                    const pnl = pos.action === 'Buy'
                        ? (Buydiff) * posQty * posLotSize
                        : (SellDiff) * posQty * posLotSize;

                    totalM2M += pnl;

                    const tradeValue = cmp * posQty * posLotSize;
                    const margin = tradeValue / 100;
                    totalMarginUsed += margin;
                }
            } else {
                // Fallback if no live rate, use ATP to estimate margin
                const estValue = posAtp * posQty * posLotSize;
                totalMarginUsed += (estValue / 100);
            }
        });

        // Update summary
        setSummary(prev => {
            const realisedPnL = Number(prev.realised) || 0;
            const credit = Number(prev.credit) || 0;
            const newEquity = credit + totalM2M + realisedPnL;
            return {
                ...prev,
                m2m: totalM2M,
                total: totalM2M + realisedPnL,
                equity: newEquity,
                marginUsed: totalMarginUsed,
                freeMargin: newEquity - totalMarginUsed
            };
        });

    }, [liveRates, positions.length]); // Only re-run if liveRates change or number of positions change. NOT if values inside positions change.

    // Second effect to update the displayed list with live PnL without causing loops
    useEffect(() => {
        if (!Array.isArray(positions) || positions.length === 0 || liveRates.length === 0) return;

        setPositions(prevPositions => {
            return prevPositions.map(pos => {
                const rate = liveRates.find(r => r.commodity == pos.symbol);
                if (rate) {
                    const cmp = pos.action === 'Buy' ? parseFloat(rate.bid) : parseFloat(rate.ask);
                    if (!isNaN(cmp)) {
                        const posAtp = Number(pos.atp) || 0;
                        const posQty = Number(pos.quantity) || 0;
                        const posLotSize = Number(pos.lot_size) || 0;
                        const Buydiff = Math.round(cmp - posAtp);
                        const SellDiff = Math.round(posAtp - cmp);
                        const pnl = pos.action === 'Buy'
                            ? (Buydiff) * posQty * posLotSize
                            : (SellDiff) * posQty * posLotSize;

                        // Only return new object if changed
                        if (pos.cmp !== cmp || pos.pnl !== pnl) {
                            return { ...pos, cmp, pnl };
                        }
                    }
                }
                return pos;
            });
        });
    }, [liveRates]);

    const handlePositionClick = (pos: PositionData) => {
        setSelectedQuoteId(pos.symbol);
    };

    const getSelectedQuote = () => {
        if (!selectedQuoteId) return null;
        const rate = liveRates.find(r => r.commodity === selectedQuoteId);
        if (!rate) return null;
        let formattedDate = '';
        if (rate.expiry && rate.expiry.length >= 5) {
            const day = rate.expiry.substring(0, 2);
            const month = rate.expiry.substring(2, 5); // APR
            formattedDate = `${month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()} ${day}`;
        }
        return {
            id: rate.commodity,
            name: `${rate.commodity}${formattedDate ? ' ' + formattedDate : ''}`,
            price: parseFloat(rate.ltp || '0'),
            high: parseFloat(rate.high || '0'),
            low: parseFloat(rate.low || '0'),
            change: parseFloat(rate.change || '0'),
            changePercent: parseFloat(rate.change_percent || '0'),
            open: parseFloat(rate.open || '0'),
            close: parseFloat(rate.close || '0'),
            original: rate,
            tickClass: ''
        };
    };

    const selectedQuote = getSelectedQuote();

    return (
        <IonPage>
            <CommonHeader title="Position" backLink="back()" />

            <IonContent className="position-content">
                {/* Collapsible Summary Card */}
                <div className={`summary-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="position-summary-header" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="title-section">
                            <IonIcon icon={isExpanded ? chevronUpOutline : chevronDownOutline} />
                            <span>Total</span>
                        </div>
                        <div className={`summary-value ${(summary.total || 0) >= 0 ? 'up' : 'down'}`}>
                            {(summary.total || 0).toFixed(0)}
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="summary-details">
                            <div className="detail-row">
                                <span>M2M P&L</span>
                                <span className={(summary.m2m || 0) >= 0 ? 'up' : 'down'}>{(summary.m2m || 0).toFixed(0)}</span>
                            </div>
                            <div className="detail-row">
                                <span>Realised P&L</span>
                                <span className={(summary.realised || 0) >= 0 ? 'up' : 'down'}>{(summary.realised || 0).toFixed(0)}</span>
                            </div>
                            <div className="detail-row">
                                <span>Credit</span>
                                <strong>{(summary.credit || 0).toFixed(0)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Equity</span>
                                <strong>{(summary.equity || 0).toFixed(0)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Margin Used</span>
                                <strong>{(summary.marginUsed || 0).toFixed(0)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Free Margin</span>
                                <strong>{(summary.freeMargin || 0).toFixed(0)}</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search Bar Wrapper */}
                <div className="search-container">
                    <IonSearchbar
                        placeholder="Search"
                        className="custom-search"
                        mode="md"
                    ></IonSearchbar>
                    <div className="search-actions">
                        <IonIcon icon={refreshOutline} className="refresh-btn" onClick={fetchPositions} />
                        <IonIcon icon={ellipsisVerticalOutline} className="menu-btn" />
                    </div>
                </div>

                {/* Position List */}
                <div className="position-list">
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            {Array.isArray(positions) && positions.map((pos, idx) => (
                                <div key={idx} className="position-item" onClick={() => handlePositionClick(pos)}>
                                    <div className="pos-top">
                                        <span className="pos-symbol">MCX {pos.name || ''}</span>
                                        <span className={`pos-pnl ${pos.pnl && pos.pnl >= 0 ? 'up' : 'down'}`}>
                                            {pos.pnl ? pos.pnl.toFixed(0) : '0'}
                                        </span>
                                    </div>
                                    <div className="pos-middle">
                                        <span className={`pos-action ${(pos.action || '').toLowerCase()}`}>{(pos.action || '').toUpperCase()}</span>
                                        <div className="pos-qty">
                                            <IonIcon icon={briefcaseOutline} />
                                            <span>{pos.quantity || 0}</span>
                                        </div>
                                    </div>
                                    <div className="pos-bottom">
                                        <div className="atp-cmp">
                                            <span className="label">ATP</span>
                                            <span className="atp-val">{(Number(pos.atp) || 0).toFixed(0)}</span>
                                            <span className="divider">|</span>
                                            <span className="label">CMP</span>
                                            <span className="cmp-val">{pos.cmp ? pos.cmp.toFixed(0) : '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!Array.isArray(positions) || positions.length === 0) && (
                                <div className="empty-state">
                                    <img src="assets/no-positions.png" alt="No positions" className="empty-img" onError={(e: any) => e.target.style.display = 'none'} />
                                    <h2 className="empty-title">No positions</h2>
                                    <p className="empty-subtitle">Place an order from your quotes</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <OrderSheet
                    quote={selectedQuote}
                    isOpen={!!selectedQuote}
                    onClose={() => setSelectedQuoteId(null)}
                    onSuccess={fetchPositions}
                />
            </IonContent>
        </IonPage>
    );
};

export default Position;
