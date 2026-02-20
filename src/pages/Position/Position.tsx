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
            if (response.positions) {
                setPositions(response.positions);
                setSummary(prev => ({
                    ...prev,
                    realised: response.summary.realised_pnl || 0,
                    credit: response.summary.credit || prev.credit
                }));
            } else {
                setPositions(response);
            }
        } catch (error) {
            console.error('Error fetching positions', error);
        } finally {
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        fetchPositions();
    });

    useEffect(() => {
        liveRateV2Service.onMarketData((rates: any[]) => {
            setLiveRates(rates);
        });
    }, []);

    // Calculate P&L whenever rates or positions change
    useEffect(() => {
        // We always want to recalculate based on current state, even if positions is empty (to reset values)
        let totalM2M = 0;
        let totalMarginUsed = 0;

        const updatedPositions = positions.map(pos => {
            const rate = liveRates.find(r => r.commodity == pos.symbol);
            if (rate) {
                // If user BOUGHT (Long), they will SELL to close. CMP = BID (Sell Price)
                // If user SOLD (Short), they will BUY to close. CMP = ASK (Buy Price)
                const cmp = pos.action === 'Buy' ? parseFloat(rate.bid) : parseFloat(rate.ask);
                const Buydiff = Math.round(cmp - pos.atp);
                const SellDiff = Math.round(pos.atp - cmp);
                const pnl = pos.action === 'Buy'
                    ? (Buydiff) * pos.quantity * pos.lot_size
                    : (SellDiff) * pos.quantity * pos.lot_size;

                totalM2M += pnl;

                // Estimate Margin Used: (Price * Qty * LotSize) / 100 (Assuming 100x leverage for example)
                // Adjust leverage factor as needed. Standard MCX margins are around 5-10%, so / 20 might be safer?
                // Using / 100 for now as per common high-leverage apps, or stick to what looks good. 
                // Let's use 100x leverage (1%) for now explicitly.
                const tradeValue = cmp * pos.quantity * pos.lot_size;
                const margin = tradeValue / 100;
                totalMarginUsed += margin;

                return { ...pos, cmp, pnl };
            }

            // Fallback if no live rate, use ATP to estimate margin
            const estValue = pos.atp * pos.quantity * pos.lot_size;
            totalMarginUsed += (estValue / 100);

            return pos;
        });

        // Loop only updates positions if we have new data to avoid infinite loop if we setPositions inside effect dependent on positions
        // Ideally we should separate "display positions" from "source positions" or strictly control updates.
        // For now, only update if PNL changed to avoid jitter, but we need to update Summary regardless.

        // Update summary
        setSummary(prev => {
            const newEquity = prev.credit + totalM2M + prev.realised;
            return {
                ...prev,
                m2m: totalM2M,
                total: totalM2M + prev.realised,
                equity: newEquity,
                marginUsed: totalMarginUsed,
                freeMargin: newEquity - totalMarginUsed
            };
        });

    }, [liveRates, positions.length]); // Only re-run if liveRates change or number of positions change. NOT if values inside positions change.

    // Second effect to update the displayed list with live PnL without causing loops
    useEffect(() => {
        if (positions.length === 0 || liveRates.length === 0) return;

        setPositions(prevPositions => {
            return prevPositions.map(pos => {
                const rate = liveRates.find(r => r.commodity == pos.symbol);
                if (rate) {
                    const cmp = pos.action === 'Buy' ? parseFloat(rate.bid) : parseFloat(rate.ask);
                    const Buydiff = Math.round(cmp - pos.atp);
                    const SellDiff = Math.round(pos.atp - cmp);
                    const pnl = pos.action === 'Buy'
                        ? (Buydiff) * pos.quantity * pos.lot_size
                        : (SellDiff) * pos.quantity * pos.lot_size;

                    // Only return new object if changed
                    if (pos.cmp !== cmp || pos.pnl !== pnl) {
                        return { ...pos, cmp, pnl };
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

            {/* <div className="ticker-banner">
                <IonIcon icon={megaphoneOutline} className="megaphone" />
                <div className="marquee-wrapper">
                    <span className="marquee-text">Quotation. | NSE - SCRIPT - ONGC ME 6.25/- RS</span>
                </div>
            </div> */}

            <IonContent className="position-content">
                {/* Collapsible Summary Card */}
                <div className={`summary-card ${isExpanded ? 'expanded' : ''}`}>
                    <div className="position-summary-header" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="title-section">
                            <IonIcon icon={isExpanded ? chevronUpOutline : chevronDownOutline} />
                            <span>Total</span>
                        </div>
                        <div className={`summary-value ${summary.total >= 0 ? 'up' : 'down'}`}>
                            {summary.total.toFixed(0)}
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="summary-details">
                            <div className="detail-row">
                                <span>M2M P&L</span>
                                <span className={summary.m2m >= 0 ? 'up' : 'down'}>{summary.m2m.toFixed(0)}</span>
                            </div>
                            <div className="detail-row">
                                <span>Realised P&L</span>
                                <span className={summary.realised >= 0 ? 'up' : 'down'}>{summary.realised.toFixed(0)}</span>
                            </div>
                            <div className="detail-row">
                                <span>Credit</span>
                                <strong>{summary.credit.toFixed(0)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Equity</span>
                                <strong>{summary.equity.toFixed(0)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Margin Used</span>
                                <strong>{summary.marginUsed.toFixed(0)}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Free Margin</span>
                                <strong>{summary.freeMargin.toFixed(0)}</strong>
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
                            {positions.map((pos, idx) => (
                                <div key={idx} className="position-item" onClick={() => handlePositionClick(pos)}>
                                    <div className="pos-top">
                                        <span className="pos-symbol">MCX {pos.name}</span>
                                        <span className={`pos-pnl ${pos.pnl && pos.pnl >= 0 ? 'up' : 'down'}`}>
                                            {pos.pnl ? pos.pnl.toFixed(0) : '0'}
                                        </span>
                                    </div>
                                    <div className="pos-middle">
                                        <span className={`pos-action ${pos.action.toLowerCase()}`}>{pos.action.toUpperCase()}</span>
                                        <div className="pos-qty">
                                            <IonIcon icon={briefcaseOutline} />
                                            <span>{pos.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="pos-bottom">
                                        <div className="atp-cmp">
                                            <span className="label">ATP</span>
                                            <span className="atp-val">{pos.atp.toFixed(0)}</span>
                                            <span className="divider">|</span>
                                            <span className="label">CMP</span>
                                            <span className="cmp-val">{pos.cmp ? pos.cmp.toFixed(0) : '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {positions.length === 0 && (
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
