import React, { useState, useEffect } from 'react';
import {
    IonContent, IonModal, IonIcon, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption
} from '@ionic/react';
import { statsChartOutline, informationCircleOutline, listOutline, addOutline, removeOutline } from 'ionicons/icons';
import './OrderSheet.css';

interface OrderSheetProps {
    quote: any;
    isOpen: boolean;
    onClose: () => void;
}

const OrderSheet: React.FC<OrderSheetProps> = ({ quote, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'Market' | 'Limit' | 'SL'>('Market');
    const [price, setPrice] = useState<number>(0);
    const [lotSize, setLotSize] = useState<number>(100);
    const [quantity, setQuantity] = useState<number>(1.0);
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

    const lotOptions = [5, 10, 50, 100, 250, 500, 1000, 2500];

    useEffect(() => {
        if (isOpen && quote) {
            setPrice(quote.price);
        }
    }, [isOpen]);

    // Timer to update time every 2 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    if (!quote) return null;

    const incrementPrice = () => setPrice((prev) => prev + 1);
    const decrementPrice = () => setPrice((prev) => prev - 1);

    const incrementQty = () => setQuantity((prev) => prev + 1);
    const decrementQty = () => setQuantity((prev) => Math.max(1, prev - 1));

    return (
        <IonModal
            isOpen={isOpen}
            onDidDismiss={onClose}
            initialBreakpoint={0.85}
            breakpoints={[0, 0.85, 1]}
            className="minimal-canvas"
        >
            <IonContent className="ion-padding">
                <div className="canvas-wrapper">
                    {/* Header Info from */}
                    <div className="canvas-header">
                        <div className="header-top-row">
                            <h3>
                                MCX {quote.name}
                                <div className={`price-change-row ${quote.change >= 0 ? 'up' : 'down'}`}>
                                    {quote.change.toFixed(1)} ({quote.changePercent}%)
                                </div>
                            </h3>

                            {/* Nawa Rate Section (Dono rates de naal) */}
                            <div className="price-details-wrapper">
                                <div className="rate-boxes">
                                    <span className={`rate-box ${quote.tickClass}`}>{quote.price.toFixed(1)}</span>
                                    {/* Using Close as the second price to match list view */}
                                    <span className={`rate-box ${quote.tickClass}`}>{quote.close ? quote.close.toFixed(1) : (quote.price).toFixed(1)}</span>
                                </div>
                                <div className="hl-info">
                                    L: {quote.low.toFixed(1)} H: {quote.high.toFixed(1)}
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
                                    <span className="qty-val">{price}</span>
                                    <button className="cnt-btn" onClick={incrementPrice}><IonIcon icon={addOutline} /></button>
                                </div>
                            </div>
                        )}

                        <div className="input-grid">
                            <div className="input-container">
                                <IonSelect
                                    interface="popover"
                                    value={lotSize}
                                    onIonChange={e => setLotSize(e.detail.value)}
                                    className="lot-select"
                                >
                                    {lotOptions.map(opt => (
                                        <IonSelectOption key={opt} value={opt}>Lot {opt.toFixed(1)}</IonSelectOption>
                                    ))}
                                </IonSelect>
                            </div>
                            <div className="counter-container">
                                <button className="cnt-btn" onClick={decrementQty}><IonIcon icon={removeOutline} /></button>
                                <span className="qty-val">{quantity.toFixed(1)}</span>
                                <button className="cnt-btn" onClick={incrementQty}><IonIcon icon={addOutline} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Trade Actions - Buy uses your premium gradient */}
                    <div className="button-group">
                        <button className="minimal-btn sell">SELL</button>
                        <button className="premium-btn buy">BUY</button>
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
                            <IonCol size="3"><span>Open</span><p>{quote.open}</p></IonCol>
                            <IonCol size="3"><span>High</span><p>{quote.high}</p></IonCol>
                            <IonCol size="3"><span>Low</span><p>{quote.low}</p></IonCol>
                            <IonCol size="3"><span>Close</span><p>{quote.close}</p></IonCol>
                        </IonRow>
                        <IonRow className="stats-row">
                            <IonCol size="6"><div className="stat"><span>LTP</span> <strong>{quote.price.toFixed(2)}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Time </span> <strong>{currentTime}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Volume</span> <strong>{quote.original?.vol_lots || '-'}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Avg. Price</span> <strong>{quote.original?.oi_lots || '-'}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Units</span> <strong>{quote.original?.unit || '1.0'}</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Volume Step</span> <strong>1.0</strong></div></IonCol>
                            <IonCol size="6"><div className="stat"><span>Lotsize</span> <strong>{lotSize.toFixed(1)}</strong></div></IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonModal>
    );
};

export default OrderSheet;