import React, { useState, useEffect } from 'react';
import {
    IonContent, IonModal, IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/react';
import { statsChartOutline, informationCircleOutline, listOutline, addOutline, removeOutline, chevronUpOutline, chevronDownOutline } from 'ionicons/icons';
import TradeService from '../../../services/TradeService';
import { marketTimingService } from '../../../services/MarketTimingService';
import Loader from '../../../components/Loader/Loader';
import { useToast } from '../../../components/Toast/Toast';
import './OrderSheet.css';

interface OrderSheetProps {
    quote: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const OrderSheet: React.FC<OrderSheetProps> = ({ quote, isOpen, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState<'Market' | 'Limit' | 'SL'>('Market');
    const [price, setPrice] = useState<number>(0);
    const [lotSize, setLotSize] = useState<number>(100);
    const [quantity, setQuantity] = useState<number>(1.0);
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
    const [showLotGrid, setShowLotGrid] = useState<boolean>(false);
    const lotOptions = [5, 10, 50, 100, 250, 500, 1000, 2500];

    useEffect(() => {
        const initSheet = async () => {
            if (isOpen && quote) {
                setPrice(quote.price);
                const symbol = quote.original?.commodity || quote.symbol || '';

                // Fetch lot size map from backend
                const backendMap = await TradeService.getLotSizeMap();
                const mappedLot = backendMap[symbol.toUpperCase()] || quote.lotSize || quote.original?.lot_size || 100;
                setLotSize(mappedLot);
            }
        };
        initSheet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Timer to update time every 2 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    const safefix = (val: any, decimals: number = 0) => {
        const n = Number(val);
        return isNaN(n) ? '0' : n.toFixed(decimals);
    };

    const [lockCountdown, setLockCountdown] = useState<number>(0);
    const [isCheckingProfit, setIsCheckingProfit] = useState(false);

    useEffect(() => {
        let timer: any;
        if (lockCountdown > 0) {
            timer = setInterval(() => {
                setLockCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [lockCountdown]);

    if (!quote) return null;

    const incrementPrice = () => setPrice((prev) => prev + 1);
    const decrementPrice = () => setPrice((prev) => prev - 1);

    const incrementQty = () => setQuantity((prev) => prev + 1);
    const decrementQty = () => setQuantity((prev) => Math.max(1, prev - 1));


    const handleTrade = async (action: 'Buy' | 'Sell') => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const lockTimingValue = Number(user.lock_timing || 0);

        if (action === 'Sell' && lockTimingValue > 0 && lockCountdown === 0) {
            setIsCheckingProfit(true);
            try {
                // Fetch positions to check profit
                const response = await TradeService.getPositions();

                if (response) {
                    const realised = response.summary?.realised_pnl || 0;
                    let m2m = 0;

                    // Calculate M2M for all open positions
                    if (Array.isArray(response.positions)) {
                        for (const pos of response.positions) {
                            let cmp = 0;
                            // Check if this position is the same as the current quote
                            if (pos.symbol === (quote.original?.commodity || quote.symbol)) {
                                cmp = quote.price;
                            } else {
                                // Fallback to ATP if we don't have live rate for other symbols
                                cmp = pos.atp;
                            }

                            const Buydiff = cmp - pos.atp;
                            const SellDiff = pos.atp - cmp;
                            const pnl = pos.action === 'Buy'
                                ? (Buydiff) * pos.quantity * pos.lot_size
                                : (SellDiff) * pos.quantity * pos.lot_size;
                            m2m += pnl;
                        }
                    }

                    const totalPnL = realised + m2m;

                    if (totalPnL > 0) {
                        setLockCountdown(lockTimingValue);
                        showToast(`Profit Lock: Wait ${lockTimingValue}s to sell.`, 'error');
                        setIsCheckingProfit(false);
                        return;
                    }
                }
            } catch (err) {
                console.error('Error checking profit status', err);
            } finally {
                setIsCheckingProfit(false);
            }
        }

        setProcessing(true);
        try {
            await TradeService.placeOrder({
                name: `MCX ${quote.name}`,
                symbol: quote.original?.commodity || quote.name,
                symbol_instrument: quote.original?.instrument || 'FUTCOM',
                symbol_expiry: quote.original?.expiry || '',
                order_type: activeTab,
                action: action,
                quantity: quantity,
                lot_size: lotSize,
                price: activeTab === 'Market' ? quote.price : price,
                username: user.userName || user.Username || 'Unknown',
                device: 'Mobile',
            });
            showToast('Order placed successfully!', 'success');
            setLockCountdown(0); // Reset lock
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            showToast(error.message || 'Failed to place order.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            initialBreakpoint={0.85}
            breakpoints={[0, 0.85, 1]}
            className="minimal-canvas"
        >
            <IonContent className="ion-padding">
                {processing && (
                    <div className="processing-overlay">
                        <Loader />
                    </div>
                )}
                <div className="canvas-wrapper">
                    {/* Header Info from */}
                    <div className="canvas-header">
                        <div className="header-top-row">
                            <h3>
                                {`MCX ${quote.name}`}
                                <div className={`price-change-row ${Number(quote.change) >= 0 ? 'up' : 'down'}`}>
                                    {safefix(quote.change)} ({safefix(quote.changePercent, 2)}%)
                                </div>
                            </h3>

                            {/* Nawa Rate Section (Dono rates de naal) */}
                            <div className="price-details-wrapper">
                                <div className="rate-boxes">
                                    <span className={`rate-box ${quote.tickClass}`}>{safefix(quote.price)}</span>
                                    {/* Using Close as the second price to match list view */}
                                    <span className={`rate-box ${quote.tickClass}`}>{quote.close ? safefix(quote.close) : safefix(quote.price)}</span>
                                </div>
                                <div className="hl-info">
                                    L: {safefix(quote.low)} H: {safefix(quote.high)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Type Tabs */}
                    <div className="order-tabs">
                        {(['Market', 'Limit', 'SL'] as const).map((tab) => (
                            <button
                                key={tab}
                                className={`tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Inputs Row */}
                    <div className="inputs-wrapper">
                        {/* Price Input Row for Limit/SL */}
                        {activeTab !== 'Market' && (
                            <div className="price-input-row">
                                <span style={{ fontWeight: 600 }}>Price</span>
                                <div className="counter-controls">
                                    <button className="cnt-btn" onClick={decrementPrice}><IonIcon icon={removeOutline} /></button>
                                    <span className="qty-val">{safefix(price)}</span>
                                    <button className="cnt-btn" onClick={incrementPrice}><IonIcon icon={addOutline} /></button>
                                </div>
                            </div>
                        )}

                        <div className="input-grid">
                            <div className="input-container lot-toggle" onClick={() => setShowLotGrid(!showLotGrid)}>
                                <span className="lot-label">Lot {safefix(lotSize)}</span>
                                <IonIcon icon={showLotGrid ? chevronUpOutline : chevronDownOutline} className="lot-arrow" />
                            </div>
                            <div className="counter-container">
                                <button className="cnt-btn" onClick={decrementQty}><IonIcon icon={removeOutline} /></button>
                                <span className="qty-val">{safefix(quantity)}</span>
                                <button className="cnt-btn" onClick={incrementQty}><IonIcon icon={addOutline} /></button>
                            </div>
                        </div>

                        {/* LOT Preset Grid */}
                        {showLotGrid && (
                            <div className="lot-preset-grid">
                                {lotOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        className={`preset-btn ${quantity === opt ? 'active' : ''}`}
                                        onClick={() => {
                                            setQuantity(opt);
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trade Actions - Buy uses your premium gradient */}
                    <div className="button-group">
                        <button
                            className="minimal-btn sell"
                            onClick={() => handleTrade('Sell')}
                            disabled={processing || isCheckingProfit || lockCountdown > 0}
                        >
                            {lockCountdown > 0 ? `WAIT (${lockCountdown})` : 'SELL'}
                        </button>
                        <button className="premium-btn buy" onClick={() => handleTrade('Buy')} disabled={processing || isCheckingProfit}>BUY</button>
                    </div>

                    {/* Utility Row */}
                    <div className="utility-row">
                        <div className="u-item"><IonIcon icon={statsChartOutline} /> Chart</div>
                        <div className="u-item"><IonIcon icon={listOutline} /> Market Depth</div>
                        <div className="u-item"><IonIcon icon={informationCircleOutline} /> Info</div>
                    </div>

                    {/* Full Data Grid as seen in */}
                    <IonGrid className="data-info-grid">
                        <IonRow>
                            <IonCol size="3"><span>Open</span><p>{safefix(quote.open)}</p></IonCol>
                            <IonCol size="3"><span>High</span><p>{safefix(quote.high)}</p></IonCol>
                            <IonCol size="3"><span>Low</span><p>{safefix(quote.low)}</p></IonCol>
                            <IonCol size="3"><span>Close</span><p>{safefix(quote.close)}</p></IonCol>
                        </IonRow>
                        <IonRow className="stats-row">
                            <IonCol size="6"><div className="stat"><span>LTP</span> <strong>{safefix(quote.price)}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Time </span> <strong>{currentTime}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Volume</span> <strong>{quote.original?.vol_lots || '-'}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Avg. Price</span> <strong>{quote.original?.oi_lots || '-'}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Units</span> <strong>{quote.original?.unit || '1.0'}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Volume Step</span> <strong>1.0</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Lotsize</span> <strong>{safefix(lotSize)}</strong></div></IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default OrderSheet;